const { Post } = require("../models/post.model.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const { ROLE } = require("../models/orbitalMember.model.js");
const sharp = require("sharp");
const { uploadBufferToDrive } = require("../utils/driveUpload.js");

const MAX_CONTENT = 2000;

/** Accepts a JSON string or an array; returns clean, unique, lowercase tags (max 30). */
const parseHashtags = (raw) => {
    let list = raw;
    if (typeof raw === "string") {
        try { list = JSON.parse(raw); } catch { list = []; }
    }
    if (!Array.isArray(list)) return [];
    return [...new Set(
        list
            .filter((t) => typeof t === "string")
            .map((t) => t.trim().toLowerCase().replace(/[^a-z0-9_]/g, ""))
            .filter(Boolean)
    )].slice(0, 30);
};

const VIDEO_EXT = { "video/quicktime": "mov", "video/mp4": "mp4", "video/webm": "webm" };
const audioExt = (mime) => (mime.split("/")[1] || "webm");

/** Uploads the attached file to Drive and returns the Post fields it fills. Throws { status, message }. */
async function storeMedia(file, userId, body) {
    const mime = (file.mimetype || "").split(";")[0];
    const stamp = `${userId}-${Date.now()}`;
    const fail = (status, message) => Object.assign(new Error(message), { status });

    if (mime.startsWith("image/")) {
        let buffer;
        try {
            buffer = await sharp(file.buffer)
                .resize({ width: 800, height: 800, fit: "inside" })
                .webp({ quality: 85 })
                .toBuffer();
        } catch (err) {
            console.error("[ORBITAL POST IMAGE] sharp error:", err);
            throw fail(500, "Image transform failed");
        }
        try {
            const { fileId } = await uploadBufferToDrive(buffer, `orbital-post-${stamp}.webp`, "image/webp");
            return { image: `/api/community/posts/image/${fileId}`, imageFileId: fileId };
        } catch (err) {
            console.error("[ORBITAL POST IMAGE] drive error:", err?.response?.data || err.message || err);
            throw fail(500, "Image upload failed");
        }
    }

    if (mime.startsWith("video/")) {
        try {
            const ext = VIDEO_EXT[mime] || "mp4";
            const { fileId } = await uploadBufferToDrive(file.buffer, `orbital-post-video-${stamp}.${ext}`, mime);
            return { video: `/api/community/posts/video/${fileId}`, videoFileId: fileId };
        } catch (err) {
            console.error("[ORBITAL POST VIDEO] drive error:", err?.response?.data || err.message || err);
            throw fail(500, "Video upload failed");
        }
    }

    if (mime.startsWith("audio/")) {
        try {
            const { fileId } = await uploadBufferToDrive(file.buffer, `orbital-post-voicenote-${stamp}.${audioExt(mime)}`, mime);
            return {
                voiceNote: `/api/community/posts/voicenote/${fileId}`,
                voiceNoteFileId: fileId,
                voiceNoteDuration: Number(body.voiceNoteDuration) || 0,
            };
        } catch (err) {
            console.error("[ORBITAL POST VOICE] drive error:", err?.response?.data || err.message || err);
            throw fail(500, "Voice note upload failed");
        }
    }

    throw fail(400, "Unsupported file type. Only images, videos and audio are allowed.");
}

const createOrbitalPost = asyncHandler(async (req, res) => {
    const content = typeof req.body.content === "string" ? req.body.content.trim() : "";
    const hasFile = !!req.file?.buffer;

    // caption is optional, but a post can't be completely empty
    if (!content && !hasFile) {
        return res.status(400).json({
            success: false,
            message: "Add a caption or attach a photo, video or voice note",
        });
    }
    if (content.length > MAX_CONTENT) {
        return res.status(400).json({
            success: false,
            message: `Post content exceeds ${MAX_CONTENT} characters`,
        });
    }

    let media = {};
    if (hasFile) {
        try {
            media = await storeMedia(req.file, req.user._id, req.body);
        } catch (err) {
            return res.status(err.status || 500).json({ success: false, message: err.message });
        }
    }

    const post = await Post.create({
        author: req.user._id,
        content,
        hashtags: parseHashtags(req.body.hashtags),
        orbital: req.orbital._id,
        postType: "orbital",
        ...media,
    });

    await post.populate("author", "username fullName avatar profilePic");

    res.status(201).json({ success: true, post });
});

// Optional ?author=<userId> shows one member's posts inside this orbital
const getOrbitalPosts = asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 30);

    const filter = { orbital: req.orbital._id };
    if (req.query.author) filter.author = req.query.author;

    const [posts, total] = await Promise.all([
        Post.find(filter)
            .populate("author", "username fullName avatar profilePic orbital")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Post.countDocuments(filter),
    ]);

    res.json({ success: true, page, hasMore: page * limit < total, posts });
});

// Author can delete their own post; orbital admin can delete any post in it
const deleteOrbitalPost = asyncHandler(async (req, res) => {
    const post = await Post.findOne({ _id: req.params.postId, orbital: req.orbital._id });
    if (!post) {
        return res.status(404).json({ success: false, message: "Post not found" });
    }

    const isAuthor = String(post.author) === String(req.user._id);
    const isAdmin = req.membership.role === ROLE.ADMIN;
    if (!isAuthor && !isAdmin) {
        return res.status(403).json({ success: false, message: "Not allowed to delete this post" });
    }

    await post.deleteOne();
    res.json({ success: true, message: "Post deleted" });
});

module.exports = {
    createOrbitalPost,
    getOrbitalPosts,
    deleteOrbitalPost,
};