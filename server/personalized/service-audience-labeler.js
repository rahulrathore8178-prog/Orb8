'use strict';

/**
 * Lets the AUDIENCE tell us what a post is about.
 *
 * For each topic t, a "cohort" is the set of users whose top interests include t. The event pipeline
 * keeps, per post and per cohort: imp (impressions shown to the cohort) and pts (weighted engagement
 * from the cohort). A topic is credited to the post when its cohort engages much MORE than everyone
 * outside the cohort:
 *
 *    rate_in  = (pts_t + m*rateAll) / (imp_t + m)                      shrinks to average when data is thin
 *    rate_out = (totalPts - pts_t + m*rateAll) / (totalImp - imp_t + m)
 *    lift     = rate_in / rate_out
 *    conf     = clamp((lift-1)/3, 0, 1) * (1 - e^(-imp_t/30)) * 0.8   needs lift AND enough exposure
 *
 * Using impressions in the denominator removes the "popular topic wins" bias: it is a rate, not a count.
 * Everything is recomputed from baseTopics, so running the job again never compounds evidence.
 *
 * The numbers in CFG are starting values. Calibrate them by back-testing on posts that DO have good
 * hashtags (hide the labels, see if this recovers them).
 */

const CFG = {
    m: 20, // smoothing strength (pseudo-impressions)
    minTotalImp: 40, // below this the post is not judged at all
    minCohortImp: 15, // a cohort needs this many impressions to count
    minOutsideImp: 15, // and so does the "everyone else" group
    liftFloor: 1.3, // lift needed to credit a topic
    coldLift: 0.7, // lift at or below this counts as the audience contradicting a declared topic
    audienceCap: 0.8,
    impSaturation: 30,
    maxAudienceTopics: 3,
    labelConf: 0.3, // an audience topic at/above this makes the post 'labeled'
    generalMinRate: 0.02, // weighted points per impression for "broad appeal" (PLACEHOLDER: calibrate)
    commentConfPerMention: 0.1,
    commentConfCap: 0.3,
    relabelEvery: 25, // re-run after this many new impressions
    minConf: 0.2,
    maxConf: 0.95,
    maxTopics: 8,
};

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const round2 = (n) => Math.round(n * 100) / 100;

function cohortLift(audience, cfg = CFG) {
    const totalImp = (audience && audience.totalImp) || 0;
    const totalPts = (audience && audience.totalPts) || 0;
    if (totalImp < cfg.minTotalImp) return { ready: false, rateAll: 0, topics: [], cold: [] };

    const rateAll = totalPts / totalImp;
    if (rateAll <= 0) return { ready: true, rateAll, topics: [], cold: [] };

    const topics = [];
    const cold = [];
    for (const [slug, c] of Object.entries((audience && audience.cohorts) || {})) {
        const imp = (c && c.imp) || 0;
        const pts = (c && c.pts) || 0;
        const outImp = totalImp - imp;
        if (imp < cfg.minCohortImp || outImp < cfg.minOutsideImp) continue;

        const rateIn = (pts + cfg.m * rateAll) / (imp + cfg.m);
        const rateOut = (totalPts - pts + cfg.m * rateAll) / (outImp + cfg.m);
        if (rateOut <= 0) continue;
        const lift = rateIn / rateOut;

        if (lift >= cfg.liftFloor) {
            const conf = clamp((lift - 1) / 3, 0, 1) * (1 - Math.exp(-imp / cfg.impSaturation)) * cfg.audienceCap;
            if (conf > 0.05) topics.push({ slug, lift: round2(lift), conf: round2(conf), imp });
        } else if (lift <= cfg.coldLift) {
            cold.push({ slug, lift: round2(lift), imp });
        }
    }

    topics.sort((a, b) => b.conf - a.conf);
    return { ready: true, rateAll, topics: topics.slice(0, cfg.maxAudienceTopics), cold };
}

const noisyOr = (a, b) => 1 - (1 - a) * (1 - b);

/**
 * baseTopics + audience evidence -> final topics. Pure and idempotent (always starts from base).
 *  - a cold cohort for a DECLARED topic (author/hashtag) lowers it: the audience says it's misleading
 *  - hot cohorts add 'audience' evidence
 *  - topics mentioned in comments add 'comment' evidence (0.1 per mention, capped)
 */
function mergeAudience(baseTopics, lift, commentTopics = {}, cfg = CFG) {
    const map = new Map((baseTopics || []).map((t) => [t.slug, { conf: t.conf, src: new Set(t.src || []) }]));
    let mismatch = 0;

    for (const c of lift.cold || []) {
        const v = map.get(c.slug);
        if (v && (v.src.has('author') || v.src.has('hashtag'))) {
            v.conf *= Math.max(0.5, c.lift);
            mismatch = Math.max(mismatch, round2(1 - c.lift));
        }
    }

    const addEvidence = (slug, conf, src) => {
        const cur = map.get(slug);
        if (cur) {
            cur.conf = noisyOr(cur.conf, conf);
            cur.src.add(src);
        } else {
            map.set(slug, { conf, src: new Set([src]) });
        }
    };
    for (const t of lift.topics || []) addEvidence(t.slug, t.conf, 'audience');
    for (const [slug, n] of Object.entries(commentTopics || {})) {
        const conf = Math.min(cfg.commentConfCap, cfg.commentConfPerMention * (Number(n) || 0));
        if (conf > 0) addEvidence(slug, conf, 'comment');
    }

    const topics = [...map]
        .map(([slug, v]) => ({ slug, conf: round2(Math.min(cfg.maxConf, v.conf)), src: [...v.src] }))
        .filter((t) => t.conf >= cfg.minConf)
        .sort((a, b) => b.conf - a.conf)
        .slice(0, cfg.maxTopics);

    return { topics, mismatch };
}

function decideState(baseTopics, mergedTopics, lift, cfg = CFG) {
    const baseMax = (baseTopics || []).reduce((m, t) => Math.max(m, t.conf), 0);
    const topConf = mergedTopics.length ? mergedTopics[0].conf : 0;

    if (baseMax >= 0.5) return topConf >= 0.4 ? 'known' : 'exploring'; // text was confident, unless the audience contradicted it
    if (!lift.ready) return 'exploring';
    if ((lift.topics || []).some((t) => t.conf >= cfg.labelConf)) return 'labeled';
    if (lift.rateAll >= cfg.generalMinRate) return 'general';
    return 'weak';
}

// ---------------- DB glue ----------------

async function applyAudienceEvidence(postId, cfg = CFG) {
    const PostMeta = require('../src/models/post.meta');
    const { getIndex, rootsFromTopics } = require('../post_details/topicresolver');

    const meta = await PostMeta.findOne({ post: postId }).select('baseTopics topics audience').lean();
    if (!meta) return null;

    const lift = cohortLift(meta.audience, cfg);
    if (!lift.ready) return null; // not enough impressions yet: leave the post untouched

    const base = meta.baseTopics && meta.baseTopics.length ? meta.baseTopics : meta.topics || [];
    const { topics, mismatch } = mergeAudience(base, lift, meta.audience && meta.audience.commentTopics, cfg);
    const index = await getIndex();
    const state = decideState(base, topics, lift, cfg);

    await PostMeta.updateOne(
        { _id: meta._id },
        {
            $set: {
                topics,
                roots: rootsFromTopics(index, topics),
                'label.state': state,
                'label.updatedAt': new Date(),
                'analysis.mismatch': mismatch,
                'audience.lastLabeledImp': meta.audience.totalImp,
                'audience.lastLabeledAt': new Date(),
            },
        }
    );
    return { state, topics, mismatch };
}

// Cheap guard so the job only runs after enough NEW impressions. No cron needed.
async function maybeRelabel(postId, cfg = CFG) {
    const PostMeta = require('../src/models/post.meta');
    const meta = await PostMeta.findOne({ post: postId }).select('audience').lean();
    const a = meta && meta.audience;
    if (!a) return null;
    if ((a.totalImp || 0) - (a.lastLabeledImp || 0) < cfg.relabelEvery) return null;
    return applyAudienceEvidence(postId, cfg);
}

module.exports = { CFG, cohortLift, mergeAudience, decideState, applyAudienceEvidence, maybeRelabel };