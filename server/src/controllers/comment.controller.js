const mongoose = require('mongoose');
const { Post } = require('../models/post.model');
const User = require('../models/user.model');
const { streamFileFromDrive } = require('../utils/driveUpload');
const { httpError, readCommentInput, fileIdsOf, discardFiles } = require('../utils/commentMedia');
const { idOf, hasLiked, serializeComment, serializeReply, flattenComments } = require('../utils/commentSerializers');
const { notify } = require('../utils/notify');

// Optional: push notifications (utils/push.js). Skipped silently until it exists.
// let sendPush = () => { };
// try { ({ sendPush } = require('../utils/push')); } catch { /* push not set up yet */ }

// TODO: point this at wherever recordSocialActivity lives in YOUR project.
let recordSocialActivity;
try { ({ recordSocialActivity } = require('../utils/habit')); } catch { /* see warning below */ }
if (typeof recordSocialActivity !== 'function') {
    console.warn('[comments] recordSocialActivity not found: update the require in comment.controller.js');
    recordSocialActivity = () => { };
}

/* ───────────────────────── helpers ───────────────────────── */
const isOid = (v) => typeof v === 'string' && /^[a-f\d]{24}$/i.test(v);
const oid = (v) => new mongoose.Types.ObjectId(String(v));

function fail(res, error, label) {
    if (error?.status) return res.status(error.status).json({ message: error.message });
    if (error?.name === 'CastError') return res.status(400).json({ message: 'Invalid id' });
    console.error(`${label} error:`, error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
}

// Total = comments + replies, counted inside MongoDB (no document load).
async function commentTotal(postId) {
    const [row] = await Post.aggregate([
        { $match: { _id: oid(postId) } },
        {
            $project: {
                n: {
                    $add: [
                        { $size: { $ifNull: ['$comments', []] } },
                        { $sum: { $map: { input: { $ifNull: ['$comments', []] }, as: 'c', in: { $size: { $ifNull: ['$$c.replies', []] } } } } },
                    ]
                }
            }
        },
    ]);
    return row?.n ?? 0;
}

// Finds a top-level comment OR a reply by id, loading only that thread.
async function locateComment(postId, id) {
    const pid = oid(postId);
    const cid = oid(id);

    let post = await Post.findOne(
        { _id: pid, isActive: true, 'comments._id': cid },
        { author: 1, comments: { $elemMatch: { _id: cid } } }
    ).lean();
    if (post?.comments?.[0]) return { postAuthor: post.author, root: post.comments[0], reply: null };

    post = await Post.findOne(
        { _id: pid, isActive: true, 'comments.replies._id': cid },
        { author: 1, comments: { $elemMatch: { 'replies._id': cid } } }
    ).lean();
    const root = post?.comments?.[0];
    const reply = root?.replies?.find((r) => String(r._id) === String(cid));
    return reply ? { postAuthor: post.author, root, reply } : null;
}

// In-app notification (capped at 100 per user) + push. Never blocks the request.
// function notify(userId, { title, detail }) {
//     User.findByIdAndUpdate(userId, { $push: { notifications: { $each: [{ title, detail }], $slice: -100 } } }).catch(() => { });
//     sendPush(userId, { title, body: detail, category: 'social' });
// }

// Runs the write; if it fails or matches nothing, uploaded files are removed again.
async function pushOrDiscard(filter, update, fileIds) {
    let result;
    try {
        result = await Post.updateOne(filter, update);
    } catch (error) {
        discardFiles(fileIds);
        throw error;
    }
    if (!result.matchedCount) discardFiles(fileIds);
    return result.matchedCount > 0;
}

/* ───────────────────────── endpoints ───────────────────────── */

// GET /posts/:postId/comments   (flat list, replies carry parentId)
async function getComments(req, res) {
    try {
        const { postId } = req.params;
        if (!isOid(postId)) return res.status(400).json({ message: 'Invalid post id' });

        const post = await Post.findOne({ _id: postId, isActive: true })
            .select('comments')
            .populate([
                { path: 'comments.author', select: 'username profilePic' },
                { path: 'comments.replies.author', select: 'username profilePic' },
                { path: 'comments.replies.replyToUser', select: 'username' },
            ])
            .lean();
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const all = post.comments || [];
        const total = all.reduce((n, c) => n + 1 + (c.replies?.length || 0), 0);
        const flat = flattenComments(all.slice(-200), String(req.user.id)); // newest 200 threads
        return res.status(200).json({ comments: flat, commentsCount: total });
    } catch (error) {
        return fail(res, error, 'getComments');
    }
}

// POST /posts/:postId/comments   (JSON, or multipart with "image" / "voiceNote")
async function addComment(req, res) {
    try {
        const { postId } = req.params;
        if (!isOid(postId)) return res.status(400).json({ message: 'Invalid post id' });

        const me = String(req.user.id);
        const post = await Post.findOne({ _id: postId, isActive: true }).select('author').lean();
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const input = await readCommentInput(req, me); // files are uploaded only after the post is known to exist
        const comment = {
            _id: new mongoose.Types.ObjectId(),
            author: oid(me),
            content: input.content,
            ...input.fields,
            likes: [],
            replies: [],
            createdAt: new Date(),
        };

        const saved = await pushOrDiscard({ _id: postId, isActive: true }, { $push: { comments: comment } }, input.fileIds);
        if (!saved) return res.status(404).json({ message: 'Post not found' });

        const [meDoc, total] = await Promise.all([
            User.findById(me).select('username profilePic').lean(),
            commentTotal(postId),
        ]);

        if (String(post.author) !== me) {
            notify(post.author, {
                title: '💬 New Comment', detail: `${meDoc?.username} commented on your post`,
                type: 'comment', data: { postId: String(postId), commentId: String(comment._id), actorId: me },
            });
        };

        recordSocialActivity(me);

        return res.status(201).json({
            message: 'Comment added',
            comment: serializeComment({ ...comment, author: meDoc }, me),
            commentsCount: total,
        });
    } catch (error) {
        return fail(res, error, 'addComment');
    }
}

// POST /posts/:postId/:commentId/commentReplies   (commentId = the thread's top-level comment)
// body.replyToId (optional) = the reply being answered ("reply to a reply")
async function commentReply(req, res) {
    try {
        const { postId, commentId } = req.params;
        if (!isOid(postId) || !isOid(commentId)) return res.status(400).json({ message: 'Invalid post or comment id' });

        const cid = oid(commentId);
        const post = await Post.findOne(
            { _id: postId, isActive: true, 'comments._id': cid },
            { author: 1, comments: { $elemMatch: { _id: cid } } }
        ).lean();
        const root = post?.comments?.[0];
        if (!root) return res.status(404).json({ message: 'Comment not found' });

        const me = String(req.user.id);
        const input = await readCommentInput(req, me);

        const replyToId = req.body?.replyToId;
        const target = isOid(replyToId) ? (root.replies || []).find((r) => String(r._id) === replyToId) : null;

        const reply = {
            _id: new mongoose.Types.ObjectId(),
            author: oid(me),
            content: input.content,
            ...input.fields,
            ...(target ? { replyToUser: target.author } : {}),
            likes: [],
            createdAt: new Date(),
        };

        const saved = await pushOrDiscard(
            { _id: postId, isActive: true, 'comments._id': cid },
            { $push: { 'comments.$.replies': reply } },
            input.fileIds
        );
        if (!saved) return res.status(404).json({ message: 'Comment not found' });

        const [meDoc, targetUser, total] = await Promise.all([
            User.findById(me).select('username profilePic').lean(),
            target ? User.findById(target.author).select('username').lean() : null,
            commentTotal(postId),
        ]);

        // Tell the thread owner and the person being answered (once each, never yourself).
        const who = new Set([String(root.author), target && String(target.author)].filter(Boolean));
        who.delete(me);
        who.forEach((uid) => notify(uid, {
            title: '↩️ New Reply', detail: `${meDoc?.username} replied to your comment`,
            type: 'reply', data: { postId: String(postId), commentId: String(commentId), replyId: String(reply._id), actorId: me },
        }));

        const out = serializeReply({ ...reply, author: meDoc, replyToUser: targetUser }, commentId, me);
        return res.status(201).json({ message: 'Reply added', comment: out, reply: out, commentsCount: total });
    } catch (error) {
        return fail(res, error, 'commentReply');
    }
}

// POST /posts/:postId/:commentId/likeComment   body: { liked?: boolean }   (comments AND replies)
async function likeComment(req, res) {
    try {
        const { postId, commentId } = req.params;
        if (!isOid(postId) || !isOid(commentId)) return res.status(400).json({ message: 'Invalid id' });

        const me = String(req.user.id);
        const hit = await locateComment(postId, commentId);
        if (!hit) return res.status(404).json({ message: 'Comment not found' });

        const item = hit.reply || hit.root;
        const likes = item.likes || [];
        const was = hasLiked(likes, me);
        const want = typeof req.body?.liked === 'boolean' ? req.body.liked : !was; // explicit state is idempotent

        if (want !== was) {
            const op = want ? '$addToSet' : '$pull';
            if (hit.reply) {
                await Post.updateOne(
                    { _id: postId },
                    { [op]: { 'comments.$[c].replies.$[r].likes': oid(me) } },
                    { arrayFilters: [{ 'c._id': hit.root._id }, { 'r._id': oid(commentId) }] }
                );
            } else {
                await Post.updateOne({ _id: postId, 'comments._id': oid(commentId) }, { [op]: { 'comments.$.likes': oid(me) } });
            }
            if (want && String(item.author) !== me) {
                const liker = await User.findById(me).select('username').lean();
                notify(item.author, {
                    title: '❤️ Comment like', detail: `${liker?.username} liked your comment`,
                    type: 'comment_like', data: { postId: String(postId), commentId: String(hit.root._id), actorId: me },
                });
            }
        }

        const likeCount = Math.max(0, likes.length + (want === was ? 0 : want ? 1 : -1));
        return res.status(200).json({ liked: want, likeCount });
    } catch (error) {
        return fail(res, error, 'likeComment');
    }
}

// DELETE /posts/:postId/comments/:commentId   (comment or reply; its author or the post author)
async function deleteComment(req, res) {
    try {
        const { postId, commentId } = req.params;
        if (!isOid(postId) || !isOid(commentId)) return res.status(400).json({ message: 'Invalid id' });

        const me = String(req.user.id);
        const hit = await locateComment(postId, commentId);
        if (!hit) return res.status(404).json({ message: 'Comment not found' });

        const item = hit.reply || hit.root;
        if (idOf(item.author) !== me && idOf(hit.postAuthor) !== me) {
            return res.status(403).json({ message: 'You can only delete your own comments' });
        }

        let removed = 1;
        let files = fileIdsOf(item);
        if (hit.reply) {
            await Post.updateOne(
                { _id: postId, 'comments._id': hit.root._id },
                { $pull: { 'comments.$.replies': { _id: oid(commentId) } } }
            );
        } else {
            const replies = hit.root.replies || [];
            removed += replies.length;
            files = files.concat(replies.flatMap(fileIdsOf));
            await Post.updateOne({ _id: postId }, { $pull: { comments: { _id: oid(commentId) } } });
        }
        discardFiles(files); // frees the Drive storage too

        return res.status(200).json({
            message: 'Comment deleted successfully',
            removed,
            commentsCount: await commentTotal(postId),
        });
    } catch (error) {
        return fail(res, error, 'deleteComment');
    }
}

// GET /comments/audio/:fileId   (public: the audio player cannot send auth headers)
// Only streams files that are registered as a comment voice note.
async function streamCommentAudio(req, res) {
    try {
        const { fileId } = req.params;
        if (!/^[\w-]{10,100}$/.test(fileId)) return res.status(400).json({ message: 'Invalid file id' });

        const known = await Post.exists({
            $or: [{ 'comments.voiceNote.fileId': fileId }, { 'comments.replies.voiceNote.fileId': fileId }],
        });
        if (!known) return res.status(404).json({ message: 'Not found' });

        res.setHeader('Cache-Control', 'public, max-age=86400');
        await streamFileFromDrive(fileId, res, req, 'audio/mp4'); // handles Range requests, so seeking works
    } catch (error) {
        if (!res.headersSent) return res.status(502).json({ message: 'Could not stream audio' });
        res.end();
    }
}

module.exports = { getComments, addComment, commentReply, likeComment, deleteComment, streamCommentAudio };