const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { chatMediaUpload } = require('../middlewares/chat.upload.middleware');
const chatController = require('../controllers/chat.controller');

// Public on purpose: audio/video players and image loaders can't send auth headers.
// Every URL carries a signature made by the server, so only links the API handed out work.
// Must stay ABOVE router.use(protect).
router.get('/media/:kind/:fileId', chatController.streamMedia);

router.use(protect);

router.get('/unread', chatController.getUnread);
router.get('/conversations', chatController.getConversations); // must stay above /:recipientId
router.get('/:recipientId', chatController.getConversation);
router.post('/:recipientId', chatMediaUpload, chatController.sendMessage);
router.patch('/:recipientId/read', chatController.markAsRead); // :recipientId = the other person; marks what THEY sent me as read
router.patch('/:messageId', chatController.editMessage);
router.delete('/:messageId', chatController.deleteMessage);
router.delete('/conversation/:recipientId', chatController.clearConversation);

module.exports = router;