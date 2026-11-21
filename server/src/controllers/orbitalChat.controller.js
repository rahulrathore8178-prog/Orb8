const mongoose = require('mongoose');
const Orbital = require('../models/orbital.model');          // adjust path
const User = require('../models/user.model');
const OrbitalChat = require('../models/orbital.chat.model');
const OrbitalRead = require('../models/orbital.read.model');
const { sendPush } = require('../utils/push');
const { recordSocialActivity } = require('../utils/habit');

const MAX_TEXT = 2000;
const isOid = (v) => mongoose.isValidObjectId(v);

/* ── member cache: avoids a DB read on every message ── */
const memberCache = new Map(); // orbitalId -> { ids: string[], exp: number }
const CACHE_MS = 60 * 1000;

async function getMemberIds(orbitalId) {
    const hit = memberCache.get(orbitalId);
    if (hit && hit.exp > Date.now()) return hit.ids;
    const orbital = await Orbital.findById(orbitalId).select('members name').lean();
    if (!orbital) return null;
    const ids = (orbital.members || []).map(String);
    memberCache.set(orbitalId, { ids, exp: Date.now() + CACHE_MS });
    return ids;
}
exports.invalidateMembers = (orbitalId) => memberCache.delete(String(orbitalId)); // call on join/leave/kick

const format = (m, sender) => ({
    id: String(m._id),
    orbitalId: String(m.orbitalId),
    seq: m.seq,
    senderId: String(m.senderId),
    sender: sender ? { id: String(sender._id), username: sender.username, profilePic: sender.profilePic } : undefined,
    text: m.content || '',
    clientId: m.clientId || null,
    replyTo: m.replyTo ? String(m.replyTo) : null,
    timestamp: m.timestamp,
});

/* ── POST /api/orbitals/:orbitalId/messages   body: { text, clientId?, replyToId? } ── */
exports.sendOrbitalMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { orbitalId } = req.params;
        const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
        const clientId = typeof req.body.clientId === 'string' ? req.body.clientId.slice(0, 64) : null;
        const replyTo = isOid(req.body.replyToId) ? req.body.replyToId : null;

        if (!isOid(orbitalId)) return res.status(400).json({ message: 'Invalid orbital' });
        if (!text) return res.status(400).json({ message: 'Write something first' });
        if (text.length > MAX_TEXT) return res.status(400).json({ message: `Max ${MAX_TEXT} characters` });

        const memberIds = await getMemberIds(orbitalId);
        if (!memberIds) return res.status(404).json({ message: 'Orbital not found' });
        if (!memberIds.includes(String(senderId))) {
            return res.status(403).json({ message: 'Join this orbital to chat' });
        }

        // Retry of a message we already saved? Return it, don't burn a new seq.
        if (clientId) {
            const dup = await OrbitalChat.findOne({ senderId, clientId }).lean();
            if (dup) return res.status(200).json({ success: true, message: format(dup) });
        }

        // THE ordering step: atomic, so two simultaneous sends can never share a seq.
        const { lastSeq: seq } = await Orbital.findOneAndUpdate(
            { _id: orbitalId },
            { $inc: { lastSeq: 1 } },
            { new: true, projection: 'lastSeq' }
        ).lean();

        const saved = await OrbitalMessage.create({
            orbitalId, seq, senderId, content: text, clientId, replyTo,
        });

        const sender = await User.findById(senderId).select('username profilePic').lean();
        const message = format(saved.toObject(), sender);

        // fan out to every member (including the sender's other devices; the app dedupes by clientId)
        req.app.get('publishToUsers')?.(memberIds, { type: 'orbital-message', message });

        // push only to members who are offline right now
        const isOnline = req.app.get('isUserOnline');
        for (const id of memberIds) {
            if (id === String(senderId) || isOnline?.(id)) continue;
            // TODO: skip members who muted this orbital
            sendPush(id, {
                title: `${sender?.username || 'Someone'} in orbital`,
                body: text.length > 100 ? `${text.slice(0, 100)}…` : text,
                data: { url: `/orbital/${orbitalId}` },
                category: 'social',
            });
        }

        recordSocialActivity(senderId);
        return res.status(201).json({ success: true, message });
    } catch (error) {
        console.error('sendOrbitalMessage error:', error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

/* ── GET /api/orbitals/:orbitalId/messages?before=<seq>|after=<seq>&limit=50 ──
   before = older page (scroll up), after = catch-up after a gap or reconnect. Always oldest→newest. */
exports.getOrbitalMessages = async (req, res) => {
    try {
        const { orbitalId } = req.params;
        if (!isOid(orbitalId)) return res.status(400).json({ message: 'Invalid orbital' });

        const memberIds = await getMemberIds(orbitalId);
        if (!memberIds?.includes(String(req.user.id))) return res.status(403).json({ message: 'Not a member' });

        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
        const before = parseInt(req.query.before, 10);
        const after = parseInt(req.query.after, 10);

        const filter = { orbitalId };
        let sort = { seq: -1 };
        if (!Number.isNaN(after)) { filter.seq = { $gt: after }; sort = { seq: 1 }; }
        else if (!Number.isNaN(before)) filter.seq = { $lt: before };

        const rows = await OrbitalMessage.find(filter).sort(sort).limit(limit + 1).lean();
        const hasMore = rows.length > limit;
        const page = hasMore ? rows.slice(0, limit) : rows;
        if (sort.seq === -1) page.reverse();

        // attach sender info with ONE query
        const users = await User.find({ _id: { $in: [...new Set(page.map((m) => String(m.senderId)))] } })
            .select('username profilePic').lean();
        const byId = new Map(users.map((u) => [String(u._id), u]));

        return res.json({
            success: true,
            hasMore,
            messages: page.map((m) => format(m, byId.get(String(m.senderId)))),
        });
    } catch (error) {
        console.error('getOrbitalMessages error:', error);
        return res.status(500).json({ message: 'Failed to load messages' });
    }
};

/* ── PATCH /api/orbitals/:orbitalId/read   body: { seq } ── */
exports.markOrbitalRead = async (req, res) => {
    try {
        const { orbitalId } = req.params;
        const seq = parseInt(req.body.seq, 10);
        if (!isOid(orbitalId) || Number.isNaN(seq)) return res.status(400).json({ message: 'Invalid request' });

        await OrbitalRead.updateOne(
            { orbitalId, userId: req.user.id },
            { $max: { lastReadSeq: seq } },   // only ever moves forward
            { upsert: true }
        );
        return res.json({ success: true });
    } catch (error) {
        console.error('markOrbitalRead error:', error);
        return res.status(500).json({ message: 'Failed to update read state' });
    }
};