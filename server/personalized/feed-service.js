'use strict';

const PostMeta = require('../src/models/post.meta');           // adjust paths to your layout
const { Post } = require('../src/models/post.model');
const { getIndex } = require('../post_details/topicresolver');
const { getProfile } = require('./profile-service');
const { decayedEntry, effective } = require('./interest-math');

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const POOL_ORDER = ['current', 'adjacent', 'explore', 'trending', 'fresh']; // also the priority order

// Starting values. Tune them with real data (and later learn them from the Event log).
const CFG = {
    listSize: 100, // ranked ids kept per refresh; pages are slices of this list
    poolLimit: 60,
    windowDays: 30,
    quotas: { current: 0.5, adjacent: 0.2, explore: 0.15, trending: 0.1, fresh: 0.05 },
    weights: { interest: 0.4, adjacency: 0.15, engagement: 0.15, recency: 0.15, social: 0.1, explore: 0.05 },
    recencyHalfLifeHours: 36,
    seenPenalty: 0.5, // posts the viewer already viewed are pushed down, not hidden (small platforms would run dry)
    minTopicConf: 0.3, // pools only match topics the post is at least this sure about
    currentMinAff: 0.05,
    blockSize: 10,
    currentTopics: 8,
    adjacentTopics: 10,
    moodWeight: 0.8, // a topic they are into THIS week counts at 0.8 x its short-term score
    maxRun: { author: 2, topic: 3 }, // variety: never more than N in a row from the same author / top topic
    cacheTtlMs: 5 * 60 * 1000,
};

const PRIOR_RATE = 0.03; // engagement points per impression assumed for a post with no data
const PRIOR_N = 20;
const RATE_CAP = 0.1;
const round3 = (n) => Math.round(n * 1000) / 1000;

// ---------------------------------------------------------------- pure logic

// Taste + mood in one number per topic: stable long-term taste, but a sudden short-term burst wins.
function affinities(interests, now = new Date(), cfg = CFG) {
    return Object.entries(interests || {})
        .map(([slug, entry]) => ({
            slug,
            aff: Math.max(effective(entry, now), cfg.moodWeight * decayedEntry(entry, now).s),
        }))
        .filter((a) => a.aff >= 0.05)
        .sort((a, b) => b.aff - a.aff);
}

const kidsCache = new WeakMap();
function childrenOf(index) {
    if (!kidsCache.has(index)) {
        const m = new Map();
        for (const t of index.bySlug.values()) {
            if (!t.parent) continue;
            if (!m.has(t.parent)) m.set(t.parent, []);
            m.get(t.parent).push(t.slug);
        }
        kidsCache.set(index, m);
    }
    return kidsCache.get(index);
}

// Neighbouring topics of what the viewer likes, with a 0..1 weight: related edges (edge weight),
// parent and children (0.5), siblings (0.4), each scaled by how much the viewer likes the source.
function buildAdjacency(index, top, exclude = new Set()) {
    const kids = childrenOf(index);
    const adj = new Map();
    const put = (slug, w) => {
        if (!slug || exclude.has(slug) || !index.bySlug.has(slug) || !(w > 0)) return;
        adj.set(slug, Math.max(adj.get(slug) || 0, w));
    };
    for (const { slug, aff } of top) {
        const t = index.bySlug.get(slug);
        if (!t) continue;
        for (const r of t.related || []) put(r.slug, aff * r.w);
        if (t.parent) {
            put(t.parent, aff * 0.5);
            for (const sib of kids.get(t.parent) || []) if (sib !== slug) put(sib, aff * 0.4);
        }
        for (const child of kids.get(slug) || []) put(child, aff * 0.5);
    }
    return adj;
}

function scoreCandidate(c, cfg = CFG) {
    const topics = c.topics || [];
    const aff = c.aff || new Map();
    const adj = c.adj || new Map();

    const interest = 1 - topics.reduce((p, t) => p * (1 - t.conf * Math.min(1, aff.get(t.slug) || 0)), 1);
    const adjacency = topics.reduce((m, t) => Math.max(m, t.conf * Math.min(1, adj.get(t.slug) || 0)), 0);
    const rate = ((c.pts || 0) + PRIOR_RATE * PRIOR_N) / ((c.imp || 0) + PRIOR_N); // smoothed: no data = neutral
    const engagement = Math.min(1, Math.max(0, rate) / RATE_CAP);
    const recency = Math.pow(0.5, Math.max(0, c.ageHours || 0) / cfg.recencyHalfLifeHours);

    const w = cfg.weights;
    let score =
        w.interest * interest +
        w.adjacency * adjacency +
        w.engagement * engagement +
        w.recency * recency +
        w.social * (c.isFriend ? 1 : 0) +
        w.explore * (c.exploring ? 1 : 0);
    if (c.seen) score *= cfg.seenPenalty;
    return score;
}

// Slots per pool: quotas by largest remainder, capped by what exists. Unfilled slots flow to the next
// pool in priority order, so a brand-new user (no interests) gets explore/trending/fresh instead of nothing.
function allocate(available, size, quotas, rotate = 0) {
    const target = {};
    const raw = POOL_ORDER.map((p) => ({ p, v: (quotas[p] || 0) * size }));
    let assigned = 0;
    for (const r of raw) {
        target[r.p] = Math.floor(r.v);
        assigned += target[r.p];
    }
    const rank = (p) => (POOL_ORDER.indexOf(p) + rotate * 2) % POOL_ORDER.length;
    const byRemainder = [...raw].sort((a, b) => (b.v % 1) - (a.v % 1) || rank(a.p) - rank(b.p));
    for (let i = 0; assigned < size && i < byRemainder.length; i++, assigned++) target[byRemainder[i].p]++;

    let shortage = 0;
    for (const p of POOL_ORDER) {
        const cap = available[p] || 0;
        if (target[p] > cap) {
            shortage += target[p] - cap;
            target[p] = cap;
        }
    }
    for (const p of POOL_ORDER) {
        if (shortage <= 0) break;
        const take = Math.min((available[p] || 0) - target[p], shortage);
        if (take > 0) {
            target[p] += take;
            shortage -= take;
        }
    }
    return target;
}

function runOk(out, c, cfg) {
    const a = out.slice(-cfg.maxRun.author);
    if (a.length === cfg.maxRun.author && a.every((x) => x.author === c.author)) return false;
    const t = out.slice(-cfg.maxRun.topic);
    if (t.length === cfg.maxRun.topic && c.topTopic && t.every((x) => x.topTopic === c.topTopic)) return false;
    return true;
}

// Interleave the pools so the quotas hold at every point of the list (not just in total), best-scored
// first inside each pool, skipping a candidate that would break the variety rules when another fits.
function mixPools(pools, size, cfg = CFG) {
    const queues = {};
    for (const p of POOL_ORDER) queues[p] = [...(pools[p] || [])];
    const out = [];

    for (let block = 0; out.length < size; block++) {
        const available = {};
        for (const p of POOL_ORDER) available[p] = queues[p].length;
        const want = Math.min(cfg.blockSize, size - out.length);
        const target = allocate(available, want, cfg.quotas, block);
        const total = POOL_ORDER.reduce((n, p) => n + target[p], 0);
        if (!total) break;

        const taken = Object.fromEntries(POOL_ORDER.map((p) => [p, 0]));
        for (let placed = 0; placed < total; placed++) {
            let pick = null;
            let best = Infinity;
            for (const p of POOL_ORDER) {
                if (taken[p] >= target[p] || !queues[p].length) continue;
                const ratio = (taken[p] + 0.5) / target[p]; // the pool most behind its quota goes next
                if (ratio < best) {
                    best = ratio;
                    pick = p;
                }
            }
            if (!pick) break;
            let idx = queues[pick].slice(0, 8).findIndex((c) => runOk(out, c, cfg));
            if (idx < 0) idx = 0;
            const [c] = queues[pick].splice(idx, 1);
            out.push({ ...c, pool: pick });
            taken[pick]++;
        }
    }
    return out;
}

// ---------------------------------------------------------------- DB part

const cache = new Map(); // viewerId -> { ids, reasons, at }. Single server; move to Redis when you have it.

/**
 * Returns the viewer's ranked list of post ids (max cfg.listSize). `filter` is the visibility filter your
 * feed already builds (active, not archived, not private/blocked authors, feed vs orbital): it is applied
 * to every candidate, so personalization can never show a post the old feed would have hidden.
 * Pass refresh=false for page 2+ so pagination stays consistent with page 1.
 */
async function getRankedFeedIds({ viewer, filter, refresh = true, cfg = CFG, now = new Date() }) {
    const key = String(viewer._id);
    const hit = cache.get(key);
    if (!refresh && hit && now - hit.at < cfg.cacheTtlMs) return { ids: hit.ids, reasons: hit.reasons, cached: true };

    const [index, profile] = await Promise.all([getIndex(), getProfile(viewer._id, null)]);
    const interests = (profile && profile.interests) || {};
    const affList = affinities(interests, now, cfg);
    const affMap = new Map(affList.map((a) => [a.slug, a.aff]));

    const currentSlugs = affList.filter((a) => a.aff >= cfg.currentMinAff).slice(0, cfg.currentTopics).map((a) => a.slug);
    const adjacency = buildAdjacency(index, affList.slice(0, cfg.currentTopics), new Set(currentSlugs));
    const adjacentSlugs = [...adjacency].sort((a, b) => b[1] - a[1]).slice(0, cfg.adjacentTopics).map(([s]) => s);

    const base = { createdAt: { $gte: new Date(now - cfg.windowDays * DAY_MS) }, author: { $ne: viewer._id } };
    const about = (slugs) => ({ topics: { $elemMatch: { slug: { $in: slugs }, conf: { $gte: cfg.minTopicConf } } } });
    const metaPool = (q, sort) => PostMeta.find({ ...base, ...q }).select('post').sort(sort).limit(cfg.poolLimit).lean();

    const [cur, adj, exp, trend, fresh] = await Promise.all([
        currentSlugs.length ? metaPool(about(currentSlugs), { createdAt: -1 }) : [],
        adjacentSlugs.length ? metaPool(about(adjacentSlugs), { createdAt: -1 }) : [],
        metaPool({ 'label.state': { $in: ['exploring', 'general'] } }, { 'audience.totalImp': 1, createdAt: -1 }),
        metaPool({}, { 'audience.totalPts': -1, createdAt: -1 }),
        Post.find(filter).select('_id').sort({ createdAt: -1 }).limit(cfg.poolLimit).lean(),
    ]);

    const poolOf = new Map(); // a post belongs to the FIRST pool that found it
    const addPool = (name, ids) => ids.forEach((id) => poolOf.has(id) || poolOf.set(id, name));
    addPool('current', cur.map((m) => String(m.post)));
    addPool('adjacent', adj.map((m) => String(m.post)));
    addPool('explore', exp.map((m) => String(m.post)));
    addPool('trending', trend.map((m) => String(m.post)));
    addPool('fresh', fresh.map((p) => String(p._id)));

    const allIds = [...poolOf.keys()];
    if (!allIds.length) return { ids: [], reasons: new Map(), cached: false };

    const [visible, metas, seenIds] = await Promise.all([
        Post.find({ ...filter, _id: { $in: allIds } }).select('_id author createdAt').lean(), // visibility rules
        PostMeta.find({ post: { $in: allIds } }).select('post topics label audience').lean(),
        Post.find({ _id: { $in: allIds }, viewedBy: viewer._id }).distinct('_id'),
    ]);
    const metaById = new Map(metas.map((m) => [String(m.post), m]));
    const seen = new Set(seenIds.map(String));
    const friends = new Set((viewer.friends || []).map(String));

    const pools = {};
    for (const post of visible) {
        const id = String(post._id);
        const meta = metaById.get(id);
        const topics = (meta && meta.topics) || [];
        const candidate = {
            id,
            author: String(post.author),
            topTopic: topics[0] && topics[0].slug,
            score: scoreCandidate(
                {
                    topics,
                    aff: affMap,
                    adj: adjacency,
                    pts: meta && meta.audience && meta.audience.totalPts,
                    imp: meta && meta.audience && meta.audience.totalImp,
                    ageHours: (now - post.createdAt) / HOUR_MS,
                    isFriend: friends.has(String(post.author)),
                    exploring: !!(meta && meta.label && meta.label.state === 'exploring'),
                    seen: seen.has(id),
                },
                cfg
            ),
        };
        (pools[poolOf.get(id)] ||= []).push(candidate);
    }
    for (const p of Object.keys(pools)) pools[p].sort((a, b) => b.score - a.score);

    const mixed = mixPools(pools, cfg.listSize, cfg);
    const ids = mixed.map((c) => c.id);
    const reasons = new Map(mixed.map((c) => [c.id, { pool: c.pool, score: round3(c.score) }]));

    cache.set(key, { ids, reasons, at: +now });
    if (cache.size > 5000) cache.delete(cache.keys().next().value); // cheap bound
    return { ids, reasons, cached: false };
}

module.exports = { CFG, POOL_ORDER, affinities, buildAdjacency, scoreCandidate, allocate, mixPools, getRankedFeedIds };