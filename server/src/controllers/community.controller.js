const { Post, Comment } = require('../models/post.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const { OrbitalMember, STATUS: ORBITAL_STATUS } = require('../models/orbitalMember.model');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { uploadBufferToDrive } = require('../utils/driveUpload');
const { deleteFileFromDrive } = require('../utils/driveUpload');
const { streamFileFromDrive } = require('../utils/driveUpload');
const axios = require("axios");
const { recordSocialActivity } = require('../utils/habit');

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

const analysis_prompt = `You are the content-understanding engine of a social media recommendation system.
Input: a post's media (image, or frames sampled from a video) plus optional caption,
hashtags, and speech transcript. Analyze what the post is actually about and return
ONE JSON object. Output only JSON: no markdown, no code fences, no commentary.
Also sending post_id along with it, attach it into the schema too.

Schema:
{
  "summary": string,        // 1-2 factual sentences: what is shown, said, and taught
  "language": string,       // ISO 639-1 code of the main spoken/written language, "none" if no language
  "format": string,         // one of: tutorial, demo, meme, skit, news, opinion, vlog, showcase, promo, other
  "topics": { string: number },   // topic -> relevance
  "attributes": { "educational": number, "entertainment": number, "motivational": number, "emotional": number },
  "keywords": [string],     // 5-10 specific lowercase terms (tools, concepts, entities), no generic words
  "safety": { "nsfw": number, "violence": number, "hate": number }
}

Rules:
- All scores are 0.00-1.00 with two decimals. They are independent and need not sum to 1.
  0 = absent, 0.5 = present but secondary, 1 = dominant theme.
- topics: use ONLY these labels: technology, ai, programming, gaming, comedy, education,
  science, business, finance, fitness, health, food, travel, music, sports, fashion, art,
  news, politics, lifestyle, other. Include only topics scoring >= 0.30, at most 5.
- Judge from visible content, on-screen text, transcript, and caption. If media and caption
  disagree, trust the media. Never invent details or identify people from their faces.
- If unsure, lower the score rather than guess.
- The output must parse with json.loads.`

async function analyzeImage(fileBuffer, fileName, mimeType, postId) {
  const form = new FormData();
  form.append("file", fileBuffer, { filename: fileName, contentType: mimeType });
  form.append("post_id", postId);   // Python needs this to write the Chroma entry
  form.append('prompt', analysis_prompt)

  try {
    const res = await axios.post(`${PYTHON_API_URL}/describe_image`, form, {
      headers: form.getHeaders(),
      timeout: 30000,
    });
    return res.data.analysis;   // matches the trimmed { analysis: mongo_fields } shape from Python
  } catch (error) {
    console.error("image analyze error", error)
  }
}

// Create a new post
async function createPost(req, res) {
  try {
    const { content } = req.body;

    // if (!content || content.trim().length === 0) {
    //   return res.status(400).json({ message: 'Post content is required' });
    // }

    if (!content || content.trim().length === 0) return;

    if (content.length) {
      if (content.length > 2000) {
        return res.status(400).json({ message: 'Post content exceeds 2000 characters' });
      }
    }

    // --- hashtags: parse + normalize what the client sent ---
    let hashtags = [];
    if (req.body.hashtags) {
      try {
        const parsed = JSON.parse(req.body.hashtags);
        if (Array.isArray(parsed)) hashtags = parsed;
      } catch (err) {
        // malformed field, just ignore rather than failing the whole post
        hashtags = [];
      }
    }
    hashtags = [...new Set(
      hashtags
        .filter((t) => typeof t === 'string' && t.trim())
        .map((t) => t.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''))
        .filter(Boolean)
    )].slice(0, 30);
    console.log('[POST DEBUG] normalized hashtags:', hashtags);
    console.log('[POST DEBUG] orbital:', req.body.orbital);

    const postData = {
      author: req.user.id,
      content: content.trim() || '',
      hashtags,
      image: '',
      video: '',
      postType: req.body.postType || 'feed',
      orbital: req.body.orbital || null,
      // driveFileId: '',
      voiceNote: '',
      voiceNoteFileId: '',
      voiceNoteDuration: 0
    };

    if (req.file && req.file.buffer) {
      const isImage = req.file.mimetype.startsWith('image/');
      const isVideo = req.file.mimetype.startsWith('video/');
      const isVoiceNote = req.file.mimetype.startsWith('audio/');

      if (!isImage && !isVideo && !isVoiceNote) {
        return res.status(400).json({ message: 'Unsupported file type. Only images, videos, and audio are allowed.' });
      }

      // for image
      if (isImage) {
        let processedImageBuffer;
        try {
          processedImageBuffer = await sharp(req.file.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .webp({ quality: 85 })
            .toBuffer();
        } catch (err) {
          console.error('[POST IMAGE] Sharp error:', err);
          return res.status(500).json({ message: 'Image transform failed' });
        }
        try {
          const timestamp = Date.now();
          const fileName = `post-${req.user.id}-${timestamp}.webp`;
          const { fileId } = await uploadBufferToDrive(processedImageBuffer, fileName, 'image/webp');
          postData.image = `/api/community/posts/image/${fileId}`;
          postData.imageFileId = fileId;
        } catch (err) {
          console.error('[POST IMAGE] Drive upload error:', err?.response?.data || err.message || err);
          return res.status(500).json({ message: 'Image upload failed (drive)' });
        }
      }


      // for voice notes
      if (isVoiceNote) {
        const MAX_AUDIO_BYTES = 15 * 1024 * 1024; // voice notes should be much smaller than video
        if (req.file.size > MAX_AUDIO_BYTES) {
          return res.status(400).json({ message: 'Voice note exceeds max allowed size (15MB)' });
        }
        try {
          const timestamp = Date.now();
          const ext = (req.file.mimetype.split('/')[1] || 'webm').split(';')[0];
          const fileName = `post-voicenote-${req.user.id}-${timestamp}.${ext}`;
          const { fileId } = await uploadBufferToDrive(req.file.buffer, fileName, req.file.mimetype);
          postData.voiceNote = `/api/community/posts/voicenote/${fileId}`;
          postData.voiceNoteFileId = fileId;
          postData.voiceNoteDuration = Number(req.body.voiceNoteDuration) || 0;
        } catch (err) {
          console.error('[POST VOICE NOTE] Drive upload error:', err?.response?.data || err.message || err);
          return res.status(500).json({ message: 'Voice note upload failed (drive)' });
        }
      }

      // for video
      if (isVideo) {
        const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // adjust to whatever you set in multer limits
        if (req.file.size > MAX_VIDEO_BYTES) {
          return res.status(400).json({ message: 'Video exceeds max allowed size (50MB)' });
        }

        try {
          const timestamp = Date.now();
          const ext = (req.file.mimetype.split('/')[1] || 'mp4').split(';')[0];
          const fileName = `post-video-${req.user.id}-${timestamp}.${ext}`;
          const { fileId } = await uploadBufferToDrive(req.file.buffer, fileName, req.file.mimetype);
          postData.video = `/api/community/posts/video/${fileId}`;
          postData.videoFileId = fileId;
        } catch (err) {
          console.error('[POST VIDEO] Drive upload error:', err?.response?.data || err.message || err);
          return res.status(500).json({ message: 'Video upload failed (drive)' });
        }
      }
    }
    console.log('[POST DEBUG] postData.hashtags:', postData.hashtags);
    const post = await Post.create(postData);
    await post.populate('author', 'username profilePic league level totalXp');

    // Fire-and-forget: runs after the response has already gone out
    const file = req.file
    if (file && file.mimetype.startsWith("image/")) {
      console.log('data:', file.buffer, file.originalname, file.mimetype, post._id.toString())
      await analyzeImage(file.buffer, file.originalname, file.mimetype, analysis_prompt)
        .then(async (analysis) => {
          console.log('analysis ready', analysis)
          await Post.findByIdAndUpdate(post._id, { analysis, status: "ready" });
        })
        .catch(async (err) => {
          console.error("Python 422 detail:", JSON.stringify(err.response?.data, null, 2));
        });
    }

    recordSocialActivity(req.user.id);
    return res.status(201).json({
      message: 'Post created successfully',
      post: {
        id: String(post._id),
        author: {
          id: String(post.author._id),
          username: post.author.username,
          profilePic: post.author.profilePic || '',
          league: post.author.league || 'Bronze 1',
          level: post.author.level || 1,
          totalXp: post.author.totalXp || 0
        },
        content: post.content,
        hashtags: post.hashtags || [],
        image: post.image,
        voiceNote: post.voiceNote,
        video: post.video,
        likes: [],
        views: 0,
        viewedBy: [],
        comments: [],
        likesCount: 0,
        commentsCount: 0,
        isLikedByCurrentUser: false,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      }
    })
  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json({ message: error.message });
  }
}


async function deletePost(req, res) {
  console.log('Deleting post with ID:', req.params.postId);
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    console.log('Post user:', String(post.author));
    console.log('Current user:', req.user.id);

    if (String(post.author) !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this post' });
    };

    // Delete the associated drive file if it exists
    if (post.driveFileId) {
      try {
        await deleteFileFromDrive(post.driveFileId);
      } catch (err) {
        console.error('Error deleting drive file:', err);
      }
    };

    await Post.findByIdAndDelete(req.params.postId);
    return res.status(200).json({ message: 'Post and associated drive file deleted successfully' });

  } catch (error) {
    console.error('Error deleting drive file:', error);
    return res.status(500).json({ message: 'Failed to delete drive file' });
  }

};

// Get feed with pagination
async function getFeed(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {
      isActive: true,
      isArchived: { $ne: true },
    };

    const viewer = await User.findById(req.user.id).select('friends blockedUsers savedPosts').lean();
    if (!viewer) return res.status(404).json({ message: 'User not found' });
    const allowedPrivateAuthors = [...(viewer.friends || []), viewer._id];
    const hiddenPrivateUsers = await User.find({
      isPrivate: true,
      _id: { $nin: allowedPrivateAuthors },
    }).distinct('_id');
    filter.author = {
      $nin: [...hiddenPrivateUsers, ...(viewer.blockedUsers || [])],
    };

    if (req.query.type === 'orbital') {
      filter.orbital = { $ne: null };
    } else {
      filter.orbital = null;
    }

    const total = await Post.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const posts = await Post.find(filter)
      .populate("author", "username profilePic league level totalXp orbital")
      .populate("comments.author", "username profilePic")
      .populate("comments.replies.author", "username profilePic")
      .populate("orbital", "name description visibility image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const currentUserId = String(req.user?.id || "");
    const savedPostIds = new Set((viewer.savedPosts || []).map(item => String(item.post)));

    const formattedPosts = posts
      .filter((post) => post?.author) // skip orphaned posts
      .map((post) => ({
        id: String(post._id),
        author: {
          id: String(post.author._id),
          username: post.author.username || "Unknown",
          profilePic: post.author.profilePic || "",
          league: post.author.league || "Bronze 1",
          level: post.author.level || 1,
          totalXp: post.author.totalXp || 0,
        },
        content: post.content || "",
        hashtags: post.hashtags || [],
        image: post.image || "",
        video: post.video || "",
        views: post.views || 0,
        viewedBy: (post.viewedBy || []).map((id) => String(id)),
        voiceNote: post.voiceNote || "",
        voiceNoteDuration: post.voiceNoteDuration || 0,
        likes: (post.likes || []).map((id) => String(id)),
        comments: (post.comments || [])
          .filter((comment) => comment?.author)
          .map((comment) => ({
            id: String(comment._id),
            postId: String(post._id),
            author: {
              id: String(comment.author._id),
              username: comment.author.username || "Unknown",
              profilePic: comment.author.profilePic || "",
            },
            content: comment.content || "",
            createdAt: comment.createdAt,
            likesCount: comment.likes?.length || 0,
            isLikedByCurrentUser:
              comment.likes?.some((id) => String(id) === currentUserId) ?? false,
            replies: (comment.replies || [])
              .filter((reply) => reply?.author)
              .map((reply) => ({
                id: String(reply._id),
                author: {
                  id: String(reply.author._id),
                  username: reply.author.username || "Unknown",
                  profilePic: reply.author.profilePic || "",
                },
                content: reply.content || "",
                createdAt: reply.createdAt,
              })),
          })),
        likesCount: post.likes?.length || 0,
        commentsCount: post.comments?.length || 0,
        isLikedByCurrentUser:
          post.likes?.some((id) => String(id) === currentUserId) ?? false,
        isSavedByCurrentUser: savedPostIds.has(String(post._id)),
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        orbital: post.orbital || null,
        postType: post.postType || "feed",
      }));

    return res.status(200).json({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("Get feed error:", error);
    return res.status(500).json({ message: error.message });
  }
}


async function getPostImage(req, res) {
  try {
    await streamFileFromDrive(req.params.fileId, res, req);
  } catch (err) {
    console.error('Image proxy error:', err);
    return res.status(404).json({ message: 'Image not found' });
  }
}

async function getPostVideo(req, res) {
  try {
    await streamFileFromDrive(req.params.fileId, res, req);
  } catch (err) {
    console.error('Video proxy error:', err);
    return res.status(404).json({ message: 'Video not found' });
  }
}

async function getPostVoiceNote(req, res) {
  try {
    await streamFileFromDrive(req.params.fileId, res, req);
  } catch (err) {
    console.error('Voice note proxy error:', err);
    return res.status(404).json({ message: 'Voice note not found' });
  }
}

// Get a single post
async function getPost(req, res) {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId)
      .populate('author', 'username profilePic league level totalXp isPrivate friends blockedUsers')
      .populate('orbital', 'name image visibility')
      .populate('comments.author', 'username profilePic')
      .populate('comments.likes', '_id')
      .populate('comments.replies.author', 'username profilePic')
      .lean();

    if (!post || !post.isActive || (post.isArchived && String(post.author?._id) !== String(req.user.id))) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const viewer = await User.findById(req.user.id).select('blockedUsers').lean();
    const authorBlockedViewer = post.author.blockedUsers?.some(id => String(id) === String(req.user.id));
    const viewerBlockedAuthor = viewer?.blockedUsers?.some(id => String(id) === String(post.author._id));
    const isAuthorFriend = post.author.friends?.some(id => String(id) === String(req.user.id));
    if (authorBlockedViewer || viewerBlockedAuthor
      || (post.author.isPrivate && !isAuthorFriend && String(post.author._id) !== String(req.user.id))) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const replies = post.comments.reduce((acc, comment) => {
      acc[String(comment._id)] = comment.replies || [];
      return acc;
    }, {});

    const currentUserId = String(req.user.id);

    const formattedPost = {
      id: String(post._id),
      author: {
        id: String(post.author._id),
        username: post.author.username,
        profilePic: post.author.profilePic || '',
        league: post.author.league || 'Bronze 1',
        level: post.author.level || 1,
        totalXp: post.author.totalXp || 0
      },
      hashtags: post.hashtags || [],
      content: post.content,
      image: post.image,
      video: post.video || '',
      // set when the post belongs to an orbital
      orbital: post.orbital && post.orbital.name
        ? { id: String(post.orbital._id), name: post.orbital.name, image: post.orbital.image || '', visibility: post.orbital.visibility }
        : null,
      likes: post.likes.map(id => String(id)),
      comments: post.comments.map(comment => ({
        id: String(comment._id),
        author: {
          id: String(comment.author._id),
          username: comment.author.username,
          profilePic: comment.author.profilePic || ''
        },
        content: comment.content,
        createdAt: comment.createdAt,
        replies: comment.replies?.map(reply => ({
          id: String(reply._id),
          author: {
            id: String(reply.author._id),
            username: reply.author.username,
          },
          content: reply.content,
          createdAt: reply.createdAt,
        })) || []
      })),
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isLikedByCurrentUser: post.likes.some(id => String(id) === currentUserId),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    };

    return res.status(200).json({ post: formattedPost });
  } catch (error) {
    console.error('Get post error:', error);
    return res.status(500).json({ message: error.message });
  }
}

// Like/Unlike a post
async function toggleLike(req, res) {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post || !post.isActive) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userIdString = String(userId);
    const likeIndex = post.likes.findIndex(id => String(id) === userIdString);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
      await post.save();
      return res.status(200).json({
        message: 'Post unliked',
        likesCount: post.likes.length,
        isLiked: false
      });
    } else {
      // Like
      post.likes.push(userId);
      await post.save();

      // Send notification to post author (if not self-like)
      if (String(post.author) !== userIdString) {
        const liker = await User.findById(userId).select('username');
        await User.findByIdAndUpdate(post.author, {
          $push: {
            notifications: {
              title: '❤️ New Like',
              detail: `${liker.username} liked your post`
            }
          }
        });
      }

      console.log('post.likes:', post.likes);

      recordSocialActivity(userId);
      return res.status(200).json({
        message: 'Post liked',
        likesCount: post.likes.length,
        isLiked: true
      });
    }
  } catch (error) {
    console.error('Toggle like error:', error);
    return res.status(500).json({ message: error.message });
  }
}

// Add a comment to a post
async function addComment(req, res) {
  try {
    const postId = req.params.postId;
    const { content } = req.body;

    const hasComment = content && content.trim().length > 0;
    const hasVoiceNote = req.file?.fieldname === 'voiceNote';
    const hasImage = req.file?.fieldname === 'image'

    if (!hasComment && !hasImage && !hasVoiceNote) {
      return res.status(400).json({ message: 'Comment must have content, image, or voice note' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    if (content.length > 500) {
      return res.status(400).json({ message: 'Comment exceeds 500 characters' });
    }

    const post = await Post.findById(postId);

    if (!post || !post.isActive) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      author: req.user.id,
      content: content.trim(),
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    // Send notification to post author (if not self-comment)
    if (String(post.author) !== String(req.user.id)) {
      const commenter = await User.findById(req.user.id).select('username');
      await User.findByIdAndUpdate(post.author, {
        $push: {
          notifications: {
            title: '💬 New Comment',
            detail: `${commenter.username} commented on your post`
          }
        }
      });
    }

    // Populate the new comment's author details
    await post.populate('comments.author', 'username profilePic');

    const newComment = post.comments[post.comments.length - 1];

    recordSocialActivity(req.user.id);
    return res.status(201).json({
      message: 'Comment added',
      comment: {
        id: String(newComment._id),
        postId: String(post._id),
        author: {
          id: String(newComment.author._id),
          username: newComment.author.username,
          profilePic: newComment.author.profilePic || ''
        },
        content: newComment.content,
        createdAt: newComment.createdAt,
        likesCount: 0,                     // ✅ added
        isLikedByCurrentUser: false,       // ✅ added
        replies: []                        // ✅ added
      },
      commentsCount: post.comments.length
    });
  } catch (error) {
    console.error('Add comment error:', error);
    return res.status(500).json({ message: error.message });
  }
}

// Add a reply to a comment
async function commentReply(req, res) {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Type something to post' })
    }

    if (content.length > 500) {
      return res.status(404).json({ message: 'Maximum type limit 500 characters' })
    }

    const post = await Post.findById(postId);
    const comment = post.comments.id(commentId);

    if (!post || !post.isActive) {
      return res.status(400).json({ message: 'Post not found' })
    }

    const reply = {
      author: req.user.id,
      content: content.trim(),
      createdAt: new Date()
    }

    comment.replies.push(reply);
    await post.save();

    const savedPost = await Post.findById(postId).populate(
      'comments.replies.author',
      'username profilePicture'
    );

    const savedComment = savedPost.comments.id(commentId);
    const savedReply = savedComment.replies[savedComment.replies.length - 1];

    return res.status(201).json({
      message: 'Reply saved successfully',
      reply: savedReply
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid post or comment Id' });
    };
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Like comment
async function likeComment(req, res) {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;
    const userIdString = String(userId);

    const post = await Post.findById(postId);


    if (!post || !post.isActive) {
      return res.status(404).json({ message: 'post not found' })
    }
    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'comment not found' });
    };

    if (!comment.likes) comment.likes = [];

    const commentLike = comment.likes.findIndex(id => String(id) === userIdString);
    // Unlike post if liked
    if (commentLike > -1) {
      comment.likes.splice(commentLike, 1);
      await post.save();
      return res.status(200).json({
        message: 'Comment disliked',
        likesCount: comment.likes.length,
        isLiked: false
      });
    } else {
      // Add like
      comment.likes.push(userId);
      await post.save();

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

      return res.status(200).json({
        message: 'Comment liked',
        likesCount: comment.likes.length,
        isLiked: true
      });
    };
  } catch (error) {
    console.error('Comment like error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete a comment (author only)
async function deleteComment(req, res) {
  try {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post || !post.isActive) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const commentIndex = post.comments.findIndex(c => String(c._id) === commentId);

    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const comment = post.comments[commentIndex];

    // Check if user is the comment author or post author
    if (String(comment.author) !== String(userId) && String(post.author) !== String(userId)) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }

    post.comments.splice(commentIndex, 1);
    await post.save();

    return res.status(200).json({
      message: 'Comment deleted successfully',
      commentsCount: post.comments.length
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({ message: error.message });
  }
}

// Get user's posts
async function getUserPosts(req, res) {
  try {
    const userId = req.params.userId || req.user.id;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const isOwner = String(userId) === String(req.user.id);
    if (!isOwner) {
      const [viewer, profileOwner] = await Promise.all([
        User.findById(req.user.id).select('friends blockedUsers').lean(),
        User.findById(userId).select('isPrivate blockedUsers').lean(),
      ]);
      if (!profileOwner) return res.status(404).json({ message: 'User not found' });
      const isBlocked = viewer?.blockedUsers?.some(id => String(id) === String(userId))
        || profileOwner.blockedUsers?.some(id => String(id) === String(req.user.id));
      const canView = !profileOwner.isPrivate
        || viewer?.friends?.some(id => String(id) === String(userId));
      if (isBlocked || !canView) return res.status(403).json({ message: 'This profile is private' });
    }
    const filter = { author: userId, isActive: true };
    if (isOwner && req.query.archived === 'true') {
      filter.isArchived = true;
    } else {
      filter.isArchived = { $ne: true };
    }

    const total = await Post.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const posts = await Post.find(filter)
      .populate('author', 'username profilePic league level totalXp')
      .populate('comments.author', 'username profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const currentUserId = String(req.user.id);

    const formattedPosts = posts.map(post => ({
      id: String(post._id),
      author: {
        id: String(post.author._id),
        username: post.author.username,
        profilePic: post.author.profilePic || '',
        league: post.author.league || 'Bronze 1',
        level: post.author.level || 1,
        totalXp: post.author.totalXp || 0
      },
      content: post.content,
      image: post.image,
      video: post.video || '',
      voiceNote: post.voiceNote || '',
      voiceNoteDuration: post.voiceNoteDuration || 0,
      hashtags: post.hashtags || [],
      likes: post.likes.map(id => String(id)),
      views: post.views || 0,
      viewedBy: (post.viewedBy || []).map(id => String(id)),
      comments: post.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(comment => ({
        id: String(comment._id),
        author: {
          id: String(comment.author._id),
          username: comment.author.username,
          profilePic: comment.author.profilePic || ''
        },
        content: comment.content,
        createdAt: comment.createdAt
      })),
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isLikedByCurrentUser: post.likes.some(id => String(id) === currentUserId),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }));

    return res.status(200).json({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Orbitals a user is an active member of.
 * GET /api/community/users/:userId/orbitals
 * Own profile: every orbital, each with the user's `role`.
 * Someone else's: same privacy gate as their posts; private orbitals only if the viewer is also a member.
 * Items carry `author` (the creator) instead of `role`, matching the Orbital shape OrbitalCard expects.
 */
async function getUserOrbitals(req, res) {
  try {
    const userId = req.params.userId || req.user.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID.' });
    }

    const viewerId = String(req.user.id);
    const isOwner = String(userId) === viewerId;

    if (!isOwner) {
      const [viewer, profileOwner] = await Promise.all([
        User.findById(viewerId).select('friends blockedUsers').lean(),
        User.findById(userId).select('isPrivate blockedUsers').lean(),
      ]);
      if (!profileOwner) return res.status(404).json({ message: 'User not found' });
      const isBlocked = viewer?.blockedUsers?.some(id => String(id) === String(userId))
        || profileOwner.blockedUsers?.some(id => String(id) === viewerId);
      const canView = !profileOwner.isPrivate
        || viewer?.friends?.some(id => String(id) === String(userId));
      if (isBlocked || !canView) return res.status(403).json({ message: 'This profile is private' });
    }

    const memberships = await OrbitalMember.find({ user: userId, status: ORBITAL_STATUS.ACTIVE })
      .populate({
        path: 'orbital',
        select: 'name description visibility memberCount image creator',
        populate: { path: 'creator', select: 'username profilePic' },
      })
      .sort({ createdAt: -1 })
      .lean();

    let visible = memberships.filter(m => m.orbital);

    if (!isOwner) {
      const privateIds = visible.filter(m => m.orbital.visibility === 'private').map(m => m.orbital._id);
      const viewerMemberships = privateIds.length
        ? await OrbitalMember.find({ user: viewerId, status: ORBITAL_STATUS.ACTIVE, orbital: { $in: privateIds } })
            .select('orbital')
            .lean()
        : [];
      const allowed = new Set(viewerMemberships.map(m => String(m.orbital)));
      visible = visible.filter(m => m.orbital.visibility !== 'private' || allowed.has(String(m.orbital._id)));
    }

    const orbitals = visible.map(({ orbital, role }) => {
      const { creator, ...rest } = orbital;
      return isOwner ? { ...rest, role } : { ...rest, author: creator };
    });

    return res.status(200).json({ success: true, orbitals });
  } catch (error) {
    console.error('Get user orbitals error:', error);
    return res.status(500).json({ message: error.message });
  }
}

const DISCOVER_FRESHNESS_MS = 30 * 60 * 1000;
// 3 decimal places is roughly 110 m, so we never store an exact home location.
const coarsenCoordinate = (value) => Math.round(value * 1000) / 1000;

const discoverNearbyPeople = async (req, res) => {
  try {
    const { lat, lng, consent } = req.body;
    const userId = req.user.id;

    if (consent !== true) {
      return res.status(400).json({ message: 'Location sharing requires explicit consent' });
    }

    if (
      typeof lat !== 'number' || typeof lng !== 'number' ||
      !Number.isFinite(lat) || !Number.isFinite(lng) ||
      Math.abs(lat) > 90 || Math.abs(lng) > 180
    ) {
      return res.status(400).json({ message: 'Valid lat/lng required' });
    }

    const sharedLat = coarsenCoordinate(lat);
    const sharedLng = coarsenCoordinate(lng);

    const user = await User.findById(userId);
    user.location = { type: 'Point', coordinates: [sharedLng, sharedLat] };
    user.locationUpdatedAt = new Date();
    user.isDiscoverable = true;
    await user.save();

    // 2. Find nearby discoverable users who shared recently
    const nearbyUsers = await User.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [sharedLng, sharedLat] },
          distanceField: 'distance',
          maxDistance: 500, // meters
          spherical: true,
          query: {
            _id: { $ne: user._id },
            isDiscoverable: true,
            locationUpdatedAt: { $gte: new Date(Date.now() - DISCOVER_FRESHNESS_MS) },
          },
        },
      },
      {
        $project: {
          username: 1,
          profilePicture: '$profilePic',
          distance: { $round: ['$distance', 0] }, // meters, rounded
        },
      },
    ]);

    res.status(200).json({ nearbyUsers });
  } catch (error) {
    console.error('finding nearby people error:', error);
    return res.status(500).json({ message: 'Failed to find nearby people' });
  }
};

const stopSharingLocation = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user.id },
      {
        $set: { isDiscoverable: false },
        $unset: { locationUpdatedAt: 1 },
      }
    );
    return res.status(200).json({ message: 'Location sharing stopped' });
  } catch (error) {
    console.error('stop sharing location error:', error);
    return res.status(500).json({ message: 'Failed to stop sharing location' });
  }
};

const registerPostView = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId).select('_id isActive isArchived author');
    if (!post || !post.isActive || (post.isArchived && String(post.author) !== String(userId))) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const result = await Post.updateOne(
      { _id: postId, viewedBy: { $ne: userId } },
      {
        $inc: { views: 1 },
        $addToSet: { viewedBy: userId },
      }
    );

    return res.status(200).json({
      counted: result.modifiedCount === 1,
    });
  } catch (error) {
    console.error('Failed to register view:', error);
    return res.status(500).json({ message: 'Failed to register view' });
  }
};

const setPostArchived = async (req, res) => {
  try {
    if (typeof req.body.isArchived !== 'boolean') {
      return res.status(400).json({ message: 'isArchived must be a boolean' });
    }
    const post = await Post.findOneAndUpdate(
      { _id: req.params.postId, author: req.user.id, isActive: true },
      { $set: { isArchived: req.body.isArchived } },
      { new: true },
    ).select('_id isArchived');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    return res.json({ postId: String(post._id), isArchived: post.isArchived });
  } catch (error) {
    console.error('Archive post error:', error);
    return res.status(500).json({ message: 'Failed to update archive' });
  }
};

const savePost = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.postId,
      isActive: true,
      isArchived: { $ne: true },
    }).select('_id');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    await User.updateOne(
      { _id: req.user.id, 'savedPosts.post': { $ne: post._id } },
      { $push: { savedPosts: { post: post._id } } },
    );
    return res.json({ postId: String(post._id), isSaved: true });
  } catch (error) {
    console.error('Save post error:', error);
    return res.status(500).json({ message: 'Failed to save post' });
  }
};

const unsavePost = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user.id },
      {
        $pull: {
          savedPosts: { post: req.params.postId },
          'savedCollections.$[].posts': req.params.postId,
        },
      },
    );
    return res.json({ postId: req.params.postId, isSaved: false });
  } catch (error) {
    console.error('Unsave post error:', error);
    return res.status(500).json({ message: 'Failed to remove saved post' });
  }
};

const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'savedPosts.post',
        match: { isActive: true, isArchived: { $ne: true } },
        populate: [
          { path: 'author', select: 'username profilePic' },
          { path: 'orbital', select: 'name image' },
        ],
      })
      .select('savedPosts')
      .lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ savedPosts: (user.savedPosts || []).filter(item => item.post) });
  } catch (error) {
    console.error('Get saved posts error:', error);
    return res.status(500).json({ message: 'Failed to load saved posts' });
  }
};

const createSavedCollection = async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  if (!name || name.length > 80) {
    return res.status(400).json({ message: 'Collection name must be between 1 and 80 characters' });
  }
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.savedCollections.some(collection => collection.name.toLowerCase() === name.toLowerCase())) {
      return res.status(409).json({ message: 'A collection with this name already exists' });
    }
    user.savedCollections.push({ name });
    await user.save();
    return res.status(201).json({ collection: user.savedCollections.at(-1) });
  } catch (error) {
    console.error('Create collection error:', error);
    return res.status(500).json({ message: 'Failed to create collection' });
  }
};

const addPostToCollection = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.user.id, 'savedCollections._id': req.params.collectionId },
      { $addToSet: { 'savedCollections.$.posts': req.params.postId } },
      { new: true },
    ).select('savedCollections');
    if (!user) return res.status(404).json({ message: 'Collection not found' });
    const collection = user.savedCollections.id(req.params.collectionId);
    return res.json({ collection });
  } catch (error) {
    console.error('Add post to collection error:', error);
    return res.status(500).json({ message: 'Failed to update collection' });
  }
};

const getProfileInsights = async (req, res) => {
  try {
    const authorId = new (require('mongoose').Types.ObjectId)(req.user.id);
    const [summary] = await Post.aggregate([
      { $match: { author: authorId, isActive: true } },
      {
        $group: {
          _id: null,
          posts: { $sum: 1 },
          likes: { $sum: { $size: { $ifNull: ['$likes', []] } } },
          comments: { $sum: { $size: { $ifNull: ['$comments', []] } } },
          views: { $sum: { $size: { $ifNull: ['$viewedBy', []] } } },
        },
      },
    ]);

    const recentPosts = await Post.find({ author: authorId, isActive: true })
      .select('content image video voiceNote hashtags likes comments viewedBy createdAt')
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    const commentsSince = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const postTypes = { image: 0, video: 0, audio: 0, text: 0 };
    const hashtagCounts = new Map();
    const commentDates = [];

    const scored = recentPosts.map((post) => {
      const likes = (post.likes || []).length;
      const comments = (post.comments || []).length;
      const views = (post.viewedBy || []).length;

      if (post.video) postTypes.video += 1;
      else if (post.image) postTypes.image += 1;
      else if (post.voiceNote) postTypes.audio += 1;
      else postTypes.text += 1;

      (post.hashtags || []).forEach((tag) => {
        if (tag) hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1);
      });
      (post.comments || []).forEach((comment) => {
        if (comment.createdAt && new Date(comment.createdAt).getTime() >= commentsSince) {
          commentDates.push(comment.createdAt);
        }
      });

      return {
        id: String(post._id),
        snippet: (post.content || '').slice(0, 90),
        image: post.image || '',
        likes,
        comments,
        views,
        score: likes * 3 + comments * 4 + views,
      };
    });

    const topPosts = scored
      .filter((post) => post.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const topHashtags = [...hashtagCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag, count]) => ({ tag, count }));

    const totals = summary || { posts: 0, likes: 0, comments: 0, views: 0 };
    return res.json({
      insights: {
        posts: totals.posts,
        likes: totals.likes,
        comments: totals.comments,
        views: totals.views,
        postTypes,
        topPosts,
        topHashtags,
        postDates: recentPosts.map((post) => post.createdAt),
        commentDates,
      },
    });
  } catch (error) {
    console.error('Get profile insights error:', error);
    return res.status(500).json({ message: 'Failed to load insights' });
  }
};

module.exports = {
  createPost,
  getFeed,
  getPostImage,
  getPost,
  toggleLike,
  addComment,
  deletePost,
  deleteComment,
  getUserPosts,
  getUserOrbitals,
  commentReply,
  likeComment,
  getPostVideo,
  getPostVoiceNote,
  discoverNearbyPeople,
  stopSharingLocation,
  registerPostView,
  setPostArchived,
  savePost,
  unsavePost,
  getSavedPosts,
  createSavedCollection,
  addPostToCollection,
  getProfileInsights,
};