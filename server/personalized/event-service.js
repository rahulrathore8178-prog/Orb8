'use strict';

const Event = require('../src/models/event');
const PostMeta = require('../src/models/post.meta');
const { INTERACTION_WEIGHTS, learnFromTopics, topInterests } = require('./interest-math');
const { getIndex, topicsFromText } = require('../post_details/topicresolver');
const { getProfile, saveUpdates, DEFAULT_PERSONA } = require('./profile-service');
const { maybeRelabel } = require('./service-audience-labeler');

const MAX_EVENTS_PER_BATCH = 100;
const MAX_DWELL_MS = 10 * 60 * 1000;
const MAX_COMMENT_TEXT = 500;
const IMPRESSION_DEDUPE_MS = 24 * 60 * 60 * 1000;

const SOCIAL_DISCOUNT = 0.3; // followers engage for the PERSON, so they count less as topic evidence
const COHORT_MAX = 5; // a viewer belongs to the cohorts of their top 5 interests...
const COHORT_MIN_EFF = 0.3; // ...if each is at least this strong
const LEARN_MIN_CONF = 0.2; // posts teach profiles only through topics we are at least this sure of

// Learning caps per user per post (lifetime), so repeating one action cannot inflate an interest.
// Events over the cap are still LOGGED (raw behavior), they just teach nothing and are not counted twice.
const CAPS = { like: 1, save: 1, share: 2, storyReshare: 2, followCreator: 1, hide: 1, notInterested: 1, comment: 2 };

// like / save are TOGGLES. The post's counters follow the NET state (like minus unlike), so a like that is
// undone and redone counts once, not twice. Learning and audience points still happen only once per post,
// so toggling can never farm an interest.
const TOGGLES = { like: 'unlike', save: 'unsave' }; // action -> its undo
const UNDO_OF = { unlike: 'like', unsave: 'save' }; // undo -> its action
const UNDO_STATS = { unlike: 'likes', unsave: 'saves' };

const SOURCES = ['feed', 'search', 'profile', 'orbital', 'explore', 'notification'];
const STATS_FIELD = {
    impression: 'impressions',
    open: 'opens',
    like: 'likes',
    comment: 'comments',
    save: 'saves',
    share: 'shares',
    storyReshare: 'shares',
    hide: 'hides',
    notInterested: 'hides',
};

const OBJECT_ID = /^[a-f0-9]{24}$/i;
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const round4 = (n) => Math.round(n * 10000) / 10000;

/**
 * ADAPTER: ids of the authors this viewer follows (as strings).
 * Plug in your follow model, e.g.:
 *   const u = await User.findById(userId).select('following').lean();
 *   return new Set((u?.following || []).map(String));
 * Returning an empty Set simply turns the social discount off.
 */
async function loadFollowingSet(userId) {
    return new Set();
}

function sanitize(events) {
    const out = [];
    for (const e of events.slice(0, MAX_EVENTS_PER_BATCH)) {
        if (!e || typeof e !== 'object') continue;
        if (!Object.prototype.hasOwnProperty.call(INTERACTION_WEIGHTS, e.type)) continue;
        if (!OBJECT_ID.test(String(e.post))) continue;
        out.push({
            post: String(e.post),
            type: e.type,
            dwellMs: clamp(Number(e.dwellMs) || 0, 0, MAX_DWELL_MS),
            source: SOURCES.includes(e.source) ? e.source : 'feed',
            text: typeof e.text === 'string' ? e.text.slice(0, MAX_COMMENT_TEXT) : '', // comments only, never stored here
        });
    }
    return out;
}

// One impression per (user, post) per 24h, so cohort rates are not inflated by refreshes/scrolling back.
async function dropRepeatImpressions(userId, events) {
    const ids = [...new Set(events.filter((e) => e.type === 'impression').map((e) => e.post))];
    let already = new Set();
    if (ids.length) {
        const since = new Date(Date.now() - IMPRESSION_DEDUPE_MS);
        const seen = await Event.find({ user: userId, post: { $in: ids }, type: 'impression', createdAt: { $gte: since } })
            .select('post')
            .lean();
        already = new Set(seen.map((s) => String(s.post)));
    }
    const inBatch = new Set();
    return events.filter((e) => {
        if (e.type !== 'impression') return true;
        if (already.has(e.post) || inBatch.has(e.post)) return false;
        inBatch.add(e.post);
        return true;
    });
}

// How many capped actions (and undo counterparts) this user already did on these posts (from the log,
// before this batch). Like/save need their undo counts too, to know the net state.
async function priorCounts(userId, events) {
    const tracked = events.filter((e) => CAPS[e.type] || UNDO_OF[e.type]);
    if (!tracked.length) return new Map();
    const types = new Set();
    for (const e of tracked) {
        types.add(e.type);
        if (TOGGLES[e.type]) types.add(TOGGLES[e.type]);
        if (UNDO_OF[e.type]) types.add(UNDO_OF[e.type]);
    }
    const rows = await Event.find({
        user: userId,
        post: { $in: [...new Set(tracked.map((e) => e.post))] },
        type: { $in: [...types] },
    })
        .select('post type')
        .lean();
    const counts = new Map();
    for (const r of rows) {
        const k = `${r.post}:${r.type}`;
        counts.set(k, (counts.get(k) || 0) + 1);
    }
    return counts;
}

/**
 * The heart of the behavior pipeline. For a batch of events from one viewer:
 *  1) log every event (append-only)
 *  2) update the POST: stats + audience counters (cohort impressions / weighted points, comment topics)
 *  3) update the VIEWER: learn interests from the post's topics (confidence-weighted)
 *  4) when a post has enough new impressions, let the audience relabel it
 *
 * Cohorts are taken from the viewer's profile BEFORE this batch, so an event never votes for a
 * cohort it just created. Own posts teach nothing. Repeats over the per-post caps are logged only.
 */
async function ingestEvents({ userId, persona = null, events }) {
    if (!userId || !Array.isArray(events)) return { accepted: 0 };
    const personaKey = persona || DEFAULT_PERSONA;

    const clean = sanitize(events);
    if (!clean.length) return { accepted: 0 };
    // both read the log BEFORE this batch is written, so run them side by side
    const [accepted, used] = await Promise.all([dropRepeatImpressions(userId, clean), priorCounts(userId, clean)]);
    if (!accepted.length) return { accepted: 0 };

    const postIds = [...new Set(accepted.map((e) => e.post))];
    const [, metas, profile, following, index] = await Promise.all([
        Event.insertMany(
            accepted.map((e) => ({ user: userId, persona: personaKey, post: e.post, type: e.type, dwellMs: e.dwellMs, source: e.source })),
            { ordered: false }
        ),
        PostMeta.find({ post: { $in: postIds } }).select('post author topics').lean(),
        getProfile(userId, personaKey),
        loadFollowingSet(userId),
        getIndex(),
    ]);

    const metaByPost = new Map(metas.map((m) => [String(m.post), m]));
    const now = new Date();
    const startInterests = (profile && profile.interests) || {};
    const cohorts = topInterests(startInterests, now, { k: COHORT_MAX, min: COHORT_MIN_EFF }).map((x) => x.slug);
    const relatedOf = (slug) => (index.bySlug.get(slug) || {}).related || [];

    const working = { ...startInterests };
    const interestUpdates = {};
    const postInc = new Map(); // postId -> { 'dotted.path': amount }
    const bump = (postId, key, amount) => {
        const inc = postInc.get(postId) || {};
        inc[key] = round4((inc[key] || 0) + amount);
        postInc.set(postId, inc);
    };
    let learned = 0;
    const impressed = new Set(); // posts that got new impressions: the only ones worth a relabel check

    for (const e of accepted) {
        const meta = metaByPost.get(e.post);
        if (!meta) continue; // old post without PostMeta: still logged above
        if (String(meta.author) === String(userId)) continue; // own posts teach nothing

        // what this user already did on this post, from the log plus earlier events in this batch
        const n = (type) => used.get(`${e.post}:${type}`) || 0;
        const before = n(e.type);
        let netBefore = 0; // like/save: currently active (1) or not (0)
        if (TOGGLES[e.type]) netBefore = n(e.type) - n(TOGGLES[e.type]);
        else if (UNDO_OF[e.type]) netBefore = n(UNDO_OF[e.type]) - n(e.type);
        used.set(`${e.post}:${e.type}`, before + 1);

        if (UNDO_OF[e.type]) {
            // unlike / unsave: take it off the counter if it was on; nothing is unlearned
            if (netBefore > 0) bump(e.post, `stats.${UNDO_STATS[e.type]}`, -1);
            continue;
        }
        const overCap = !!CAPS[e.type] && before >= CAPS[e.type];
        if (TOGGLES[e.type] && netBefore <= 0) bump(e.post, `stats.${STATS_FIELD[e.type]}`, 1); // a real (re)like / (re)save
        if (overCap) continue; // logged, but not learned or counted again

        const weight = INTERACTION_WEIGHTS[e.type];
        const social = following.has(String(meta.author)) ? SOCIAL_DISCOUNT : 1;

        if (STATS_FIELD[e.type] && !TOGGLES[e.type]) bump(e.post, `stats.${STATS_FIELD[e.type]}`, 1);

        if (e.type === 'impression') {
            impressed.add(e.post);
            bump(e.post, 'audience.totalImp', 1);
            for (const slug of cohorts) bump(e.post, `audience.cohorts.${slug}.imp`, 1);
        } else if (weight !== 0) {
            const pts = weight * social;
            bump(e.post, 'audience.totalPts', pts);
            for (const slug of cohorts) bump(e.post, `audience.cohorts.${slug}.pts`, pts);
        }

        // comments are free labeled text from the audience
        if (e.type === 'comment' && e.text) {
            for (const slug of topicsFromText(index, e.text)) bump(e.post, `audience.commentTopics.${slug}`, 1);
        }

        // learn the viewer's interests from the post's current topics
        if (weight !== 0) {
            const topics = (meta.topics || []).filter((t) => t.conf >= LEARN_MIN_CONF);
            if (topics.length) {
                const updates = learnFromTopics(working, topics, weight, now, relatedOf);
                for (const [slug, entry] of Object.entries(updates)) {
                    if (entry === null) delete working[slug];
                    else working[slug] = entry;
                    interestUpdates[slug] = entry;
                }
                learned += 1;
            }
        }
    }

    if (postInc.size) {
        await PostMeta.bulkWrite(
            [...postInc].map(([post, inc]) => ({ updateOne: { filter: { post }, update: { $inc: inc } } })),
            { ordered: false }
        );
    }
    if (Object.keys(interestUpdates).length) await saveUpdates(userId, personaKey, interestUpdates, learned);

    // relabel runs in the background, and only when impressions changed (likes/saves/shares skip the query)
    for (const post of impressed) {
        maybeRelabel(post).catch((err) => console.error('[relabel]', post, err.message));
    }

    return { accepted: accepted.length };
}

// One-liner for controllers: fire-and-forget, never throws, never delays or breaks the request.
function trackEvent(userId, event, persona = null) {
    ingestEvents({ userId, persona, events: [event] }).catch((err) => console.error('[trackEvent]', event && event.type, err.message));
}

module.exports = { ingestEvents, trackEvent, sanitize, loadFollowingSet, CAPS };