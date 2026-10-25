const User = require('../models/user.model');
const { recordSocialActivity } = require('../utils/habit');

/**
 * Search users by username (excluding self and already-friends)
 * GET /api/social/search?q=username
 */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const includesId = (values, id) => (values || []).some(value => value.toString() === id.toString());

const getUsersForRelationship = async (currentUserId, targetUserId) => {
  if (currentUserId.toString() === targetUserId.toString()) {
    return { error: { status: 400, message: 'You cannot perform this action on yourself' } };
  }

  const [currentUser, targetUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(targetUserId),
  ]);

  if (!currentUser || !targetUser) {
    return { error: { status: 404, message: 'User not found' } };
  }

  return { currentUser, targetUser };
};

exports.updatePrivacy = async (req, res) => {
  if (typeof req.body.isPrivate !== 'boolean') {
    return res.status(400).json({ message: 'isPrivate must be a boolean' });
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { isPrivate: req.body.isPrivate } },
      { new: true },
    ).select('isPrivate');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ isPrivate: user.isPrivate });
  } catch (error) {
    console.error('Update privacy error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateNotificationPreferences = async (req, res) => {
  const allowedKeys = new Set(['pushEnabled', 'social', 'learning', 'product']);
  const updates = req.body?.preferences;
  if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
    return res.status(400).json({ message: 'preferences must be an object' });
  }

  const entries = Object.entries(updates);
  if (!entries.length || entries.some(([key, value]) => !allowedKeys.has(key) || typeof value !== 'boolean')) {
    return res.status(400).json({ message: 'Preferences must contain supported boolean values' });
  }

  try {
    const set = Object.fromEntries(entries.map(([key, value]) => [`notificationPreferences.${key}`, value]));
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: set },
      { new: true, runValidators: true },
    ).select('notificationPreferences');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ preferences: user.notificationPreferences });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    return res.status(500).json({ message: 'Failed to update notification preferences' });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { currentUser, targetUser, error } = await getUsersForRelationship(req.user.id, req.params.userId);
    if (error) return res.status(error.status).json({ message: error.message });

    currentUser.blockedUsers.addToSet(targetUser._id);
    currentUser.followers.pull(targetUser._id);
    currentUser.following.pull(targetUser._id);
    currentUser.followRequests.pull(targetUser._id);
    currentUser.friends.pull(targetUser._id);
    targetUser.followers.pull(currentUser._id);
    targetUser.following.pull(currentUser._id);
    targetUser.followRequests.pull(currentUser._id);
    targetUser.friends.pull(currentUser._id);
    targetUser.friendRequests = targetUser.friendRequests.filter(request => request.from.toString() !== currentUser._id.toString());
    currentUser.friendRequests = currentUser.friendRequests.filter(request => request.from.toString() !== targetUser._id.toString());
    await Promise.all([currentUser.save(), targetUser.save()]);
    return res.json({ status: 'blocked' });
  } catch (error) {
    console.error('Block user error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    await User.updateOne({ _id: req.user.id }, { $pull: { blockedUsers: req.params.userId } });
    return res.json({ status: 'none' });
  } catch (error) {
    console.error('Unblock user error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateProfileGrid = async (req, res) => {
  const layout = req.body.layout;
  const allowedSizes = new Set([
    '1x1', '2x1', '3x1',
    '1x2', '2x2', '3x2',
    '1x3', '2x3', '3x3',
  ]);
  if (!Array.isArray(layout) || layout.length > 100) {
    return res.status(400).json({ message: 'layout must be an array of at most 100 posts' });
  }

  const postIds = layout.map(item => item?.post);
  if (postIds.some(id => !id) || new Set(postIds.map(String)).size !== postIds.length
    || layout.some(item => !allowedSizes.has(item.gridSize))) {
    return res.status(400).json({ message: 'Each post must be unique and use a supported grid size' });
  }

  try {
    const ownedPostCount = await require('../models/post.model').Post.countDocuments({
      _id: { $in: postIds },
      author: req.user.id,
      isActive: true,
    });
    if (ownedPostCount !== postIds.length) {
      return res.status(403).json({ message: 'The grid can only contain your posts' });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { profileGridLayout: layout } },
      { new: true, runValidators: true },
    ).select('profileGridLayout');
    if (!user) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    return res.json({ layout: user.profileGridLayout });
  } catch (error) {
    console.error('Update profile grid error:', error);
    return res.status(500).json({ message: 'Failed to update profile grid' });
  }
};
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user.id;

    const query = (q || '').trim();
    if (query.length === 0) {
      return res.json({ users: [] });
    }
    const currentUser = await User.findById(currentUserId).select('friends friendRequests');

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const friendIds = (currentUser.friends || []).map(id => id.toString());
    // IDs of users who have sent the current user a pending request
    const pendingFromIds = (currentUser.friendRequests || [])
      .filter(r => r && r.from)
      .map(r => r.from.toString());

    const users = await User.find({
      _id: { $ne: currentUserId },
      username: { $regex: `^${escapeRegex(query)}`, $options: 'i' }
    })
      .select('username profilePic totalXp level league streakCount friendRequests')
      .limit(20)
      .lean();

    // Mark friendship & pending-request status
    const usersWithStatus = users.map(({ friendRequests: fr, ...user }) => {
      const id = user._id.toString();
      const me = currentUserId.toString();

      const isFriend = friendIds.includes(id);
      // I sent them a request (my id is in THEIR friendRequests)
      const requestSent = (fr || []).some(r => r?.from?.toString() === me);
      // They sent me a request (their id is in MY friendRequests)
      const requestReceived = pendingFromIds.includes(id);

      return { ...user, isFriend, requestSent, requestReceived };
    });

    res.json({ users: usersWithStatus });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Send friend request
 * POST /api/social/friend-request/:userId
 */
exports.sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId).select('friends friendRequests'),
      User.findById(userId).select('friends friendRequests username')
    ]);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize arrays if they don't exist
    if (!currentUser.friends) currentUser.friends = [];
    if (!currentUser.friendRequests) currentUser.friendRequests = [];
    if (!targetUser.friends) targetUser.friends = [];
    if (!targetUser.friendRequests) targetUser.friendRequests = [];

    // Check if already friends
    if (currentUser.friends.some(id => id.toString() === userId)) {
      return res.status(400).json({ message: 'Already friends with this user' });
    }

    // Check if request already exists
    const existingRequest = targetUser.friendRequests.find(
      req => req.from.toString() === currentUserId
    );
    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Check if target user has sent a request to current user (auto-accept)
    const reverseRequest = currentUser.friendRequests.find(
      req => req.from.toString() === userId
    );
    if (reverseRequest) {
      // Auto-accept: both become friends
      currentUser.friends.push(userId);
      currentUser.friendRequests = currentUser.friendRequests.filter(
        req => req.from.toString() !== userId
      );

      targetUser.friends.push(currentUserId);

      await Promise.all([currentUser.save(), targetUser.save()]);

      return res.json({
        message: 'Friend request accepted automatically',
        status: 'friends'
      });
    }

    // Add friend request
    targetUser.friendRequests.push({ from: currentUserId });
    await targetUser.save();

    recordSocialActivity(currentUserId);
    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Accept friend request
 * POST /api/social/friend-request/:requestId/accept
 */
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    const request = currentUser.friendRequests.id(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    const friendId = request.from;

    // Add to friends list
    currentUser.friends.push(friendId);
    currentUser.friendRequests = currentUser.friendRequests.filter(
      req => req._id.toString() !== requestId
    );

    // Add current user to friend's friends list
    await User.findByIdAndUpdate(friendId, {
      $push: { friends: currentUserId }
    });

    await currentUser.save();

    recordSocialActivity(currentUserId);
    res.json({ message: 'Friend request accepted', friendId });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Reject friend request
 * POST /api/social/friend-request/:requestId/reject
 */
exports.rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    const request = currentUser.friendRequests.id(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    currentUser.friendRequests = currentUser.friendRequests.filter(
      req => req._id.toString() !== requestId
    );

    await currentUser.save();

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get pending friend requests
 * GET /api/social/friend-requests
 */
exports.getFriendRequests = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId)
      .populate('friendRequests.from', 'username profilePic totalXp level league streakCount')
      .lean();

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle case where friendRequests array doesn't exist or is empty
    if (!currentUser.friendRequests || !Array.isArray(currentUser.friendRequests)) {
      return res.json({ requests: [] });
    }

    const requests = currentUser.friendRequests.map(req => ({
      _id: req._id,
      from: req.from,
      createdAt: req.createdAt
    }));

    res.json({ requests });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get friends list with stats
 * GET /api/social/friends
 */
exports.getFriends = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId)
      .populate('friends', 'username profilePic totalXp level league streakCount')
      .lean();

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle case where friends array doesn't exist or is empty
    if (!currentUser.friends || !Array.isArray(currentUser.friends)) {
      return res.json({ friends: [] });
    }

    const friends = currentUser.friends.map(friend => ({
      _id: friend._id,
      username: friend.username,
      profilePic: friend.profilePic || '',
      totalXp: friend.totalXp || 0,
      level: friend.level || 1,
      league: friend.league || 'Bronze 1',
      streakCount: friend.streakCount || 0
    }));

    // Sort by totalXp descending for leaderboard
    friends.sort((a, b) => b.totalXp - a.totalXp);

    res.json({ friends });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Remove friend
 * DELETE /api/social/friends/:friendId
 */
// exports.removeFriend = async (req, res) => {
//   try {
//     const { friendId } = req.params;
//     const currentUserId = req.user.id;

//     const [currentUser, friend] = await Promise.all([
//       User.findById(currentUserId),
//       User.findById(friendId)
//     ]);

//     if (!currentUser || !friend) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Initialize arrays if they don't exist
//     if (!currentUser.friends) currentUser.friends = [];
//     if (!friend.friends) friend.friends = [];

//     // Remove from both users' friends lists
//     currentUser.friends = currentUser.friends.filter(
//       id => id.toString() !== friendId
//     );
//     friend.friends = friend.friends.filter(
//       id => id.toString() !== currentUserId
//     );

//     await Promise.all([currentUser.save(), friend.save()]);

//     res.json({ message: 'Friend removed successfully' });
//   } catch (error) {
//     console.error('Remove friend error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

/**
 * Get friend leaderboard (top friends by XP)
 * GET /api/social/friends/leaderboard
 */
exports.getFriendsLeaderboard = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const currentUser = await User.findById(currentUserId)
      .populate({
        path: 'friends',
        select: 'username profilePic totalXp level league streakCount'
      })
      .lean();

    console.log("current user", currentUser)

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle case where friends array doesn't exist or is empty
    if (!currentUser.friends || !Array.isArray(currentUser.friends)) {
      return res.json({ leaderboard: [] });
    }

    // Sort by totalXp descending in JS and limit
    const sorted = [...currentUser.friends].sort((a, b) => (b.totalXp || 0) - (a.totalXp || 0)).slice(0, limit);

    const leaderboard = sorted.map((friend, index) => ({
      rank: index + 1,
      _id: friend._id,
      username: friend.username,
      profilePic: friend.profilePic,
      totalXp: friend.totalXp,
      level: friend.level,
      league: friend.league,
      streakCount: friend.streakCount
    }));

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get friends leaderboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.cancelFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    await User.updateOne(
      { _id: userId },
      { $pull: { friendRequests: { from: currentUserId } } }
    );

    res.json({ message: 'Friend request cancelled', status: 'none' });
  } catch (error) {
    console.error('Cancel friend request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /friends/:userId  (unfriend, removes both sides)
exports.removeFriend = async (req, res) => {
  try {
    const userId = req.params.friendId;
    const currentUserId = req.user.id;

    await Promise.all([
      User.updateOne({ _id: currentUserId }, { $pull: { friends: userId } }),
      User.updateOne({ _id: userId }, { $pull: { friends: currentUserId } }),
    ]);

    res.json({ message: 'Friend removed', status: 'none' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

