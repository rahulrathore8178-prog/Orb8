const User = require('../models/user.model');

let sendPush = () => { };
try { ({ sendPush } = require('./push')); } catch { /* push not set up yet */ }

const COMMENT_TYPES = new Set(['comment', 'reply', 'comment_like']);

// Where the app should go. Also stored on the notification, so the push tap and the in-app tap agree.
function urlFor(type, d = {}) {
    if (d.postId) {
        const q = new URLSearchParams({ from: 'notif' });
        if (COMMENT_TYPES.has(type)) {
            q.set('comments', '1');
            if (d.commentId) q.set('commentId', d.commentId);
        }
        return `/profile/savedPosts/${d.postId}?${q}`;
    }
    if (d.orbitalId) return `/orbital/${d.orbitalId}`;
    return undefined; // user-type targets are resolved in the app from data.userId
}

// type: like | comment | reply | comment_like | friend_request | friend_accept | orbital_post ...
// data: strings only, e.g. { postId, commentId, userId, orbitalId, actorId }
function notify(userId, { title, detail, type, data = {} }) {
    const url = urlFor(type, data);
    User.findByIdAndUpdate(userId, {
        $push: { notifications: { $each: [{ title, detail, type, data: { ...data, url } }], $slice: -100 } },
    }).catch(() => { });
    sendPush(userId, { title, body: detail, category: 'social', data: { url } });
}

module.exports = { notify, urlFor };