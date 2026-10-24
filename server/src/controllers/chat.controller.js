const mongoose = require('mongoose');
const Message = require('../models/messages.model');
const User = require('../models/user.model');
const { Post } = require('../models/post.model');

const formatMessage = (message) => ({
    id: String(message._id),
    senderId: String(message.senderId),
    recipientId: String(message.recipientId),
    text: message.content,
    type: message.type,
    sharedPost: message.sharedPost || null,
    timestamp: message.timestamp,
    delivered: message.delivered,
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
        });
        await saved.populate({
            path: 'sharedPost',
            select: 'content image video author',
            populate: { path: 'author', select: 'username profilePic' },
        });

        const message = formatMessage(saved);
        req.app.get('publishChatMessage')?.(recipientId, message);
        return res.status(201).json({ success: true, message });
    } catch (error) {
        console.error('Send message error:', error);
        return res.status(500).json({ success: false, message: 'Failed to send message' });
    }
};

exports.getConversation = async (req, res) => {
    try {
        // console.log('req.user:', req.user); // ✅ add this
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
                select: 'content image video author',
                populate: { path: 'author', select: 'username profilePic' },
            })
            .sort({ timestamp: -1 })
            .limit(50)
            .lean();

        res.json({ success: true, messages: messages.reverse().map(formatMessage) });
    } catch (error) {
        console.error('error fetching msg history', error);
        res.status(500).json({ success: false, error: 'failed to fetch msg' });
    };
};