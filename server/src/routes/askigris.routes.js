const express = require('express');
const multer = require('multer');
const { processIgrisConversation, getIgrisHistory, getIgrisHistoryById, newIgrisConversation } = require('../controllers/askigris.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/', protect, upload.single('file'), processIgrisConversation);

router.get('/history/:userId', protect, getIgrisHistory);
router.get('/history/:userId/:id', protect, getIgrisHistoryById);
router.post('/newConversation', protect, upload.single('file'), newIgrisConversation);

module.exports = router;