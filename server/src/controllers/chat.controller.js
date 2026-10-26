const mongoose = require('mongoose');
const Message = require('../models/messages.model');
const User = require('../models/user.model');
const { Post } = require('../models/post.model');
const { recordSocialActivity } = require('../utils/habit');

const formatMessage = (message) => ({
    id: String(message._id),
    senderId: String(message.senderId),
    recipientId: String(message.recipientId),
    text: message.content,
    type: message.type,
    sharedPost: message.sharedPost || null,
    timestamp: message.timestamp,
    delivered: message.delivered,
    // old messages have no flag and count as seen
    read: message.read !== false,
    edited: !!message.edited,
});

exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { recipientId } = req.params;
        const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
        const sharedPostId = req.body.sharedPostId || null;

        if (!mongoose.isValidObjectId(recipientId) || recipientId === senderId) {
            return res.status(400).json({ message: 'A valid recipient is required' });
        }
        if (!text && !sharedPostId) {
            return res.status(400).json({ message: 'Message text or a shared post is required' });
        }
        if (text.length > 2000) {
            return res.status(400).json({ message: 'Message text cannot exceed 2000 characters' });
        }

        const [sender, recipient, sharedPost] = await Promise.all([
            User.findById(senderId).select('blockedUsers'),
            User.findById(recipientId).select('blockedUsers'),
            sharedPostId
                ? Post.findOne({ _id: sharedPostId, isActive: true, isArchived: { $ne: true } }).select('_id')
                : null,
        ]);
        if (!sender || !recipient) return res.status(404).json({ message: 'User not found' });
        if (sender.blockedUsers.some(id => String(id) === recipientId) || recipient.blockedUsers.some(id => String(id) === senderId)) {
            return res.status(403).json({ message: 'Messaging is unavailable for this conversation' });
        }
        if (sharedPostId && !sharedPost) return res.status(404).json({ message: 'Shared post not found' });

        const saved = await Message.create({
            senderId,
            recipientId,
            content: text,
            type: sharedPost ? 'shared_post' : 'chat_message',
            sharedPost: sharedPost?._id || null,
            read: false,
        });
        await saved.populate({
            path: 'sharedPost',
            select: 'content image video author orbital',
            populate: [
                { path: 'author', select: 'username profilePic' },
                { path: 'orbital', select: 'name image' },
            ],
        });

        const message = formatMessage(saved);
        req.app.get('publishChatMessage')?.(recipientId, message);
        recordSocialActivity(senderId);
        return res.status(201).json({ success: true, message });
    } catch (error) {
        console.error('Send message error:', error);
        return res.status(500).json({ success: false, message: 'Failed to send message' });
    }
};

exports.getConversation = async (req, res) => {
    try {
        console.log('req.user:', req.user); // ✅ add this
        const { recipientId } = req.params;
        const senderId = req.user.id;

        if (!recipientId) {
            return res.status(400).json({ error: 'recipientId required' })
        }

        const recipientObjId = new mongoose.Types.ObjectId(recipientId);

        const messages = await Message.find({
            $or: [
                { senderId: senderId, recipientId: recipientObjId },  // ✅
                { senderId: recipientObjId, recipientId: senderId }   // ✅
            ]
        })
            .populate({
                path: 'sharedPost',
                select: 'content image video author orbital',
                populate: [
                    { path: 'author', select: 'username profilePic' },
                    { path: 'orbital', select: 'name image' },
                ],
            })
            .sort({ timestamp: -1 })
            .limit(50)
            .lean();

        // Opening a conversation is what marks it read.
        const marked = await Message.updateMany(
            { senderId: recipientObjId, recipientId: senderId, read: false },
            { $set: { read: true } }
        );
        // tell the other person their messages were just seen (live ticks)
        if (marked.modifiedCount > 0) {
            req.app.get('publishChatEvent')?.(recipientId, { type: 'messages-read', readerId: String(senderId) });
        }

        res.json({ success: true, messages: messages.reverse().map(formatMessage) });
    } catch (error) {
        console.error('error fetching msg history', error);
        res.status(500).json({ success: false, error: 'failed to fetch msg' });
    };
};

exports.getUnread = async (req, res) => {
    try {
        const rows = await Message.aggregate([
            { $match: { recipientId: new mongoose.Types.ObjectId(req.user.id), read: false } },
            { $group: { _id: '$senderId', count: { $sum: 1 } } },
        ]);
        const byContact = Object.fromEntries(rows.map(row => [String(row._id), row.count]));
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
        if (!mongoose.isValidObjectId(recipientId)) {
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
 * Only the sender can edit, only text messages, and only until the other person has seen it.
 */
exports.editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const senderId = req.user.id;
        const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';

        if (!mongoose.isValidObjectId(messageId)) {
            return res.status(400).json({ success: false, message: 'Invalid message' });
        }
        if (!text) return res.status(400).json({ success: false, message: 'Message text is required' });
        if (text.length > 2000) {
            return res.status(400).json({ success: false, message: 'Message text cannot exceed 2000 characters' });
        }

        const message = await Message.findOne({ _id: messageId, senderId });
        if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
        if (message.sharedPost) {
            return res.status(400).json({ success: false, message: 'Shared posts cannot be edited' });
        }
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
 * GET /api/chat/conversations
 * One row per person I have chatted with: latest message + how many of theirs I haven't opened.
 * Newest first, so the Messages list can sort by it.
 */
exports.getConversations = async (req, res) => {
    try {
        const me = new mongoose.Types.ObjectId(req.user.id);
        const rows = await Message.aggregate([
            { $match: { $or: [{ senderId: me }, { recipientId: me }] } },
            { $sort: { timestamp: -1 } },
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
                text: r.last.content || '',
                type: r.last.type,
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