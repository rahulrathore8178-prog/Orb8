const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social.controller');
const { protect } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(protect);

// Search users
router.get('/search', socialController.searchUsers);

// Follow, privacy, and blocking
router.get('/follow-requests', socialController.getFollowRequests);
router.get('/users/:userId/followers', (req, res, next) => {
	req.params.connectionType = 'followers';
	return socialController.getFollowConnections(req, res, next);
});
router.get('/users/:userId/following', (req, res, next) => {
	req.params.connectionType = 'following';
	return socialController.getFollowConnections(req, res, next);
});
router.post('/follow/:userId', socialController.followUser);
router.delete('/follow/:userId', socialController.unfollowUser);
router.patch('/follow-requests/:userId', socialController.resolveFollowRequest);
router.patch('/privacy', socialController.updatePrivacy);
router.patch('/notification-preferences', socialController.updateNotificationPreferences);
router.post('/block/:userId', socialController.blockUser);
router.delete('/block/:userId', socialController.unblockUser);
router.put('/profile-grid', socialController.updateProfileGrid);

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
