const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social.controller');
const { protect } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(protect);

// Search users
router.get('/search', socialController.searchUsers);

// Friend requests
router.get('/friend-requests', socialController.getFriendRequests);
router.post('/friend-request/:userId', socialController.sendFriendRequest);
router.delete('/friend-request/:userId', socialController.cancelFriendRequest);
router.post('/friend-request/:requestId/accept', socialController.acceptFriendRequest);
router.post('/friend-request/:requestId/reject', socialController.rejectFriendRequest);

// Friends management
router.get('/friends', socialController.getFriends);
router.get('/friends/leaderboard', socialController.getFriendsLeaderboard);
router.delete('/friends/:friendId', socialController.removeFriend);

module.exports = router;
