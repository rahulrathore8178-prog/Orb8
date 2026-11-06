const BandwidthUsage = require('../models/bandwidthUsage');
const { POOL, SERVER_ID, SOFT_LIMIT_BYTES, HARD_LIMIT_BYTES, DISABLED } = require('../config/serverPool');

const TICK_MS = 10000;
const DB_CACHE_MS = 8000;
const HEADER_OVERHEAD = 400; // approx. response header bytes

let period = currentPeriod();
let localBytes = 0;   // my total this period
let pending = 0;      // not yet written to DB
let cache = { at: 0, bytes: null };
let lastActiveId = null;
let lastActive = null;
let wasActive = null;
let warmedFor = null;
const drainListeners = [];

function currentPeriod() { return new Date().toISOString().slice(0, 7); }

function add(n) {
    if (n > 0) { localBytes += n; pending += n; }
}

async function load() {
    period = currentPeriod();
    const doc = await BandwidthUsage.findOneAndUpdate(
        { serverId: SERVER_ID, period },
        { $setOnInsert: { bytes: 0 } },
        { upsert: true, new: true }
    );
    localBytes = doc.bytes;
    pending = 0;
}

async function flush() {
    if (pending > 0) {
        const delta = pending;
        pending = 0;
        try {
            await BandwidthUsage.updateOne(
                { serverId: SERVER_ID, period },
                { $inc: { bytes: delta }, $set: { updatedAt: new Date() } },
                { upsert: true }
            );
        } catch (e) {
            pending += delta;
            console.error('bandwidth flush failed:', e.message);
        }
    }
    if (currentPeriod() !== period) await load(); // new month: counters reset
}

function build(skip = []) {
    const skipSet = new Set(skip);
    const servers = POOL.map((s) => {
        const bytes = s.id === SERVER_ID ? localBytes : (cache.bytes && cache.bytes[s.id]) || 0;
        return { id: s.id, url: s.url, bytes, full: bytes >= SOFT_LIMIT_BYTES || DISABLED.has(s.id) };
    });
    const pool = servers.filter((s) => !skipSet.has(s.id) && !DISABLED.has(s.id));
    if (!pool.length) return { active: null, exhausted: true, servers, period };
    let active = pool.find((s) => !s.full);
    let exhausted = false;
    if (!active) {
        exhausted = true; // everything is over the soft limit: use the least used
        active = [...pool].sort((a, b) => a.bytes - b.bytes)[0];
    }
    return { active: { id: active.id, url: active.url }, exhausted, servers, period };
}

async function getStatus(skip = []) {
    if (!cache.bytes || Date.now() - cache.at > DB_CACHE_MS) {
        try {
            const docs = await BandwidthUsage.find({ period }).lean();
            cache = { at: Date.now(), bytes: Object.fromEntries(docs.map((d) => [d.serverId, d.bytes])) };
        } catch (e) {
            console.error('bandwidth status read failed:', e.message);
            if (!cache.bytes) throw e;
        }
    }
    return build(skip);
}

function warmNext(st) {
    if (!st.active || st.active.id !== SERVER_ID) return;
    if (localBytes < SOFT_LIMIT_BYTES * 0.9) return;
    const next = st.servers.find((s) => s.id !== SERVER_ID && !s.full);
    if (!next || warmedFor === `${period}:${next.id}`) return;
    warmedFor = `${period}:${next.id}`;
    if (typeof fetch === 'function') {
        fetch(`${next.url}/api/system/ping`).catch(() => { });
    }
}

async function tick() {
    try {
        await flush();
        cache.at = 0;
        const st = await getStatus();
        lastActiveId = st.active?.id || null;
        lastActive = st.active || null;
        const nowActive = lastActiveId === SERVER_ID;
        if (wasActive === true && !nowActive) drainListeners.forEach((fn) => { try { fn(); } catch { } });
        wasActive = nowActive;
        warmNext(st);
    } catch (e) {
        console.error('bandwidth tick failed:', e.message);
    }
}

async function start() {
    if (!POOL.some((s) => s.id === SERVER_ID)) {
        throw new Error(`SERVER_ID "${SERVER_ID}" is missing or not in serverPool.js`);
    }
    await load();
    await tick();
    setInterval(tick, TICK_MS).unref();
}

// Counts bytes actually sent (register BEFORE compression so it sees compressed size).
function meter(req, res, next) {
    let n = HEADER_OVERHEAD;
    const origWrite = res.write;
    const origEnd = res.end;
    const size = (chunk, enc) => (chunk && typeof chunk !== 'function'
        ? Buffer.byteLength(chunk, typeof enc === 'string' ? enc : undefined) : 0);
    res.write = function (chunk, enc, cb) { n += size(chunk, enc); return origWrite.apply(this, arguments); };
    res.end = function (chunk, enc, cb) { n += size(chunk, enc); return origEnd.apply(this, arguments); };
    res.on('close', () => add(n));
    next();
}

// Tells clients who is active; refuses API traffic past the hard limit.
function gate(req, res, next) {
    if (lastActive) {
        res.setHeader('x-orbit-active', lastActive.id);
        res.setHeader('x-orbit-active-url', lastActive.url);
    }
    if (req.originalUrl.startsWith('/api/system')) return next();
    if (!lastActive || lastActive.id !== SERVER_ID || localBytes >= HARD_LIMIT_BYTES) {
        res.setHeader('Retry-After', '5');
        res.setHeader('Cache-Control', 'no-store');
        return res.status(503).json({
            code: 'SERVER_FULL',
            message: 'This server is not accepting traffic; switch server',
            active: lastActive,
        });
    }
    next();
}

module.exports = {
    start, flush, add, getStatus, meter, gate,
    onDrain: (fn) => drainListeners.push(fn),
    amActive: () => lastActiveId === SERVER_ID,
    activeId: () => lastActiveId,
    activeServer: () => lastActive,
};