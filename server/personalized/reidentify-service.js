'use strict';

/**
 * Re-identifies existing posts with the CURRENT taxonomy (after new aliases, new seed topics, or to fix posts
 * identified before the taxonomy knew their tags). Audience evidence already collected is kept.
 *
 * Replay: if a post had no usable topics before, the interactions people already had with it taught their
 * profiles nothing. Now that the post has topics, those logged events are replayed once (with the same
 * per-post caps), so those users' interests catch up.
 */

const Post = require('../src/models/post.model');            // adjust paths to your layout
const PostMeta = require('../src/models/post.meta');
const Event = require('../models/Event');
const { extractFromContent } = require('../post_details/topic-extractor');
const { getIndex, resolvePostTopics, rootsFromTopics } = require('../post_details/topicresolver');
const { getTopInterests, getProfile, saveUpdates, DEFAULT_PERSONA } = require('./profile-service');
const { cohortLift, mergeAudience, decideState } = require('./service-audience');   // your audience-labeler file
const { INTERACTION_WEIGHTS, learnFromTopics } = require('./interest-math');
const { getOrbitalTopics, KNOWN_CONF } = require('../post_details/post-meta-service');
const { CAPS } = require('./event-service');

const LEARN_MIN_CONF = 0.2;
const LEARNABLE_TYPES = Object.keys(INTERACTION_WEIGHTS).filter((t) => INTERACTION_WEIGHTS[t] !== 0);

async function replayLearning(postId, authorId, topics, index) {
    const events = await Event.find({ post: postId, type: { $in: LEARNABLE_TYPES } })
        .sort({ createdAt: 1 })
        .select('user persona type createdAt')
        .lean();
    const learnable = topics.filter((t) => t.conf >= LEARN_MIN_CONF);
    if (!events.length || !learnable.length) return 0;

    const byUser = new Map();
    for (const e of events) {
        if (String(e.user) === String(authorId)) continue; // own post teaches nothing
        const key = `${e.user}|${e.persona || DEFAULT_PERSONA}`;
        if (!byUser.has(key)) byUser.set(key, []);
        byUser.get(key).push(e);
    }

    const relatedOf = (slug) => (index.bySlug.get(slug) || {}).related || [];
    let users = 0;
    for (const [key, list] of byUser) {
        const [userId, persona] = key.split('|');
        const profile = await getProfile(userId, persona);
        const working = { ...((profile && profile.interests) || {}) };
        const updates = {};
        const used = new Map();
        let learned = 0;

        for (const e of list) {
            if (CAPS[e.type]) {
                const n = used.get(e.type) || 0;
                used.set(e.type, n + 1);
                if (n >= CAPS[e.type]) continue;
            }
            const upd = learnFromTopics(working, learnable, INTERACTION_WEIGHTS[e.type], new Date(e.createdAt), relatedOf);
            for (const [slug, entry] of Object.entries(upd)) {
                if (entry === null) delete working[slug];
                else working[slug] = entry;
                updates[slug] = entry;
            }
            learned++;
        }
        if (learned) {
            await saveUpdates(userId, persona === DEFAULT_PERSONA ? null : persona, updates, learned);
            users++;
        }
    }
    return users;
}

async function reidentifyOne(post, meta, index, replay) {
    const extracted = extractFromContent(post.content || '');
    const rawTags = [...new Set([...extracted.raw, ...(post.hashtags || [])])];
    const [authorInterests, orbitalTopics] = await Promise.all([
        getTopInterests(post.author, meta.persona, { k: 3, min: 0.3 }).catch(() => []),
        post.orbital ? getOrbitalTopics(post.orbital).catch(() => []) : [],
    ]);

    const resolved = resolvePostTopics(index, {
        hashtags: rawTags,
        content: extracted.text,
        persona: meta.persona,
        authorInterests,
        orbitalTopics,
    });
    const base = resolved.topics;
    const textBest = base
        .filter((t) => t.src.some((s) => s === 'author' || s === 'hashtag' || s === 'caption'))
        .reduce((m, t) => Math.max(m, t.conf), 0);

    // keep what the audience already told us
    const lift = cohortLift(meta.audience);
    const topics = lift.ready ? mergeAudience(base, lift, meta.audience && meta.audience.commentTopics).topics : base;
    const state = lift.ready ? decideState(base, topics, lift) : textBest >= KNOWN_CONF ? 'known' : 'exploring';

    const hadLearnable = (meta.topics || []).some((t) => t.conf >= LEARN_MIN_CONF);
    await PostMeta.updateOne(
        { _id: meta._id },
        {
            $set: {
                baseTopics: base,
                topics,
                roots: rootsFromTopics(index, topics),
                unknownTags: resolved.unknownTags,
                'label.state': state,
                'label.updatedAt': new Date(),
            },
        }
    );

    let replayedUsers = 0;
    if (replay && !hadLearnable && topics.some((t) => t.conf >= LEARN_MIN_CONF)) {
        replayedUsers = await replayLearning(meta.post, post.author, topics, index);
    }
    return { replayedUsers };
}

async function reidentifyPosts(postIds, { replay = true } = {}) {
    const index = await getIndex({ force: true }); // pick up freshly learned aliases
    const out = { updated: 0, replayedUsers: 0 };
    for (let i = 0; i < postIds.length; i += 50) {
        const chunk = postIds.slice(i, i + 50);
        const [posts, metas] = await Promise.all([
            Post.find({ _id: { $in: chunk } }).select('content hashtags author orbital').lean(),
            PostMeta.find({ post: { $in: chunk } }).lean(),
        ]);
        const postById = new Map(posts.map((p) => [String(p._id), p]));
        for (const meta of metas) {
            const post = postById.get(String(meta.post));
            if (!post) continue;
            const r = await reidentifyOne(post, meta, index, replay);
            out.updated++;
            out.replayedUsers += r.replayedUsers;
        }
    }
    return out;
}

module.exports = { reidentifyPosts, replayLearning };