const { Post } = require('../models/post.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const FormData = require('form-data'); // npm i form-data
const { OrbitalMember, STATUS: ORBITAL_STATUS } = require('../models/orbitalMember.model');
const sharp = require('sharp');
const axios = require('axios');
const { uploadBufferToDrive, deleteFileFromDrive, streamFileFromDrive } = require('../utils/driveUpload');
const { recordSocialActivity } = require('../utils/habit');
const { fileIdsOf, discardFiles } = require('../utils/commentMedia');
const { notify } = require('../utils/notify');
// const { recordSocialActivity } = require('../services/activityService');   // keep YOUR existing import path
const { identifyPost } = require('../../post_details/post-meta-service');
const { extractFromContent, sanitizeTag } = require('../../post_details/topic-extractor');
const { ingestEvents } = require('../../personalized/event-service.js');
const { getRankedFeedIds } = require('../../personalized/feed-service')
const { trackEvent } = require('../../personalized/event-service');


// Total comments + replies
const countAll = (comments) => (comments || []).reduce((n, c) => n + 1 + (c.replies?.length || 0), 0);

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
- The output must parse with json.loads.`;

async function analyzeImage(fileBuffer, fileName, mimeType, postId) {
  const form = new FormData();
  form.append('file', fileBuffer, { filename: fileName, contentType: mimeType });
  form.append('post_id', postId);
  form.append('prompt', analysis_prompt);

  try {
    const res = await axios.post(`${PYTHON_API_URL}/describe_image`, form, {
      headers: form.getHeaders(),
      timeout: 30000,
    });
    return res.data.analysis;
  } catch (error) {
    console.error('image analyze error', error?.response?.data || error.message);
    return null;
  }
}

// --- visual analysis (CLIP/VLM) PARKED: uncomment this block, the blocks marked "PARKED" below, and ANALYZER_URL ---
// const PostMeta = require('../models/PostMeta');
// const { getIndex } = require('../services/topicResolver');

const MAX_CONTENT_LENGTH = 2000;
const MAX_AUDIO_BYTES = 15 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const POST_TYPES = ['feed', 'orbital'];
const PERSONAS = ['social', 'professional', 'private']; // optional until you build personas

// PARKED: analyzer settings
// const ANALYZER_URL = process.env.ANALYZER_URL || 'http://localhost:8000';
// const ANALYZER_TIMEOUT_MS = 90 * 1000;
// const MIN_TOPIC_CONF = 0.2;
// const MAX_TOPIC_CONF = 0.95;
// const MAX_TOPICS = 8;
// const MISMATCH_PENALTY_FROM = 0.5;

function parseStringArray(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch (err) {
    return [];
  }
}

// PARKED: CLIP merge + background analyzer job (image/video -> Python /analyze_post)
// function mergeClipResult(existingTopics, result, rootOf) {
//   const mismatch = result.mismatch_uncertain ? 0 : Number(result.mismatch) || 0;
//   const topics = new Map(existingTopics.map((t) => [t.slug, { conf: t.conf, src: new Set(t.src || []) }]));
//   if (mismatch >= MISMATCH_PENALTY_FROM) {
//     for (const v of topics.values()) {
//       if (v.src.has('author') || v.src.has('hashtag')) v.conf *= 1 - 0.5 * mismatch;
//     }
//   }
//   for (const ct of Array.isArray(result.clip_topics) ? result.clip_topics : []) {
//     if (!ct || typeof ct.slug !== 'string' || typeof ct.conf !== 'number') continue;
//     const cur = topics.get(ct.slug);
//     if (cur) { cur.conf = 1 - (1 - cur.conf) * (1 - ct.conf); cur.src.add('clip'); }
//     else topics.set(ct.slug, { conf: ct.conf, src: new Set(['clip']) });
//   }
//   const merged = [...topics]
//     .map(([slug, v]) => ({ slug, conf: Math.round(Math.min(MAX_TOPIC_CONF, v.conf) * 100) / 100, src: [...v.src] }))
//     .filter((t) => t.conf >= MIN_TOPIC_CONF)
//     .sort((a, b) => b.conf - a.conf)
//     .slice(0, MAX_TOPICS);
//   const rootMax = new Map();
//   for (const t of merged) {
//     const root = rootOf(t.slug);
//     if (root) rootMax.set(root, Math.max(rootMax.get(root) || 0, t.conf));
//   }
//   const roots = [...rootMax].map(([root, conf]) => ({ root, conf })).sort((a, b) => b.conf - a.conf);
//   return { topics: merged, roots, mismatch, uncertain: !!result.mismatch_uncertain };
// }
//
// // NOTE: when re-enabling, merge into baseTopics (not topics), otherwise the audience job overwrites it.
// async function analyzeAndMerge({ postId, buffer, mimetype, filename }) {
//   try {
//     const meta = await PostMeta.findOne({ post: postId });
//     if (!meta) return;
//     const index = await getIndex();
//     const rootOf = (slug) => index.bySlug.get(slug)?.root;
//     const declaredRoots = [...new Set(meta.baseTopics.filter((t) => t.conf >= 0.5).map((t) => rootOf(t.slug)).filter(Boolean))];
//
//     const form = new FormData();
//     form.append('file', new Blob([buffer], { type: mimetype }), filename || 'upload');
//     form.append('post_id', String(postId));
//     form.append('declared_roots', JSON.stringify(declaredRoots));
//     form.append('persona', meta.persona || '');
//
//     const resp = await fetch(`${ANALYZER_URL}/analyze_post`, { method: 'POST', body: form, signal: AbortSignal.timeout(ANALYZER_TIMEOUT_MS) });
//     if (!resp.ok) throw new Error(`analyzer responded ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
//     const result = await resp.json();
//
//     const merged = mergeClipResult(meta.baseTopics.map((t) => t.toObject()), result, rootOf);
//     await PostMeta.updateOne({ _id: meta._id }, { $set: {
//       baseTopics: merged.topics, topics: merged.topics, roots: merged.roots,
//       'analysis.status': 'deep', 'analysis.mismatch': merged.mismatch,
//       'analysis.nearDuplicateOf': result.near_duplicate_of || null, 'analysis.analyzedAt': new Date(),
//     } });
//   } catch (err) {
//     console.error('[analyzeAndMerge]', postId, err.message);
//     await PostMeta.updateOne({ post: postId }, { $set: { 'analysis.status': 'failed' } }).catch(() => {});
//   }
// }

async function createPost(req, res) {
  try {
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
    const hasFile = !!(req.file && req.file.buffer);

    // caption is optional, but a post can't be completely empty
    if (!content && !hasFile) {
      return res.status(400).json({ message: 'Add a caption or attach a photo, video or voice note' });
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      return res.status(400).json({ message: 'Post content exceeds 2000 characters' });
    }

    // raw tags go to the topic resolver (it understands "c++", "react.js"); the cleaned list is what we store
    const extracted = extractFromContent(content);              // finds #tags in the caption
    const extraTags = parseStringArray(req.body.hashtags);      // optional extras, normally empty
    const hashtags = [...new Set([...extracted.stored, ...extraTags.map(sanitizeTag).filter(Boolean)])].slice(0, 30);
    console.log('[createPost] from caption:', extracted.raw, 'stored:', hashtags);

    // topic chips picked in the composer (max 3) + optional persona
    const chips = parseStringArray(req.body.topics).slice(0, 3);
    const persona = PERSONAS.includes(req.body.persona) ? req.body.persona : null;

    const postData = {
      author: req.user.id,
      content,
      hashtags,
      image: '',
      video: '',
      postType: POST_TYPES.includes(req.body.postType) ? req.body.postType : 'feed',
      orbital: req.body.orbital && mongoose.isValidObjectId(req.body.orbital) ? req.body.orbital : null,
      voiceNote: '',
      voiceNoteFileId: '',
      voiceNoteDuration: 0,
    };

    // PARKED: what we would hand to the Python analyzer
    // let analysisInput = null;

    if (hasFile) {
      const isImage = req.file.mimetype.startsWith('image/');
      const isVideo = req.file.mimetype.startsWith('video/');
      const isVoiceNote = req.file.mimetype.startsWith('audio/');

      if (!isImage && !isVideo && !isVoiceNote) {
        return res.status(400).json({ message: 'Unsupported file type. Only images, videos, and audio are allowed.' });
      }

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
          const fileName = `post-${req.user.id}-${Date.now()}.webp`;
          const { fileId } = await uploadBufferToDrive(processedImageBuffer, fileName, 'image/webp');
          postData.image = `/api/community/posts/image/${fileId}`;
          postData.imageFileId = fileId;
          // PARKED: analysisInput = { buffer: processedImageBuffer, mimetype: 'image/webp', filename: fileName };
        } catch (err) {
          console.error('[POST IMAGE] Drive upload error:', err?.response?.data || err.message || err);
          return res.status(500).json({ message: 'Image upload failed (drive)' });
        }
      }

      if (isVoiceNote) {
        if (req.file.size > MAX_AUDIO_BYTES) {
          return res.status(400).json({ message: 'Voice note exceeds max allowed size (15MB)' });
        }
        try {
          const ext = (req.file.mimetype.split('/')[1] || 'webm').split(';')[0];
          const fileName = `post-voicenote-${req.user.id}-${Date.now()}.${ext}`;
          const { fileId } = await uploadBufferToDrive(req.file.buffer, fileName, req.file.mimetype);
          postData.voiceNote = `/api/community/posts/voicenote/${fileId}`;
          postData.voiceNoteFileId = fileId;
          postData.voiceNoteDuration = Number(req.body.voiceNoteDuration) || 0;
        } catch (err) {
          console.error('[POST VOICE NOTE] Drive upload error:', err?.response?.data || err.message || err);
          return res.status(500).json({ message: 'Voice note upload failed (drive)' });
        }
      }

      if (isVideo) {
        if (req.file.size > MAX_VIDEO_BYTES) {
          return res.status(400).json({ message: 'Video exceeds max allowed size (50MB)' });
        }
        try {
          const ext = (req.file.mimetype.split('/')[1] || 'mp4').split(';')[0];
          const fileName = `post-video-${req.user.id}-${Date.now()}.${ext}`;
          const { fileId } = await uploadBufferToDrive(req.file.buffer, fileName, req.file.mimetype);
          postData.video = `/api/community/posts/video/${fileId}`;
          postData.videoFileId = fileId;
          // PARKED: analysisInput = { buffer: req.file.buffer, mimetype: req.file.mimetype, filename: fileName };
        } catch (err) {
          console.error('[POST VIDEO] Drive upload error:', err?.response?.data || err.message || err);
          return res.status(500).json({ message: 'Video upload failed (drive)' });
        }
      }
    }

    const post = await Post.create(postData);
    await post.populate('author', 'username profilePic league level totalXp');

    // Identify the post from TEXT + weak priors (author's interests, orbital). Instant and free.
    // Posts with little text start in label.state = 'exploring': the audience labels them later
    // through the event pipeline (POST /events/batch). Must never block posting.
    const mediaType = postData.video ? 'video' : postData.image ? 'image' : postData.voiceNote ? 'audio' : 'text';
    try {
      await identifyPost({
        post,
        authorId: req.user.id,
        persona,
        mediaType,
        hashtags: extraTags,
        content,
        chips,
        orbitalId: postData.orbital,
      });
    } catch (err) {
      console.error('[identifyPost]', err.message);
    }

    // PARKED: background CLIP analysis
    // if (analysisInput) analyzeAndMerge({ postId: post._id, ...analysisInput });

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
          totalXp: post.author.totalXp || 0,
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
        updatedAt: post.updatedAt,
      },
    });
  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json({ message: 'Failed to create post' });
  }
}
async function deletePost(req, res) {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (String(post.author) !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this post' });
    }

    // post files + every comment/reply file
    const ids = [post.driveFileId, post.imageFileId, post.videoFileId, post.voiceNoteFileId].filter(Boolean);
    (post.comments || []).forEach((c) => {
      ids.push(...fileIdsOf(c));
      (c.replies || []).forEach((r) => ids.push(...fileIdsOf(r)));
    });

    await Post.findByIdAndDelete(req.params.postId);
    discardFiles(ids);
    return res.status(200).json({ message: 'Post and associated files deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json({ message: 'Failed to delete post' });
  }
}

// Edit Post Caption
async function editPostCaption(req, res) {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (String(post.author) !== req.user.id) {
      return res.status(403).json({ message: 'Only author can make changes' });
    }

    const hashtags = content?.match(/#\w+/g)?.map((tag) => tag.toLowerCase()) || [];

    post.content = content;
    post.hashtags = hashtags;
    await post.save();
    await post.populate('author', 'username profilePic league level totalXp');

    return res.status(200).json({
      message: 'Post caption updated successfully',
      post: {
        id: String(post._id),
        author: {
          id: String(post.author._id),
          username: post.author.username,
          profilePic: post.author.profilePic || '',
          league: post.author.league || 'Bronze 1',
          level: post.author.level || 1,
          totalXp: post.author.totalXp || 0,
        },
        content: post.content,
        hashtags: post.hashtags || [],
        image: post.image,
        video: post.video,
        voiceNote: post.voiceNote,
        updatedAt: post.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error editing post caption:', error);
    return res.status(500).json({ message: error.message });
  }
}

// Get feed with pagination
const LIST_CAP = 100; // same size as the personalized list

async function getFeed(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const isOrbital = req.query.type === 'orbital';

    // ---- visibility filter: unchanged. It is applied to EVERY candidate, so personalization can never
    // show a post this feed would have hidden.
    const filter = { isActive: true, isArchived: { $ne: true } };

    const viewer = await User.findById(req.user.id).select('friends blockedUsers savedPosts').lean();
    if (!viewer) return res.status(404).json({ message: 'User not found' });
    const allowedPrivateAuthors = [...(viewer.friends || []), viewer._id];
    const hiddenPrivateUsers = await User.find({
      isPrivate: true,
      _id: { $nin: allowedPrivateAuthors },
    }).distinct('_id');
    filter.author = { $nin: [...hiddenPrivateUsers, ...(viewer.blockedUsers || [])] };

    if (isOrbital) filter.orbital = { $ne: null };
    else filter.orbital = null;

    // ---- which posts, in which order
    let rankedIds;
    let reasons = null;
    if (isOrbital) {
      // orbital tab stays chronological for now
      const rows = await Post.find(filter).select('_id').sort({ createdAt: -1 }).limit(LIST_CAP).lean();
      rankedIds = rows.map((r) => String(r._id));
    } else {
      // page 1 re-ranks; page 2+ reads the same list (cached ~5 min) so pages never overlap or skip
      ({ ids: rankedIds, reasons } = await getRankedFeedIds({ viewer, filter, refresh: page === 1 }));
    }

    const total = rankedIds.length;
    const start = (page - 1) * limit;
    const pageIds = rankedIds.slice(start, start + limit);

    const found = pageIds.length
      ? await Post.find({ _id: { $in: pageIds } })
        .populate('author', 'username profilePic league level totalXp orbital')
        .populate('comments.author', 'username profilePic')
        .populate('comments.replies.author', 'username profilePic')
        .populate('orbital', 'name description visibility image')
        .lean()
      : [];
    const byId = new Map(found.map((p) => [String(p._id), p]));
    const posts = pageIds.map((pid) => byId.get(pid)).filter(Boolean); // keeps the ranked order

    const currentUserId = String(req.user?.id || '');
    const savedPostIds = new Set((viewer.savedPosts || []).map((item) => String(item.post)));
    const showWhy = req.query.debug === '1' && process.env.NODE_ENV !== 'production'; // see why each post is here

    const formattedPosts = posts
      .filter((post) => post?.author)
      .map((post) => ({
        id: String(post._id),
        author: {
          id: String(post.author._id),
          username: post.author.username || 'Unknown',
          profilePic: post.author.profilePic || '',
          league: post.author.league || 'Bronze 1',
          level: post.author.level || 1,
          totalXp: post.author.totalXp || 0,
        },
        content: post.content || '',
        hashtags: post.hashtags || [],
        image: post.image || '',
        video: post.video || '',
        views: post.views || 0,
        viewedBy: (post.viewedBy || []).map((id) => String(id)),
        voiceNote: post.voiceNote || '',
        voiceNoteDuration: post.voiceNoteDuration || 0,
        likes: (post.likes || []).map((id) => String(id)),
        comments: (post.comments || [])
          .filter((comment) => comment?.author)
          .map((comment) => ({
            id: String(comment._id),
            postId: String(post._id),
            author: {
              id: String(comment.author._id),
              username: comment.author.username || 'Unknown',
              profilePic: comment.author.profilePic || '',
            },
            content: comment.content || '',
            createdAt: comment.createdAt,
            likesCount: comment.likes?.length || 0,
            isLikedByCurrentUser: comment.likes?.some((id) => String(id) === currentUserId) ?? false,
            replies: (comment.replies || [])
              .filter((reply) => reply?.author)
              .map((reply) => ({
                id: String(reply._id),
                author: {
                  id: String(reply.author._id),
                  username: reply.author.username || 'Unknown',
                  profilePic: reply.author.profilePic || '',
                },
                content: reply.content || '',
                createdAt: reply.createdAt,
              })),
          })),
        likesCount: post.likes?.length || 0,
        commentsCount: countAll(post.comments),
        isLikedByCurrentUser: post.likes?.some((id) => String(id) === currentUserId) ?? false,
        isSavedByCurrentUser: savedPostIds.has(String(post._id)),
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        orbital: post.orbital || null,
        postType: post.postType || 'feed',
        ...(showWhy && reasons ? { why: reasons.get(String(post._id)) } : {}),
      }));

    // Close the learning loop: everything served counts as an impression (de-duplicated per 24h).
    // Interim until the app reports what was actually on screen; ranking is never blocked by it.
    if (formattedPosts.length) {
      ingestEvents({
        userId: req.user.id,
        events: formattedPosts.map((p) => ({ post: p.id, type: 'impression', source: 'feed' })),
      }).catch((err) => console.error('[feed impressions]', err));
    }

    return res.status(200).json({
      posts: formattedPosts,
      pagination: { page, limit, total, hasMore: start + limit < total },
    });
  } catch (error) {
    console.error('Get feed error:', error);
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
    const post = await Post.findById(req.params.postId)
      .populate('author', 'username profilePic league level totalXp isPrivate friends blockedUsers')
      .populate('orbital', 'name image visibility')
      .populate('comments.author', 'username profilePic')
      .populate('comments.replies.author', 'username profilePic')
      .lean();

    if (!post || !post.isActive || (post.isArchived && String(post.author?._id) !== String(req.user.id))) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const viewer = await User.findById(req.user.id).select('blockedUsers').lean();
    const authorBlockedViewer = post.author.blockedUsers?.some((id) => String(id) === String(req.user.id));
    const viewerBlockedAuthor = viewer?.blockedUsers?.some((id) => String(id) === String(post.author._id));
    const isAuthorFriend = post.author.friends?.some((id) => String(id) === String(req.user.id));
    if (authorBlockedViewer || viewerBlockedAuthor
      || (post.author.isPrivate && !isAuthorFriend && String(post.author._id) !== String(req.user.id))) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const currentUserId = String(req.user.id);
    const comments = (post.comments || []).filter((c) => c?.author);

    const formattedPost = {
      id: String(post._id),
      author: {
        id: String(post.author._id),
        username: post.author.username,
        profilePic: post.author.profilePic || '',
        league: post.author.league || 'Bronze 1',
        level: post.author.level || 1,
        totalXp: post.author.totalXp || 0,
      },
      hashtags: post.hashtags || [],
      content: post.content,
      image: post.image,
      video: post.video || '',
      voiceNote: post.voiceNote || '',
      voiceNoteDuration: post.voiceNoteDuration || 0,
      orbital: post.orbital && post.orbital.name
        ? { id: String(post.orbital._id), name: post.orbital.name, image: post.orbital.image || '', visibility: post.orbital.visibility }
        : null,
      likes: (post.likes || []).map((id) => String(id)),
      comments: comments.map((comment) => ({
        id: String(comment._id),
        author: {
          id: String(comment.author._id),
          username: comment.author.username,
          profilePic: comment.author.profilePic || '',
        },
        content: comment.content,
        createdAt: comment.createdAt,
        replies: (comment.replies || [])
          .filter((r) => r?.author)
          .map((reply) => ({
            id: String(reply._id),
            author: { id: String(reply.author._id), username: reply.author.username },
            content: reply.content,
            createdAt: reply.createdAt,
          })),
      })),
      likesCount: (post.likes || []).length,
      commentsCount: countAll(post.comments),
      isLikedByCurrentUser: (post.likes || []).some((id) => String(id) === currentUserId),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
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
    const userId = req.user.id;
    const post = await Post.findById(req.params.postId);

    if (!post || !post.isActive) return res.status(404).json({ message: 'Post not found' });

    const userIdString = String(userId);
    const likeIndex = post.likes.findIndex((id) => String(id) === userIdString);

    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
      await post.save();
      trackEvent(userId, { post: String(post._id), type: 'unlike' });
      return res.status(200).json({ message: 'Post unliked', likesCount: post.likes.length, isLiked: false });
    }

    post.likes.push(userId);
    await post.save();

    if (String(post.author) !== userIdString) {
      const liker = await User.findById(userId).select('username');
      notify(post.author, {
        title: '❤️ New Like', detail: `${liker.username} liked your post`,
        type: 'like', data: { postId: String(post._id), actorId: userIdString },
      });
    }

    recordSocialActivity(userId);
    trackEvent(userId, { post: String(post._id), type: 'like' });
    return res.status(200).json({ message: 'Post liked', likesCount: post.likes.length, isLiked: true });
  } catch (error) {
    console.error('Toggle like error:', error);
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
      const isBlocked = viewer?.blockedUsers?.some((id) => String(id) === String(userId))
        || profileOwner.blockedUsers?.some((id) => String(id) === String(req.user.id));
      const canView = !profileOwner.isPrivate
        || viewer?.friends?.some((id) => String(id) === String(userId));
      if (isBlocked || !canView) return res.status(403).json({ message: 'This profile is private' });
    }
    const filter = { author: userId, isActive: true };
    if (isOwner && req.query.archived === 'true') filter.isArchived = true;
    else filter.isArchived = { $ne: true };

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

    const formattedPosts = posts
      .filter((post) => post?.author)
      .map((post) => ({
        id: String(post._id),
        author: {
          id: String(post.author._id),
          username: post.author.username,
          profilePic: post.author.profilePic || '',
          league: post.author.league || 'Bronze 1',
          level: post.author.level || 1,
          totalXp: post.author.totalXp || 0,
        },
        content: post.content,
        image: post.image,
        video: post.video || '',
        voiceNote: post.voiceNote || '',
        voiceNoteDuration: post.voiceNoteDuration || 0,
        hashtags: post.hashtags || [],
        likes: (post.likes || []).map((id) => String(id)),
        views: post.views || 0,
        viewedBy: (post.viewedBy || []).map((id) => String(id)),
        comments: [...(post.comments || [])]
          .filter((c) => c?.author)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((comment) => ({
            id: String(comment._id),
            author: {
              id: String(comment.author._id),
              username: comment.author.username,
              profilePic: comment.author.profilePic || '',
            },
            content: comment.content,
            createdAt: comment.createdAt,
          })),
        likesCount: (post.likes || []).length,
        commentsCount: countAll(post.comments),
        isLikedByCurrentUser: (post.likes || []).some((id) => String(id) === currentUserId),
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      }));

    return res.status(200).json({
      posts: formattedPosts,
      pagination: { page, limit, total, totalPages, hasMore: page < totalPages },
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    return res.status(500).json({ message: error.message });
  }
}

/**
 * Orbitals a user is an active member of.
 * GET /api/community/users/:userId/orbitals
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
      const isBlocked = viewer?.blockedUsers?.some((id) => String(id) === String(userId))
        || profileOwner.blockedUsers?.some((id) => String(id) === viewerId);
      const canView = !profileOwner.isPrivate
        || viewer?.friends?.some((id) => String(id) === String(userId));
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

    let visible = memberships.filter((m) => m.orbital);

    if (!isOwner) {
      const privateIds = visible.filter((m) => m.orbital.visibility === 'private').map((m) => m.orbital._id);
      const viewerMemberships = privateIds.length
        ? await OrbitalMember.find({ user: viewerId, status: ORBITAL_STATUS.ACTIVE, orbital: { $in: privateIds } })
          .select('orbital')
          .lean()
        : [];
      const allowed = new Set(viewerMemberships.map((m) => String(m.orbital)));
      visible = visible.filter((m) => m.orbital.visibility !== 'private' || allowed.has(String(m.orbital._id)));
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

    const nearbyUsers = await User.aggregate([
      {
        $geoNear: {
          key: 'location',
          near: { type: 'Point', coordinates: [sharedLng, sharedLat] },
          distanceField: 'distance',
          maxDistance: 500,
          spherical: true,
          query: { _id: { $ne: user._id }, isDiscoverable: true },
        },
      },
      {
        $project: {
          username: 1,
          profilePicture: '$profilePic',
          distance: { $round: ['$distance', 0] },
        },
      },
    ]);

    return res.status(200).json({ nearbyUsers });
  } catch (error) {
    console.error('finding nearby people error:', error);
    return res.status(500).json({ message: 'Failed to find nearby people' });
  }
};

const stopSharingLocation = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user.id },
      { $set: { isDiscoverable: false }, $unset: { locationUpdatedAt: 1 } }
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
      { $inc: { views: 1 }, $addToSet: { viewedBy: userId } }
    );

    return res.status(200).json({ counted: result.modifiedCount === 1 });
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

    const result = await User.updateOne(
      { _id: req.user.id, 'savedPosts.post': { $ne: post._id } },
      { $push: { savedPosts: { post: post._id } } },
    );
    if ((result.modifiedCount ?? result.nModified ?? 0) > 0) {
      trackEvent(req.user.id, { post: String(post._id), type: 'save' });
    }
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
    trackEvent(req.user.id, { post: String(req.params.postId), type: 'unsave' });
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
    return res.json({ savedPosts: (user.savedPosts || []).filter((item) => item.post) });
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
    if (user.savedCollections.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
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
    const authorId = new mongoose.Types.ObjectId(req.user.id);
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

    const topPosts = scored.filter((p) => p.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
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
        postDates: recentPosts.map((p) => p.createdAt),
        commentDates,
      },
    });
  } catch (error) {
    console.error('Get profile insights error:', error);
    return res.status(500).json({ message: 'Failed to load insights' });
  }
};

const toggleDiscoverable = async (req, res) => {
  try {
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ message: 'enabled must be a boolean' });
    }

    const update = { isDiscoverable: enabled };
    if (!enabled) update.locationUpdatedAt = null;

    await User.updateOne({ _id: req.user.id }, { $set: update });

    return res.status(200).json({
      success: true,
      isDiscoverable: enabled,
      message: enabled ? 'Nearby discovery enabled' : 'Nearby discovery disabled',
    });
  } catch (error) {
    console.error('toggle discoverability error:', error);
    return res.status(500).json({ message: 'Failed to update discoverability' });
  }
};

const getDiscoverSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('isDiscoverable');
    return res.json({ isDiscoverable: !!user?.isDiscoverable });
  } catch (error) {
    console.error('discover settings error:', error);
    return res.status(500).json({ message: 'Failed to load settings' });
  }
};

module.exports = {
  createPost,
  getFeed,
  getPostImage,
  editPostCaption,
  getPost,
  toggleLike,
  deletePost,
  getUserPosts,
  getUserOrbitals,
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
  toggleDiscoverable,
  getDiscoverSettings,
  getProfileInsights,
};