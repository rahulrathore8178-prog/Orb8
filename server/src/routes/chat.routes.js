const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const chatController = require('../controllers/chat.controller')

router.use(protect);

router.get('/unread', chatController.getUnread);
router.get('/conversations', chatController.getConversations); // must stay above /:recipientId
router.get('/:recipientId', chatController.getConversation);
router.post('/:recipientId', chatController.sendMessage);
router.patch('/:recipientId/read', chatController.markAsRead); // :recipientId = the other person; marks what THEY sent me as read
router.patch('/:messageId', chatController.editMessage);

module.exports = router;