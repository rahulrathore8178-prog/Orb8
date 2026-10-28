const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { commentMediaUpload } = require('../middlewares/comment.upload.middleware');
const comments = require('../controllers/comment.controller');

const router = express.Router();

// Public on purpose: the audio player cannot send auth headers. The controller only
// streams files that are registered as comment voice notes.
router.get('/comments/audio/:fileId', comments.streamCommentAudio);

router.get('/posts/:postId/comments', protect, comments.getComments);
router.post('/posts/:postId/comments', protect, commentMediaUpload, comments.addComment);
router.post('/posts/:postId/:commentId/commentReplies', protect, commentMediaUpload, comments.commentReply);
router.post('/posts/:postId/:commentId/likeComment', protect, comments.likeComment);
router.delete('/posts/:postId/comments/:commentId', protect, comments.deleteComment);

module.exports = router;