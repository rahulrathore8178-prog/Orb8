'use strict';

const PostMeta = require('../src/models/post.meta');
const { extractFromContent } = require('./topic-extractor');
const { resolveForPost, recordCandidates } = require('./topicresolver');
const { getTopInterests } = require('../personalized/profile-service');

const KNOWN_CONF = 0.5; // best text evidence at or above this = post is "known", no exploration needed

/**
 * ADAPTER: topics of an orbital (community), used as a weak prior for posts inside it.
 * Plug in your Orbital model, e.g.:
 *   const o = await Orbital.findById(orbitalId).select('topics').lean(); return o?.topics || [];
 * Returning [] just means "no orbital prior".
 */
async function getOrbitalTopics(orbitalId) {
    return [];
}

/**
 * Identifies a freshly created post. NO AI and no client help needed: pass the caption as `content`
 * and everything else is derived here. Any controller (feed, orbital, ...) can call it the same way.
 *
 *   content      the raw caption. The extractor pulls out #hashtags and cleans the text.
 *   hashtags     OPTIONAL extra tags a client chose to send (merged with the ones found in `content`)
 *   chips        OPTIONAL topic slugs a client chose to send (strongest signal when present)
 *   orbitalId    weak prior from the community the post is in
 *   promptTopics weak prior from the daily prompt the post answers (see promptTopics() in activityService)
 *
 * Flow: extract -> resolve topics (+ weak priors when the text is thin) -> label.state
 *   known      text is confident (>= 0.5): normal distribution
 *   exploring  little text: the audience will label it through the event pipeline
 *
 * Cheap (taxonomy is cached), safe to await, must never block posting: callers wrap it in try/catch.
 */
async function identifyPost({
    post,
    authorId,
    persona = null,
    mediaType = 'text',
    content = '',
    hashtags,
    chips = [],
    orbitalId = null,
    promptTopics = [],
}) {
    const extracted = extractFromContent(content);
    const rawTags = [...new Set([...extracted.raw, ...(hashtags || []).filter((t) => typeof t === 'string')])];

    const [authorInterests, orbitalTopics] = await Promise.all([
        getTopInterests(authorId, persona, { k: 3, min: 0.3 }).catch(() => []),
        orbitalId ? getOrbitalTopics(orbitalId).catch(() => []) : [],
    ]);

    const resolved = await resolveForPost({
        hashtags: rawTags,
        content: extracted.text, // hashtags, @mentions and URLs already removed
        chips,
        persona,
        authorInterests,
        orbitalTopics: [...orbitalTopics, ...(promptTopics || [])],
    });

    // "known" is decided by the author's own words only, never by priors
    const textBest = resolved.topics
        .filter((t) => t.src.some((s) => s === 'author' || s === 'hashtag' || s === 'caption'))
        .reduce((m, t) => Math.max(m, t.conf), 0);

    const meta = await PostMeta.create({
        post: post._id,
        author: authorId,
        persona,
        baseTopics: resolved.topics,
        topics: resolved.topics,
        roots: resolved.roots,
        unknownTags: resolved.unknownTags,
        label: { state: textBest >= KNOWN_CONF ? 'known' : 'exploring', updatedAt: new Date() },
        analysis: { mediaType, status: 'basic', analyzedAt: new Date() },
    });

    // bookkeeping, never part of posting
    if (resolved.unknownTags.length) {
        recordCandidates(resolved.unknownTags).catch((err) => console.error('[recordCandidates]', err.message));
    }

    return meta;
}

module.exports = { identifyPost, getOrbitalTopics, KNOWN_CONF };