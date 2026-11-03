'use strict';

/**
 * Tag learner: turns unknown hashtags into knowledge, so the taxonomy grows from real usage.
 *
 * For each CANDIDATE tag (an unknown hashtag people keep using) we look at the posts that carry it and ask
 * which existing topic those posts end up with (from any strong evidence: other hashtags, chips, and what the
 * AUDIENCE labeled them). If one topic clearly dominates, the tag becomes an ALIAS of it, and every future
 * "#punjabisong" lands in music (-> entertainment) with no human involved.
 *
 *   alias    >= 3 posts by >= 2 authors; among the posts that have a confident topic (>= 3 of them, >= 30% of all),
 *            one topic on >= 60%, from 2+ different authors
 *   propose  a big cluster (>= 10 posts, >= 4 authors) with no clear topic: reported for YOU to review
 *            (a new child topic, e.g. punjabimusic under music). Never auto-created.
 *   wait     not enough evidence yet
 *
 * Tags teach each other over rounds: once #song is an alias of music, posts tagged #song #punjabisong now
 * carry music, which lets #punjabisong follow in the next round.
 */

const Topic = require('../models/Topic');          // adjust paths to your layout
const PostMeta = require('../models/PostMeta');

const CFG = {
    minPosts: 3,
    minAuthors: 2,
    minPurity: 0.6,
    minSupport: 2,
    minVoters: 3, // posts with at least one confident topic
    minCoverage: 0.3, // voters / all posts with the tag
    strongConf: 0.5, // only confident topic evidence counts as a vote (not priors or caption guesses)
    proposalMinPosts: 10,
    proposalMinAuthors: 4,
    maxTagsPerRun: 200,
    maxPostsPerTag: 200,
};

const round2 = (n) => Math.round(n * 100) / 100;

// Pure: posts = [{ author, topics: [{slug, conf}] }] that carry one candidate tag.
// Only posts with at least one CONFIDENT topic vote (posts we know nothing about neither help nor hurt),
// but the voters must be a real share of the tag's posts, and the winning topic needs 2+ different authors.
function evaluateTag(posts, cfg = CFG) {
    const n = posts.length;
    const authors = new Set(posts.map((p) => String(p.author))).size;
    if (n < cfg.minPosts || authors < cfg.minAuthors) return { action: 'wait', reason: 'not enough posts or authors', n, authors };

    const support = new Map(); // topic -> { posts, authors }
    let voters = 0;
    for (const p of posts) {
        const once = new Set(
            (p.topics || []).filter((t) => t.conf >= cfg.strongConf).map((t) => t.slug)
        );
        if (once.size) voters++;
        for (const slug of once) {
            if (!support.has(slug)) support.set(slug, { posts: 0, authors: new Set() });
            const s = support.get(slug);
            s.posts++;
            s.authors.add(String(p.author));
        }
    }

    const ranked = [...support].sort((a, b) => b[1].posts - a[1].posts);
    const [slug, top] = ranked[0] || [null, null];
    const purity = voters ? (top ? top.posts / voters : 0) : 0;
    const coverage = voters / n;

    if (slug && voters >= cfg.minVoters && coverage >= cfg.minCoverage && top.posts >= cfg.minSupport &&
        top.authors.size >= 2 && purity >= cfg.minPurity) {
        return { action: 'alias', slug, purity: round2(purity), support: top.posts, voters, n, authors };
    }
    if (n >= cfg.proposalMinPosts && authors >= cfg.proposalMinAuthors) {
        return { action: 'propose', closest: slug, purity: round2(purity), voters, n, authors };
    }
    return { action: 'wait', reason: 'no clear topic yet', voters, n, authors };
}

// One pass over the candidates. Returns what it did and which posts need re-identifying.
async function learnTags({ cfg = CFG, apply = true } = {}) {
    const candidates = await Topic.find({ status: 'candidate', candidateCount: { $gte: cfg.minPosts } })
        .sort({ candidateCount: -1 })
        .limit(cfg.maxTagsPerRun)
        .lean();

    const report = { aliased: [], proposed: [], waiting: 0 };
    const affected = new Set();

    for (const c of candidates) {
        const posts = await PostMeta.find({ unknownTags: c.slug }).select('post author topics').limit(cfg.maxPostsPerTag).lean();
        const d = evaluateTag(posts, cfg);

        if (d.action === 'alias') {
            const taken = await Topic.findOne({ aliases: c.slug, status: 'active' }).select('slug').lean();
            if (taken) {
                report.waiting++;
                continue;
            }
            if (apply) {
                await Topic.updateOne({ slug: d.slug, status: 'active' }, { $addToSet: { aliases: c.slug } });
                await Topic.deleteOne({ slug: c.slug, status: 'candidate' });
                posts.forEach((p) => affected.add(String(p.post)));
            }
            report.aliased.push({ tag: c.slug, ...d });
        } else if (d.action === 'propose') {
            report.proposed.push({ tag: c.slug, ...d });
        } else {
            report.waiting++;
        }
    }
    return { report, affectedPostIds: [...affected] };
}

// The full cycle: learn aliases, re-identify the posts they affect, repeat while it keeps finding more.
// Run it daily (cron) or from scripts/backfill.js.
async function runTagLearningCycle({ rounds = 3, cfg = CFG, apply = true } = {}) {
    const { reidentifyPosts } = require('./reidentifyService');
    const all = { aliased: [], proposed: [] };
    for (let r = 0; r < rounds; r++) {
        const { report, affectedPostIds } = await learnTags({ cfg, apply });
        all.aliased.push(...report.aliased);
        all.proposed = report.proposed;
        if (!apply || !report.aliased.length) break;
        await reidentifyPosts(affectedPostIds);
    }
    return all;
}

module.exports = { CFG, evaluateTag, learnTags, runTagLearningCycle };