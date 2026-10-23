const User = require('../models/user.model');
const { Post } = require('../models/post.model');
const Orbital = require('../models/orbital.model');

const MAX_RADIUS_KM = 100;

async function getRecommendations(req, res) {
  try {
    const viewer = await User.findById(req.user.id)
      .select('preferences.content following blockedUsers isCosmicDiscoverable')
      .lean();

    if (!viewer) return res.status(404).json({ message: 'User not found' });

    const allowedPrivateAuthors = [...(viewer.following || []), viewer._id];
    const privateAuthors = await User.find({
      isPrivate: true,
      _id: { $nin: allowedPrivateAuthors },
    }).distinct('_id');
    const excludedAuthors = [...privateAuthors, ...(viewer.blockedUsers || [])];

    const [posts, communities] = await Promise.all([
      Post.find({
        author: { $nin: excludedAuthors },
        isActive: true,
        isArchived: { $ne: true },
        orbital: null,
      })
        .populate('author', 'username profilePic bio')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
      Orbital.find({ visibility: 'open' })
        .select('name image description memberCount creator')
        .sort({ memberCount: -1, updatedAt: -1 })
        .limit(16)
        .lean(),
    ]);

    const preferenceEntries = Object.entries(viewer.preferences?.content || {})
      .filter(([, score]) => Number(score) > 0)
      .sort((left, right) => Number(right[1]) - Number(left[1]));
    const interests = preferenceEntries.map(([name]) => name);
    const creatorMap = new Map();
    const topicCounts = new Map();

    const recommendedPosts = posts
      .filter((post) => post.author)
      .map((post) => {
        const hashtags = (post.hashtags || []).map((tag) => String(tag).replace(/^#/, '').toLowerCase());
        const content = String(post.content || '').toLowerCase();
        const relevanceScore = preferenceEntries.reduce((score, [interest, weight]) => {
          const normalizedInterest = interest.toLowerCase();
          const matches = hashtags.includes(normalizedInterest) || content.includes(normalizedInterest);
          return score + (matches ? Math.min(Number(weight), 100) : 0);
        }, 0);

        hashtags.forEach((tag) => topicCounts.set(tag, (topicCounts.get(tag) || 0) + 1));
        const authorId = String(post.author._id);
        const priorCreator = creatorMap.get(authorId);
        creatorMap.set(authorId, {
          id: authorId,
          username: post.author.username || 'Orbit member',
          profilePic: post.author.profilePic || '',
          bio: post.author.bio || '',
          relevanceScore: (priorCreator?.relevanceScore || 0) + relevanceScore,
          recentPostAt: post.createdAt,
        });

        return {
          id: String(post._id),
          author: {
            id: authorId,
            username: post.author.username || 'Orbit member',
            profilePic: post.author.profilePic || '',
          },
          content: post.content || '',
          hashtags: post.hashtags || [],
          image: post.image || '',
          video: post.video || '',
          createdAt: post.createdAt,
          likesCount: post.likes?.length || 0,
          commentsCount: post.comments?.length || 0,
          relevanceScore,
        };
      })
      .sort((left, right) => right.relevanceScore - left.relevanceScore || new Date(right.createdAt) - new Date(left.createdAt));

    const creators = [...creatorMap.values()]
      .sort((left, right) => right.relevanceScore - left.relevanceScore || new Date(right.recentPostAt) - new Date(left.recentPostAt))
      .slice(0, 16);
    const topics = [...topicCounts.entries()]
      .map(([name, postCount]) => ({ name, postCount }))
      .sort((left, right) => right.postCount - left.postCount)
      .slice(0, 24);

    return res.json({
      interests,
      posts: recommendedPosts.slice(0, 60),
      creators,
      topics,
      communities,
      isCosmicDiscoverable: Boolean(viewer.isCosmicDiscoverable),
    });
  } catch (error) {
    console.error('Cosmic Discovery recommendations error:', error);
    return res.status(500).json({ message: 'Failed to load Cosmic Discovery' });
  }
}

async function updateNearbyDiscovery(req, res) {
  try {
    const userId = req.user.id;
    const { enabled, lat, lng } = req.body;

    if (enabled === false) {
      await User.findByIdAndUpdate(userId, {
        $set: { isCosmicDiscoverable: false },
        $unset: { cosmicLocation: 1, cosmicLocationUpdatedAt: 1 },
      });
      return res.json({ isCosmicDiscoverable: false, nearbyUsers: [] });
    }

    const radiusKm = Number(req.body.radiusKm ?? 10);
    if (
      enabled !== true ||
      !Number.isFinite(lat) || lat < -90 || lat > 90 ||
      !Number.isFinite(lng) || lng < -180 || lng > 180 ||
      !Number.isFinite(radiusKm) || radiusKm < 1 || radiusKm > MAX_RADIUS_KM
    ) {
      return res.status(400).json({ message: `Valid coordinates and a radius from 1 to ${MAX_RADIUS_KM} km are required` });
    }

    const viewerId = await User.findByIdAndUpdate(userId, {
      $set: {
        cosmicLocation: { type: 'Point', coordinates: [lng, lat] },
        cosmicLocationUpdatedAt: new Date(),
        isCosmicDiscoverable: true,
      },
    }, { new: true }).select('_id blockedUsers');

    if (!viewerId) return res.status(404).json({ message: 'User not found' });

    const nearbyUsers = await User.aggregate([
      {
        $geoNear: {
          key: 'cosmicLocation',
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distanceMeters',
          maxDistance: radiusKm * 1000,
          spherical: true,
          query: {
            _id: { $ne: viewerId._id, $nin: viewerId.blockedUsers || [] },
            isCosmicDiscoverable: true,
            blockedUsers: { $ne: viewerId._id },
          },
        },
      },
      {
        $project: {
          username: 1,
          profilePicture: '$profilePic',
          bio: 1,
          distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 1] },
        },
      },
      { $limit: 50 },
    ]);

    return res.json({ isCosmicDiscoverable: true, nearbyUsers });
  } catch (error) {
    console.error('Cosmic Discovery nearby search error:', error);
    return res.status(500).json({ message: 'Failed to update nearby discovery' });
  }
}

module.exports = { getRecommendations, updateNearbyDiscovery };