const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const chatController = require('../controllers/chat.controller')

router.use(protect);

router.get('/unread', chatController.getUnread);
router.get('/:recipientId', chatController.getConversation);
router.post('/:recipientId', chatController.sendMessage);

module.exports = router;