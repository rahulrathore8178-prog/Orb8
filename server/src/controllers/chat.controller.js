const mongoose = require('mongoose');
const Message = require('../models/messages.model');
const User = require('../models/user.model');
const { Post } = require('../models/post.model');
const { recordSocialActivity } = require('../utils/habit');
const { sendPush } = require('../utils/push');
const { streamFileFromDrive } = require('../utils/driveUpload');
const {
    MEDIA_KINDS, FALLBACK_MIME, httpError, processChatMedia, readGifMedia,
    signMediaUrl, verifyMediaSig, previewLabel, discardFiles,
} = require('../utils/chatMedia');

const MAX_TEXT = 2000;
const PAGE_DEFAULT = 50;
const PAGE_MAX = 100;

const SHARED_POST_POPULATE = {
    path: 'sharedPost',
    select: 'content image video author orbital',
    populate: [
        { path: 'author', select: 'username profilePic' },
        { path: 'orbital', select: 'name image' },
    ],
};

const isOid = (v) => mongoose.isValidObjectId(v);

function fail(res, error, label) {
    if (error?.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error(`${label} error:`, error);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
}

/** GIF/sticker links are returned as-is; uploaded files get a signed API URL (never a public Drive link). */
function formatMedia(m) {
    if (!m || !m.type) return null;
    if (m.type === 'gif' || m.type === 'sticker') {
        return m.url ? { type: m.type, url: m.url, width: m.width, height: m.height } : null;
    }
    if (!m.fileId) return null;
    return {
        type: m.type,
        url: signMediaUrl(m.type, m.fileId),
        width: m.width,
        height: m.height,
        duration: m.duration,
        size: m.size,
    };
}

const formatMessage = (message) => ({
    id: String(message._id),
    senderId: String(message.senderId),
    recipientId: String(message.recipientId),
    text: message.content || '',
    type: message.type,
    sharedPost: message.sharedPost || null,
    media: formatMedia(message.media),
    timestamp: message.timestamp,
    delivered: message.delivered,
    // old messages have no flag and count as seen
    read: message.read !== false,
    edited: !!message.edited,
});

const pushBody = (text, media, sharedPost) =>
    sharedPost ? 'Shared a post with you'
        : media ? (text ? `${previewLabel(media.type)} ${text}`.slice(0, 100) : previewLabel(media.type))
            : text.length > 100 ? `${text.slice(0, 100)}…` : text;

/* ───────────────────────── send ───────────────────────── */
/**
 * POST /api/chat/:recipientId
 *  - JSON:      { text }  |  { sharedPostId }  |  { gifUrl, gifKind, gifWidth, gifHeight, text? }
 *  - multipart: field "media" (image | video | voice note) + { text?, mediaDuration?, mediaWidth?, mediaHeight? }
 * Text plus at most ONE of: file, GIF/sticker, shared post.
 */
exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { recipientId } = req.params;
        const body = req.body || {};
        const text = typeof body.text === 'string' ? body.text.trim() : '';
        const sharedPostId = body.sharedPostId || null;
        const gifUrl = typeof body.gifUrl === 'string' ? body.gifUrl.trim() : '';
        const file = req.file || null;

        if (!isOid(recipientId) || recipientId === senderId) {
            return res.status(400).json({ message: 'A valid recipient is required' });
        }
        if ([file, gifUrl, sharedPostId].filter(Boolean).length > 1) {
            return res.status(400).json({ message: 'Send one attachment at a time' });
        }
        if (!text && !file && !gifUrl && !sharedPostId) {
            return res.status(400).json({ message: 'Write something or attach a photo, video, voice note or GIF' });
        }
        if (sharedPostId && !isOid(sharedPostId)) return res.status(400).json({ message: 'Invalid shared post' });
        if (text.length > MAX_TEXT) return res.status(400).json({ message: `Message text cannot exceed ${MAX_TEXT} characters` });

        const [sender, recipient, sharedPost] = await Promise.all([
            User.findById(senderId).select('blockedUsers username').lean(),
            User.findById(recipientId).select('blockedUsers').lean(),
            sharedPostId
                ? Post.findOne({ _id: sharedPostId, isActive: true, isArchived: { $ne: true } }).select('_id').lean()
                : null,
        ]);
        if (!sender || !recipient) return res.status(404).json({ message: 'User not found' });
        if ((sender.blockedUsers || []).some((id) => String(id) === recipientId)
            || (recipient.blockedUsers || []).some((id) => String(id) === senderId)) {
            return res.status(403).json({ message: 'Messaging is unavailable for this conversation' });
        }
        if (sharedPostId && !sharedPost) return res.status(404).json({ message: 'Shared post not found' });

        // Files are compressed/uploaded only after every check above has passed.
        let attachment = { media: null, fileIds: [] };
        if (file) attachment = await processChatMedia(senderId, file, body);
        else if (gifUrl) attachment = readGifMedia(body);

        let saved;
        try {
            saved = await Message.create({
                senderId,
                recipientId,
                content: text,
                type: sharedPost ? 'shared_post' : 'chat_message',
                sharedPost: sharedPost?._id || null,
                ...(attachment.media ? { media: attachment.media } : {}),
                read: false,
            });
            if (sharedPost) await saved.populate(SHARED_POST_POPULATE);
        } catch (error) {
            discardFiles(attachment.fileIds); // don't leave orphaned files in Drive
            throw error;
        }

        const message = formatMessage(saved);
        req.app.get('publishChatMessage')?.(recipientId, message);

        // fire and forget, never blocks or breaks sending
        sendPush(recipientId, {
            title: sender.username || 'New message',
            body: pushBody(text, attachment.media, sharedPost),
            data: { url: `/chat/${senderId}` }, // change to your real chat route
            category: 'social',
        });

        recordSocialActivity(senderId);
        return res.status(201).json({ success: true, message });
    } catch (error) {
        return fail(res, error, 'sendMessage');
    }
};

/* ───────────────────────── history ───────────────────────── */
/**
 * GET /api/chat/:recipientId?limit=50&before=<messageId>
 * Newest page first from the server; the response is oldest -> newest.
 * `hasMore` tells the app whether to ask for an older page (pass the oldest id as `before`).
 */
exports.getConversation = async (req, res) => {
    try {
        const { recipientId } = req.params;
        const senderId = req.user.id;

        if (!isOid(recipientId)) {
            return res.status(400).json({ success: false, error: 'A valid recipientId is required' });
        }

        const me = new mongoose.Types.ObjectId(senderId);
        const other = new mongoose.Types.ObjectId(recipientId);
        const limit = Math.min(PAGE_MAX, Math.max(1, parseInt(req.query.limit, 10) || PAGE_DEFAULT));
        const before = isOid(req.query.before) ? new mongoose.Types.ObjectId(req.query.before) : null;

        const filter = { $or: [{ senderId: me, recipientId: other }, { senderId: other, recipientId: me }] };
        if (before) filter._id = { $lt: before };
        filter.deletedFor = { $ne: me };

        // Opening the conversation (first page) is what marks it read; runs alongside the fetch.
        const [rows, marked] = await Promise.all([
            Message.find(filter)
                .populate(SHARED_POST_POPULATE)
                .sort({ _id: -1 })
                .limit(limit + 1)
                .lean(),
            before
                ? null
                : Message.updateMany({ senderId: other, recipientId: me, read: false }, { $set: { read: true } }),
        ]);

        // tell the other person their messages were just seen (live ticks)
        if (marked?.modifiedCount > 0) {
            req.app.get('publishChatEvent')?.(recipientId, { type: 'messages-read', readerId: String(senderId) });
        }

        const hasMore = rows.length > limit;
        const page = hasMore ? rows.slice(0, limit) : rows;
        return res.json({ success: true, hasMore, messages: page.reverse().map(formatMessage) });
    } catch (error) {
        console.error('error fetching msg history', error);
        return res.status(500).json({ success: false, error: 'failed to fetch msg' });
    }
};

exports.getUnread = async (req, res) => {
    try {
        const rows = await Message.aggregate([
            { $match: { recipientId: new mongoose.Types.ObjectId(req.user.id), read: false, deletedFor: { $ne: new mongoose.Types.ObjectId(req.user.id) } } },
            { $group: { _id: '$senderId', count: { $sum: 1 } } },
        ]);
        const byContact = Object.fromEntries(rows.map((row) => [String(row._id), row.count]));
        return res.json({ total: rows.reduce((sum, row) => sum + row.count, 0), byContact });
    } catch (error) {
        console.error('unread messages error:', error);
        return res.status(500).json({ message: 'Failed to load unread messages' });
    }
};

/**
 * PATCH /api/chat/:recipientId/read
 * Marks everything `recipientId` sent ME as read, and tells them over the socket so their ticks turn blue.
 * (The route param is the OTHER person, not a message id.)
 */
exports.markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { recipientId } = req.params;
        if (!isOid(recipientId)) {
            return res.status(400).json({ success: false, message: 'A valid user is required' });
        }

        const result = await Message.updateMany(
            { senderId: recipientId, recipientId: userId, read: false },
            { $set: { read: true } }
        );
        if (result.modifiedCount > 0) {
            req.app.get('publishChatEvent')?.(recipientId, { type: 'messages-read', readerId: String(userId) });
        }
        return res.json({ success: true, updated: result.modifiedCount });
    } catch (error) {
        console.error('markAsRead error:', error);
        return res.status(500).json({ success: false, message: 'Failed to mark messages as read' });
    }
};

/**
 * PATCH /api/chat/:messageId   body: { text }
 * Only the sender can edit, never shared posts, and only until the other person has seen it.
 * On a media message this edits the caption.
 */
exports.editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const senderId = req.user.id;
        const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';

        if (!isOid(messageId)) return res.status(400).json({ success: false, message: 'Invalid message' });
        if (!text) return res.status(400).json({ success: false, message: 'Message text is required' });
        if (text.length > MAX_TEXT) {
            return res.status(400).json({ success: false, message: `Message text cannot exceed ${MAX_TEXT} characters` });
        }

        const message = await Message.findOne({ _id: messageId, senderId });
        if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
        if (message.sharedPost) return res.status(400).json({ success: false, message: 'Shared posts cannot be edited' });
        // read !== false: old messages (no flag) are treated as seen too
        if (message.read !== false) {
            return res.status(400).json({ success: false, message: 'Cannot edit a message that was already read' });
        }

        message.content = text;
        message.edited = true;
        message.editedAt = new Date();
        await message.save();

        const formatted = formatMessage(message);
        req.app.get('publishChatEvent')?.(message.recipientId, { type: 'message-edited', message: formatted });
        return res.json({ success: true, message: formatted });
    } catch (error) {
        console.error('editMessage error:', error);
        return res.status(500).json({ success: false, message: 'Failed to edit message' });
    }
};

/**
 * DELETE /api/chat/:messageId
 * Sender only ("delete for everyone"). Also frees the Drive file of a photo, video or voice note.
 */
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const scope = req.query.scope === 'everyone' ? 'everyone' : 'me';
        if (!isOid(messageId)) return res.status(400).json({ success: false, message: 'Invalid message' });
        const uid = req.user.id;

        if (scope === 'me') { // hide it for me only, the other person keeps it
            const r = await Message.updateOne(
                { _id: messageId, $or: [{ senderId: uid }, { recipientId: uid }] },
                { $addToSet: { deletedFor: uid } }
            );
            if (!r.matchedCount) return res.status(404).json({ success: false, message: 'Message not found' });
            return res.json({ success: true, messageId, scope });
        }

        // unsend: sender only, removed for both, Drive file freed
        const message = await Message.findOneAndDelete({ _id: messageId, senderId: uid }).lean();
        if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
        discardFiles([message.media?.fileId]);
        req.app.get('publishChatEvent')?.(message.recipientId, { type: 'message-deleted', messageId: String(message._id) });
        return res.json({ success: true, messageId, scope });
    } catch (error) {
        console.error('deleteMessage error:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete message' });
    }
};

// new: clear chat (for me only)
exports.clearConversation = async (req, res) => {
    try {
        const me = req.user.id;
        const other = req.params.recipientId;
        if (!isOid(other)) return res.status(400).json({ success: false, message: 'Invalid user' });
        await Message.updateMany(
            { $or: [{ senderId: me, recipientId: other }, { senderId: other, recipientId: me }] },
            { $addToSet: { deletedFor: me } }
        );
        return res.json({ success: true });
    } catch (error) {
        console.error('clearConversation error:', error);
        return res.status(500).json({ success: false, message: 'Failed to clear chat' });
    }
};

/**
 * GET /api/chat/conversations
 * One row per person I have chatted with: latest message + how many of theirs I haven't opened.
 * Newest first, so the Messages list can sort by it.
 */
exports.getConversations = async (req, res) => {
    try {
        const me = new mongoose.Types.ObjectId(req.user.id);
        const rows = await Message.aggregate([
            { $match: { $and: [{ $or: [{ senderId: me }, { recipientId: me }] }, { deletedFor: { $ne: me } }] } },
            { $sort: { timestamp: -1 } },
            // keep only what the list needs, so grouping never carries whole documents
            {
                $project: {
                    senderId: 1, recipientId: 1, content: 1, type: 1, timestamp: 1, read: 1,
                    mediaType: '$media.type',
                },
            },
            {
                $group: {
                    _id: { $cond: [{ $eq: ['$senderId', me] }, '$recipientId', '$senderId'] },
                    last: { $first: '$$ROOT' },
                    unread: {
                        $sum: { $cond: [{ $and: [{ $eq: ['$recipientId', me] }, { $eq: ['$read', false] }] }, 1, 0] },
                    },
                },
            },
            { $sort: { 'last.timestamp': -1 } },
            { $limit: 300 },
        ]);

        return res.json({
            conversations: rows.map((r) => ({
                contactId: String(r._id),
                // media-only messages show a label ("📷 Photo") so the list is never blank
                text: r.last.content || previewLabel(r.last.mediaType) || (r.last.type === 'shared_post' ? 'Shared a post' : ''),
                type: r.last.type,
                mediaType: r.last.mediaType || null,
                fromMe: String(r.last.senderId) === String(me),
                timestamp: r.last.timestamp,
                unread: r.unread,
            })),
        });
    } catch (error) {
        console.error('getConversations error:', error);
        return res.status(500).json({ message: 'Failed to load conversations' });
    }
};

/**
 * GET /api/chat/media/:kind/:fileId?sig=...   (public, signature-checked)
 * Streams chat photos, videos and voice notes from Drive with Range support, so seeking works.
 */
exports.streamMedia = async (req, res) => {
    try {
        const { kind, fileId } = req.params;
        if (!MEDIA_KINDS.has(kind) || !/^[\w-]{10,100}$/.test(fileId)) {
            return res.status(400).json({ message: 'Invalid media' });
        }
        if (!verifyMediaSig(kind, fileId, req.query.sig)) return res.status(403).json({ message: 'Invalid link' });

        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // a file id never changes
        await streamFileFromDrive(fileId, res, req, FALLBACK_MIME[kind]);
    } catch (error) {
        if (!res.headersSent) return res.status(502).json({ message: 'Could not stream media' });
        res.end();
    }
};