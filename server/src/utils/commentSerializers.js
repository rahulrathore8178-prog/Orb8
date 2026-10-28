/**
 * Turns stored comments/replies into the flat shape the app expects.
 * Works for NEW comments and LEGACY ones (old single `media` object, plain `image`, `voiceNote.url`).
 */

// Route that streams comment audio from Drive (see comment.routes.js).
const AUDIO_PATH = '/api/community/comments/audio';

const idOf = (v) => String(v?._id ?? v ?? '');
const hasLiked = (likes, me) => (likes || []).some((l) => String(l) === me);

const serializeUser = (u) =>
    u && u.username
        ? { _id: idOf(u), username: u.username, profilePic: u.profilePic || '' }
        : { _id: idOf(u), username: 'deleted user', profilePic: '' };

/** One media item per comment: GIF/sticker, then image, then voice note, then legacy `media`. */
function mediaOf(x) {
    if (x.gif?.url) {
        return { type: x.gif.kind === 'sticker' ? 'sticker' : 'gif', url: x.gif.url, width: x.gif.width, height: x.gif.height };
    }
    if (x.image) {
        return { type: 'image', url: x.image, width: x.imageWidth || undefined, height: x.imageHeight || undefined };
    }
    const v = x.voiceNote;
    if (v && (v.fileId || v.url)) {
        return { type: 'audio', url: v.fileId ? `${AUDIO_PATH}/${v.fileId}` : v.url, duration: v.duration || 0 };
    }
    if (x.media?.url) {
        const m = x.media;
        return { type: m.type, url: m.url, width: m.width, height: m.height, duration: m.duration };
    }
    return null;
}

const serializeComment = (c, me) => ({
    _id: idOf(c),
    parentId: null,
    content: c.content || '',
    createdAt: c.createdAt,
    author: serializeUser(c.author),
    replyTo: null,
    likeCount: (c.likes || []).length,
    liked: hasLiked(c.likes, me),
    media: mediaOf(c),
});

const serializeReply = (r, rootId, me) => ({
    _id: idOf(r),
    parentId: String(rootId),
    content: r.content || '',
    createdAt: r.createdAt,
    author: serializeUser(r.author),
    replyTo: r.replyToUser?.username ? { _id: idOf(r.replyToUser), username: r.replyToUser.username } : null,
    likeCount: (r.likes || []).length,
    liked: hasLiked(r.likes, me),
    media: mediaOf(r),
});

/** [top1, reply1a, reply1b, top2, ...]; replies carry parentId. */
function flattenComments(comments, me) {
    const out = [];
    for (const c of comments) {
        out.push(serializeComment(c, me));
        for (const r of c.replies || []) out.push(serializeReply(r, c._id, me));
    }
    return out;
}

module.exports = { idOf, hasLiked, serializeUser, serializeComment, serializeReply, flattenComments, AUDIO_PATH };