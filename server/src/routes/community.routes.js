const express = require('express');
const { 
  createPost, 
  getFeed, 
  getPost,
  toggleLike, 
  addComment,
  deletePost,
  deleteComment,
  getUserPosts,
  commentReply,
  likeComment,
  getPostImage,
  getPostVideo,
  discoverNearbyPeople,
  getPostVoiceNote,
  registerPostView,
  setPostArchived,
  savePost,
  unsavePost,
  getSavedPosts,
  createSavedCollection,
  addPostToCollection,
  getProfileInsights,
} = require('../controllers/community.controller');
const { protect } = require('../middlewares/auth.middleware');
const { postMediaUpload } = require('../middlewares/upload.middleware');

const router = express.Router();

// Get feed (paginated)
router.get('/feed', protect, getFeed);

// Proxy image from Drive
router.get('/posts/image/:fileId', getPostImage);

// Proxy video from Drive
router.get('/posts/video/:fileId', getPostVideo);

// Proxy voice note from Drive
router.get('/posts/voiceNote/:fileId', getPostVoiceNote);

// Create a new post (with optional image)
router.post('/posts', protect, postMediaUpload, createPost);

// Get a single post
router.get('/posts/:postId', protect, getPost);

// Delete a post
router.delete('/posts/:postId', protect, deletePost);
router.patch('/posts/:postId/archive', protect, setPostArchived);

// Get user's posts
router.get('/users/:userId/posts', protect, getUserPosts);

// Like/Unlike a post
router.post('/posts/:postId/like', protect, toggleLike);

// Add a comment
router.post('/posts/:postId/comments', protect, addComment);

// Like a comment
router.post('/posts/:postId/:commentId/likeComment', protect, likeComment);

// Add a comment reply
router.post('/posts/:postId/:commentId/commentReplies', protect, commentReply);

// Delete a comment
router.delete('/posts/:postId/comments/:commentId', protect, deleteComment);
  
// Register a post view
router.post('/posts/:postId/views', protect, registerPostView);

// Saved posts, collections, and owner-only insights
router.get('/saved', protect, getSavedPosts);
router.post('/saved/collections', protect, createSavedCollection);
router.post('/saved/collections/:collectionId/:postId', protect, addPostToCollection);
router.post('/saved/:postId', protect, savePost);
router.delete('/saved/:postId', protect, unsavePost);
router.get('/insights', protect, getProfileInsights);

// Discover people nearby
router.post('/discover/nearby', protect, discoverNearbyPeople);

module.exports = router;