'use strict';

/**
 * Pure interest math (no DB). One profile = { [topicSlug]: entry }.
 * entry = { s, l, sAt, lAt, days, lastDay, n }
 *   s  short-term score  (half-life 3 days)   reacts to this week
 *   l  long-term score   (half-life 60 days)  only grows strongly when interest repeats on DIFFERENT days
 *   sAt/lAt  ms timestamps of the last write, used for lazy decay (no cron job needed)
 *   days  distinct active days, lastDay 'YYYY-MM-DD', n  interaction count
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const SHORT_HALF_LIFE_DAYS = 3;
const LONG_HALF_LIFE_DAYS = 60;
const PRUNE_BELOW = 0.01;
const SPILLOVER = 0.3; // related topics get this fraction of the (edge-weighted) signal

// Positive = learn, negative = unlearn, 0 = counted (exposure / logging) but teaches nothing.
const INTERACTION_WEIGHTS = {
    impression: 0,
    skip: -0.02, // scrolled past quickly
    view: 0.01,
    open: 0.03,
    like: 0.08,
    comment: 0.12,
    save: 0.18,
    share: 0.22,
    storyReshare: 0.22,
    followCreator: 0.3,
    hide: -0.2,
    notInterested: -0.25,
};

const round4 = (n) => Math.round(n * 10000) / 10000;
const dayKey = (date) => new Date(date).toISOString().slice(0, 10);

function fade(value, fromMs, nowMs, halfLifeDays) {
    if (!value || value <= 0) return 0;
    if (!fromMs) return value;
    const dt = Math.max(0, nowMs - fromMs);
    return value * Math.pow(0.5, dt / (halfLifeDays * DAY_MS));
}

function decayedEntry(entry, now = new Date()) {
    const nowMs = +now;
    const e = entry || {};
    return {
        s: fade(e.s, e.sAt, nowMs, SHORT_HALF_LIFE_DAYS),
        l: fade(e.l, e.lAt, nowMs, LONG_HALF_LIFE_DAYS),
        days: e.days || 0,
        lastDay: e.lastDay || null,
        n: e.n || 0,
    };
}

// 1 active day -> 0.2, 10+ distinct days -> 1.0. A one-evening binge barely moves long-term.
function dayFactor(days) {
    return Math.min(1, 0.2 + (0.8 * (Math.max(days, 1) - 1)) / 9);
}

function applyInteraction(entry, weight, now = new Date(), { countDay = true } = {}) {
    const cur = decayedEntry(entry, now);

    if (weight > 0) {
        if (countDay) {
            const today = dayKey(now);
            if (cur.lastDay !== today) {
                cur.days += 1;
                cur.lastDay = today;
            }
        }
        // saturating growth: scores approach 1 but never reach it, so everything cannot max out
        cur.s += (1 - cur.s) * weight;
        cur.l += (1 - cur.l) * weight * dayFactor(cur.days);
        cur.n += 1;
    } else if (weight < 0) {
        const penalty = -weight;
        cur.s = Math.max(0, cur.s - penalty);
        cur.l = Math.max(0, cur.l - penalty * 0.5); // long-term erodes slower than short-term
    }

    return { s: round4(cur.s), l: round4(cur.l), sAt: +now, lAt: +now, days: cur.days, lastDay: cur.lastDay, n: cur.n };
}

// Blend of short and long. The more distinct days of evidence, the more the long-term score counts.
function effective(entry, now = new Date()) {
    const d = decayedEntry(entry, now);
    const longWeight = 0.4 + (0.3 * Math.min(d.days, 20)) / 20;
    return round4((1 - longWeight) * d.s + longWeight * d.l);
}

function shouldPrune(entry) {
    return !entry || (entry.s < PRUNE_BELOW && entry.l < PRUNE_BELOW);
}

function topInterests(interests, now = new Date(), { k = 5, min = 0.05 } = {}) {
    return Object.entries(interests || {})
        .map(([slug, entry]) => ({ slug, eff: effective(entry, now) }))
        .filter((x) => x.eff >= min)
        .sort((a, b) => b.eff - a.eff)
        .slice(0, k);
}

// Umbrella scores are DERIVED, never stored: noisy-OR over the top 5 specifics of each root.
function rootScores(interests, rootOf, now = new Date()) {
    const byRoot = {};
    for (const slug of Object.keys(interests || {})) {
        const root = rootOf(slug);
        if (!root) continue;
        (byRoot[root] ||= []).push(effective(interests[slug], now));
    }
    const out = {};
    for (const [root, effs] of Object.entries(byRoot)) {
        const top = effs.sort((a, b) => b - a).slice(0, 5);
        out[root] = round4(1 - top.reduce((p, e) => p * (1 - 0.6 * e), 1));
    }
    return out;
}

/**
 * Learn from one interaction on a post with topics [{slug, conf}].
 * Confidence-weighted: a topic the post only has 0.25 confidence in teaches 4x less.
 * Returns ONLY the changed entries: { slug: entry | null }  (null = prune).
 */
function learnFromTopics(interests, topics, weight, now = new Date(), relatedOf = null) {
    const updates = {};
    const touch = (slug, w, opts) => {
        const base = updates[slug] !== undefined ? updates[slug] : interests[slug];
        const next = applyInteraction(base || undefined, w, now, opts);
        updates[slug] = shouldPrune(next) ? null : next;
    };

    for (const t of topics || []) {
        if (!t || !t.slug || !(t.conf > 0)) continue;
        touch(t.slug, weight * t.conf, { countDay: true });
        if (weight > 0 && relatedOf) {
            for (const r of relatedOf(t.slug) || []) {
                if (r && r.slug && r.w > 0) touch(r.slug, weight * t.conf * r.w * SPILLOVER, { countDay: false });
            }
        }
    }
    return updates;
}

module.exports = {
    INTERACTION_WEIGHTS,
    SHORT_HALF_LIFE_DAYS,
    LONG_HALF_LIFE_DAYS,
    decayedEntry,
    applyInteraction,
    effective,
    topInterests,
    rootScores,
    learnFromTopics,
    shouldPrune,
    dayKey,
};