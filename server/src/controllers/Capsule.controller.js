// const { default: Capsule } = require('../../../client/codingo/src/components/Comments/CapsuleModal');
const { Capsule } = require('../models/capsule.model')
const User = require('../models/user.model');
const { uploadBufferToDrive } = require('../utils/driveUpload');
const { streamFileFromDrive } = require('../utils/driveUpload');
const { deleteFileFromDrive } = require('../utils/driveUpload');
const fs = require('fs');
const HOUR = 60 * 60 * 1000;

function buildCapsuleMediaUrl(req, fileId) {
  if (!fileId) return '';
  return `${req.protocol}://${req.get('host')}/api/capsule/media/${fileId}`;
}

const createCapsule = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const now = new Date();

    // Debug incoming request 
    console.log(`[CAPSULE CREATE] user=${userId} filePresent=${!!req.file}`);

    if (!req.file) {
      console.error('[CAPSULE CREATE] no file attached in request');
      return res.status(400).json({ message: 'No media file uploaded' });
    }

    // ✅ read file from disk into buffer
    const fileBuffer = fs.readFileSync(req.file.path);

    const { fileId } = await uploadBufferToDrive(
      fileBuffer,
      req.file.originalname,
      req.file.mimetype          // ✅ mediaType from req.file
    );

    // ✅ clean up disk after uploading to Drive
    fs.unlinkSync(req.file.path);

    const capsule = await Capsule.create({
      user: userId,
      mediaFileId: fileId,
      mediaUrl: buildCapsuleMediaUrl(req, fileId),
      mediaType: req.file.mimetype.startsWith('video') ? 'video' : 'image',
      caption: req.body.caption || '',
      likedBy: [],
      likeCount: 0,
      expiresAt: new Date(now.getTime() + 24 * HOUR),
      deleteAt: new Date(now.getTime() + 48 * HOUR),
    });

    res.status(201).json(capsule);
  } catch (err) {
    console.error('Create capsule error:', err);
    res.status(500).json({ message: err.message });
  }
};

const createCapsuleComment = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { content } = req.body;

    const capsule = await Capsule.findById(req.params.id);
    if (!capsule) {
      return res.status(404).json({ message: 'Capsule not found' });
    }

    const hasComment = content && content.trim().length > 0;
    const hasVoiceNote = req.file?.fieldname === 'voiceNote';

    if (!hasComment && !hasVoiceNote) {
      return res.status(400).json({ message: 'Comment must have some content' });
    }

    if (hasComment && content.length > 500) {
      return res.status(400).json({ message: 'Comment exceeds 500 characters' });
    }

    const comment = {
      author: userId,
      content: hasComment ? content.trim() : '',
      voiceNote: hasVoiceNote
        ? { url: req.file.path || req.file.location, duration: req.body.duration || 0 }
        : undefined,
      createdAt: new Date()
    };

    capsule.comments.push(comment);
    await capsule.save();

    // ✅ populate after save — both user and comments.author in one call
    await capsule.populate([
      { path: 'user', select: 'username profilePic' },
      { path: 'comments.author', select: 'username profilePic' }
    ]);

    const newComment = capsule.comments[capsule.comments.length - 1];

    // ✅ now capsule.user is populated object, use ._id
    if (String(capsule.user._id) !== String(userId)) {
      await User.findByIdAndUpdate(capsule.user._id, {
        $push: {
          notifications: {
            title: '💬 New Comment',
            detail: `${newComment.author.username} commented on your capsule`
          }
        }
      });
    }

    return res.status(201).json({
      message: 'Comment added',
      comment: {
        id: String(newComment._id),
        capsuleId: String(capsule._id),
        author: {
          id: String(newComment.author._id),
          username: newComment.author.username,       // ✅ populated
          profilePic: newComment.author.profilePic || '' // ✅ populated
        },
        content: newComment.content,
        voiceNote: newComment.voiceNote,
        createdAt: newComment.createdAt,
        likesCount: 0,
        isLikedByCurrentUser: false,
      },
      commentsCount: capsule.comments.length
    });

  } catch (error) {
    console.error('capsule comment posting error', error);
    return res.status(500).json({ message: error.message });
  }
};

const capsuleCommentReply = async (req, res) => {
  try {
    const { capsuleId, commentId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Type something to post' });
    }

    if (content.length > 500) {
      return res.status(404).json({ message: 'cannot exceed 500 letters' });
    }

    const capsule = await Capsule.findById(capsuleId);

    if (!capsule) {
      return res.status(400).json({ message: 'Capsule not found' })
    };

    const capsuleComment = capsule.comments.id(commentId);

    const reply = {
      author: req.user.id,
      content: content.trim(),
      createdAt: new Date()
    }

    capsuleComment.replies.push(reply);
    await capsule.save();

    const savedCapsule = await Capsule.findById(capsuleId).populate(
      'comments.replies.author',
      'username profilePic'
    );

    const savedComment = savedCapsule.comments.id(commentId);
    const savedReply = savedComment.replies[savedComment.replies.length - 1];

    return res.status(201).json({
      message: 'Reply saved successfully',
      reply: {
        id: String(savedReply._id),
        author: {
          id: String(savedReply.author._id),
          username: savedReply.author.username,
          profilePic: savedReply.author.profilePic || ''
        },
        content: savedReply.content,
        createdAt: savedReply.createdAt
      }
    });

  } catch (error) {
    console.error('capsule comment reply error', error);
    return res.status(500).json({ message: error.message });
  }
};

const capsuleCommentLike = async (req, res) => {
  try {
    const { capsuleId, commentId } = req.params;
    const userId = req.user.id;

    const capsule = Capsule.findById(capsuleId);

    if (!capsule) {
      return res.status(404).json({ message: 'Capsule not found' })
    };

    const comment = capsule.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    };

    if (!comment.likes) comment.likes = [];

    const capsuleCommentLike = comment.likes.findIndex(id => String(id) === userIdString);
    // Unlike post if liked
    if (commentLike > -1) {
      comment.likes.splice(commentLike, 1);
      await capsule.save();
      return res.status(200).json({
        message: 'Comment disliked',
        likesCount: comment.likes.length,
        isLiked: false
      });
    } else {
      // Add like
      comment.likes.push(userId);
      await capsule.save();

      if (String(comment.author !== userIdString)) {
        const liker = await User.findById(userId).select('username');
        await User.findByIdAndUpdate(comment.author, {
          $push: {
            notifications: {
              title: 'Comment like',
              detail: `${liker.username} liked your comment`
            }
          }
        });
      }
    }
    return res.status(200).json({
      message: 'Comment liked',
      likesCount: comment.likes.length,
      isLiked: true
    });

  } catch (error) {
    console.error('capsule comment like error', error);
    res.status(500).json({ message: error.message });
  }
};

const getFriendsCapsules = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;  // ✅ fix

    const user = await User.findById(userId).select('friends');

    if (!user) return res.status(404).json({ message: 'User not found' });

    const capsules = await Capsule.find({
      user: { $in: [...user.friends, userId] },  // ✅ use userId not req.user._id
      deleteAt: { $gt: new Date() },
    })
      .populate('user', 'username profilePic')
      .populate('viewers', 'username profilePic')
      .populate('comments.author', 'username profilePic')
      .populate('comments.replies.author', 'username profilePic')

      .sort({ createdAt: -1 });

    // Debug: surface basic diagnostics to server logs to help client-side debugging
    try {
      // console.log(`[CAPSULES] fetched ${capsules.length} capsules for user ${userId}`);
      if (capsules.length > 0) console.log('[CAPSULES] sample:', { id: capsules[0]._id, mediaFileId: capsules[0].mediaFileId, mediaUrl: capsules[0].mediaUrl });
    } catch (logErr) {
      console.warn('[CAPSULES] logging failure', logErr?.message || logErr);
    }

    const processed = capsules.map((c) => {
      const obj = typeof c.toObject === 'function' ? c.toObject() : { ...c };
      if (obj.mediaFileId) {
        obj.mediaUrl = buildCapsuleMediaUrl(req, obj.mediaFileId);
      }
      if (obj.user && obj.user.profilePic && typeof obj.user.profilePic === 'string') {
        if (!obj.user.profilePic.startsWith('http')) {
          // Build absolute URL for uploads stored on the server
          obj.user.profilePic = `${req.protocol}://${req.get('host')}${obj.user.profilePic}`;
        }
      }

      // ✅ format comments with author details
      obj.comments = (obj.comments || []).map(comment => ({
        id: String(comment._id),
        author: {
          id: String(comment.author?._id || comment.author),
          username: comment.author?.username || '',
          profilePic: comment.author?.profilePic || ''
        },
        content: comment.content,
        voiceNote: comment.voiceNote,
        createdAt: comment.createdAt,
        likesCount: comment.likes?.length || 0,
        isLikedByCurrentUser: false,
        replies: (comment.replies || []).map(reply => ({
          id: String(reply._id),
          author: {
            id: String(reply.author?._id || reply.author),
            username: reply.author?.username || '',
            profilePic: reply.author?.profilePic || ''
          },
          content: reply.content,
          createdAt: reply.createdAt
        }))
      }));
      return obj;
    });

    res.json(processed);
  } catch (err) {
    console.error('getFriendsStories error:', err);  // ✅ add log to see exact error
    res.status(500).json({ message: err.message });
  }
};

const getUserCapsules = async (req, res) => {
  try {
    const { userId } = req.params;
    const viewerId = req.user._id;

    const profileUser = await User.findById(userId).select("isPrivate friends");
    if (!profileUser) return res.status(404).json({ message: "User not found" });

    const isOwner = String(userId) === String(viewerId);
    const isFriend = profileUser.friends.some((f) => String(f) === String(viewerId));

    if (profileUser.isPrivate && !isOwner && !isFriend) {
      return res.status(403).json({ message: "This account is private" });
    }

    const stories = await Capsule.find({ user: userId, deleteAt: { $gt: new Date() } })
      .sort({ createdAt: -1 });

    // Normalize older records to include mediaUrl when missing
    const processed = stories.map((c) => {
      const obj = typeof c.toObject === 'function' ? c.toObject() : { ...c };
      if (obj.mediaFileId) {
        obj.mediaUrl = buildCapsuleMediaUrl(req, obj.mediaFileId);
      }
      return obj;
    });

    res.json(processed);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const viewCapsule = async (req, res) => {
  try {
    await Capsule.findByIdAndUpdate(req.params.id, { $addToSet: { viewers: req.user._id } });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const preserveCapsule = async (req, res) => {
  try {
    const userId = String(req.user.id || req.user._id);
    const now = new Date();

    const capsule = await Capsule.findById(req.params.id);
    console.log('raw capsule', capsule)
    console.log('capsule', String(capsule.user))
    console.log('userId', userId)
    if (!capsule) {
      return res.status(404).json({ message: 'Capsule not found' });
    }

    capsule.expiresAt = new Date(now.getTime() + 24 * HOUR);
    capsule.deleteAt = new Date(now.getTime() + 48 * HOUR);
    capsule.streakStartsFrom = now;
    capsule.streakCount = (capsule.streakCount || 1) + 1;
    await capsule.save();

    return res.status(200).json({ message: `Capsule preserved successfully by ${userId}`, capsule });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const likeCapsule = async (req, res) => {
  try {
    const capsuleId = req.params.id;
    const userId = req.user.id || req.user._id;
    const userIdString = String(userId);

    const capsule = await Capsule.findById(capsuleId);
    if (!capsule) {
      return res.status(404).json({ message: 'capsule not found' });
    }

    const likeIndex = capsule.likedBy.findIndex((id) => String(id) === userIdString);

    if (likeIndex > -1) {
      capsule.likedBy.splice(likeIndex, 1);
      await capsule.save();
      return res.status(200).json({
        message: 'Capsule disliked',
        likesCount: capsule.likedBy.length,
        isLiked: false,
      });
    } else {
      capsule.likedBy.push(userId);
      await capsule.save();

      if (String(capsule.user) !== userIdString) {
        const liker = await User.findById(userId).select('username');
        await User.findByIdAndUpdate(capsule.user, {
          $push: {
            notifications: {
              title: 'capsule like',
              detail: `${liker.username} liked your capsule`,
            },
          },
        });
      }

      return res.status(200).json({
        message: 'capsule liked',
        likesCount: capsule.likedBy.length,
        isLiked: true,
      });
    }
    console.log('likescount', capsule.likedBy.length)
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteCapsule = async (req, res) => {
  try {
    const capsuleId = req.params.id;
    const userId = String(req.user.id || req.user._id);

    const capsule = await Capsule.findById(capsuleId);
    if (!capsule) {
      return res.status(404).json({ message: 'Capsule not found' });
    }

    if (String(capsule.user) !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this capsule' });
    }

    if (capsule.mediaFileId) {
      try {
        await deleteFileFromDrive(capsule.mediaFileId);
      } catch (driveError) {
        console.error('Delete capsule drive file error:', driveError);
      }
    }

    await Capsule.findByIdAndDelete(capsuleId);
    return res.status(200).json({ message: 'Capsule deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to delete capsule' });
  }
};

const getCapsuleMedia = async (req, res) => {
  try {
    await streamFileFromDrive(req.params.fileId, res);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to load capsule media' });
  }
};

module.exports = {
  createCapsule,
  viewCapsule,
  preserveCapsule,
  deleteCapsule,
  likeCapsule,
  getUserCapsules,
  getFriendsCapsules,
  getCapsuleMedia,
  createCapsuleComment,
  capsuleCommentReply,
  capsuleCommentLike
}