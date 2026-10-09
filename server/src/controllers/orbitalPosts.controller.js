const { Post } = require("../models/post.model.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const { ROLE } = require("../models/orbitalMember.model.js");
const sharp = require("sharp");
const { uploadBufferToDrive } = require("../utils/driveUpload.js");

const createOrbitalPost = asyncHandler(async (req, res) => {
    const { content, hashtags } = req.body;

    if (!content?.trim()) {
        return res.status(400).json({
            success: false,
            message: "Post content is required",
        });
    }

    let image = "";

    if (req.file) {
        if (!req.file.mimetype.startsWith("image/")) {
            return res.status(400).json({
                success: false,
                message: "Only image uploads are supported for orbital posts",
            });
        }

        const processedImageBuffer = await sharp(req.file.buffer)
            .resize({ width: 800, height: 800, fit: "inside" })
            .webp({ quality: 85 })
            .toBuffer();

        const fileName = `orbital-post-${req.user._id}-${Date.now()}.webp`;
        const { fileId } = await uploadBufferToDrive(
            processedImageBuffer,
            fileName,
            "image/webp"
        );

        image = `/api/community/posts/image/${fileId}`;
    }

    const post = await Post.create({
        author: req.user._id,
        content: content.trim(),
        hashtags,
        image,
        orbital: req.orbital._id,
        postType: 'orbital'
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