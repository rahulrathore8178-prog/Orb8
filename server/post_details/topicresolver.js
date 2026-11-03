'use strict';

/**
 * Text-side post identification: free, instant, no AI.
 * chips + hashtags + caption (+ weak priors) -> [{ slug, conf, src }] using the Topic taxonomy.
 *
 * The core (buildIndex / resolvePostTopics / topicsFromText / suggestTopics) is pure so it can be
 * unit-tested without Mongo. DB glue is at the bottom.
 */

const SOURCE_CONF = { chip: 0.85, hashtag: 0.6, caption: 0.3 };
const AMBIGUOUS_FACTOR = 0.8; // alias that maps to several topics, resolved by context
const MIN_CONF = 0.2;
const MAX_CONF = 0.95;
const MAX_TOPICS = 8;
const MAX_CHIPS = 3;
const MAX_HASHTAGS = 5; // only the first 5 count: hashtag stuffing buys nothing
const PERSONA_PRIOR_BONUS = 0.25;

// Priors: weak, free evidence for posts with little text. Never override clear author signals.
const PRIOR_APPLY_BELOW = 0.5; // only used when the best text evidence is under this
const AUTHOR_PRIOR_TOP = 3;
const AUTHOR_PRIOR_MIN_EFF = 0.3;
const AUTHOR_PRIOR_CAP = 0.25;
const ORBITAL_PRIOR_CONF = 0.3;

// Persona is a prior on the umbrella, never on a specific topic.
const PERSONA_ROOT_PRIOR = {
    professional: ['technology', 'education', 'business'],
    social: ['entertainment', 'lifestyle', 'sports'],
    private: [],
};

// Must run BEFORE stripping symbols, otherwise "c++" and "c#" both become "c".
const SPECIAL = [
    [/c\+\+/g, 'cpp'],
    [/c#/g, 'csharp'],
    [/\.net\b/g, 'dotnet'],
    [/node\.js/g, 'nodejs'],
    [/react\.js/g, 'reactjs'],
    [/next\.js/g, 'nextjs'],
    [/vue\.js/g, 'vuejs'],
    [/express\.js/g, 'expressjs'],
];

function normalizeTag(raw) {
    if (typeof raw !== 'string') return '';
    let s = raw.trim().toLowerCase().replace(/^#+/, '');
    for (const [re, to] of SPECIAL) s = s.replace(re, to);
    return s.replace(/[^a-z0-9]/g, '');
}

// ---------- index ----------

function buildIndex(topics) {
    const bySlug = new Map();
    const lookupMap = new Map(); // normalized alias -> Set(slug)

    for (const t of topics) {
        if (t.status === 'candidate') continue;
        bySlug.set(t.slug, t);
        for (const name of [t.slug, t.name, ...(t.aliases || [])]) {
            const key = normalizeTag(name);
            if (!key) continue;
            if (!lookupMap.has(key)) lookupMap.set(key, new Set());
            lookupMap.get(key).add(t.slug);
        }
    }

    return { bySlug, lookup: (key) => lookupMap.get(key), keys: () => lookupMap.keys() };
}

// ---------- caption ----------

// Words of a caption, with c++/c#/node.js style specials normalized first.
function captionWords(content) {
    if (typeof content !== 'string' || !content.trim()) return [];
    let text = content.toLowerCase();
    for (const [re, to] of SPECIAL) text = text.replace(re, to);
    return text.split(/[^a-z0-9]+/).filter(Boolean);
}

// Dictionary matches in a caption: longest match first (3, 2, then 1 words), never overlapping, so
// "react native" is ONE mention of reactnative (not also react) and "system design" is one mention
// of systemdesign. Whole words only, so "reaction" never matches "react".
function captionMentions(index, content) {
    const words = captionWords(content);
    const mentions = [];
    for (let i = 0; i < words.length;) {
        let used = 0;
        for (let n = Math.min(3, words.length - i); n >= 1; n--) {
            const key = words.slice(i, i + n).join('');
            if (index.lookup(key)) {
                mentions.push(key);
                used = n;
                break;
            }
        }
        i += used || 1;
    }
    return mentions;
}

// Unambiguous topics mentioned in free text (used for comments). Ambiguous words are ignored.
function topicsFromText(index, text) {
    const out = new Set();
    for (const key of captionMentions(index, text)) {
        const cands = index.lookup(key);
        if (cands && cands.size === 1) out.add([...cands][0]);
    }
    return [...out];
}

// ---------- composer suggestions ----------

function suggestTopics(index, query, limit = 8) {
    const q = normalizeTag(query);
    if (q.length < 2) return [];
    const scored = new Map(); // slug -> score
    for (const key of index.keys()) {
        if (!key.startsWith(q)) continue;
        for (const slug of index.lookup(key)) {
            const score = key === q ? 3 : key === slug ? 2 : 1; // exact > slug prefix > alias prefix
            scored.set(slug, Math.max(scored.get(slug) || 0, score));
        }
    }
    return [...scored]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, limit)
        .map(([slug]) => ({ slug, name: index.bySlug.get(slug).name }));
}

// ---------- resolve ----------

const combine = (confs) => Math.min(MAX_CONF, 1 - confs.reduce((p, c) => p * (1 - c), 1));
const round2 = (n) => Math.round(n * 100) / 100;

function rootsFromTopics(index, topics) {
    const rootMax = new Map();
    for (const t of topics) {
        const meta = index.bySlug.get(t.slug);
        if (meta) rootMax.set(meta.root, Math.max(rootMax.get(meta.root) || 0, t.conf));
    }
    return [...rootMax].map(([root, conf]) => ({ root, conf })).sort((a, b) => b.conf - a.conf);
}

function resolvePostTopics(
    index,
    { hashtags = [], content = '', chips = [], persona = null, authorInterests = [], orbitalTopics = [] } = {}
) {
    const evidence = new Map(); // slug -> { confs: number[], src: Set<string> }
    const ambiguous = []; // alias that matched several topics: { cands, base, src }
    const unknownTags = [];

    const add = (slug, conf, src) => {
        if (!evidence.has(slug)) evidence.set(slug, { confs: [], src: new Set() });
        const ev = evidence.get(slug);
        ev.confs.push(conf);
        ev.src.add(src);
    };

    // returns true if the key matched at least one topic
    const consider = (key, base, src) => {
        const cands = index.lookup(key);
        if (!cands || cands.size === 0) return false;
        if (cands.size === 1) add([...cands][0], base, src);
        else ambiguous.push({ cands: [...cands], base, src });
        return true;
    };

    for (const chip of chips.slice(0, MAX_CHIPS)) consider(normalizeTag(chip), SOURCE_CONF.chip, 'author');

    for (const tag of hashtags.slice(0, MAX_HASHTAGS)) {
        const key = normalizeTag(tag);
        if (!key) continue;
        if (!consider(key, SOURCE_CONF.hashtag, 'hashtag')) unknownTags.push(key);
    }

    for (const key of captionMentions(index, content)) consider(key, SOURCE_CONF.caption, 'caption');

    // ---- priors (only when the text itself is weak)
    let textMax = 0;
    for (const ev of evidence.values()) textMax = Math.max(textMax, combine(ev.confs));
    const priors = [];
    if (textMax < PRIOR_APPLY_BELOW) {
        for (const a of (authorInterests || []).slice(0, AUTHOR_PRIOR_TOP)) {
            if (a && a.eff >= AUTHOR_PRIOR_MIN_EFF && index.bySlug.has(a.slug)) {
                priors.push({ slug: a.slug, conf: Math.min(AUTHOR_PRIOR_CAP, 0.3 * a.eff) });
            }
        }
        for (const slug of orbitalTopics || []) {
            if (index.bySlug.has(slug)) priors.push({ slug, conf: ORBITAL_PRIOR_CONF });
        }
    }

    // ---- ambiguous aliases ("grinding" = gym | gaming | dsa): pick the candidate whose umbrella
    // matches what the clear evidence, priors and persona already say. No clear winner -> drop it.
    const ctx = new Map(); // root -> weight
    const bump = (slug, w) => {
        const root = index.bySlug.get(slug).root;
        ctx.set(root, (ctx.get(root) || 0) + w);
    };
    for (const [slug, ev] of evidence) bump(slug, combine(ev.confs));
    for (const p of priors) bump(p.slug, p.conf);
    const personaPrior = new Set(PERSONA_ROOT_PRIOR[persona] || []);

    for (const amb of ambiguous) {
        let best = null;
        let bestScore = 0;
        let tie = false;
        for (const slug of amb.cands) {
            const root = index.bySlug.get(slug).root;
            const score = (ctx.get(root) || 0) + (personaPrior.has(root) ? PERSONA_PRIOR_BONUS : 0);
            if (score > bestScore) {
                best = slug;
                bestScore = score;
                tie = false;
            } else if (score === bestScore && score > 0) {
                tie = true;
            }
        }
        if (best && !tie) add(best, amb.base * AMBIGUOUS_FACTOR, amb.src);
    }

    for (const p of priors) add(p.slug, p.conf, 'prior');

    const topics = [...evidence]
        .map(([slug, ev]) => ({ slug, conf: round2(combine(ev.confs)), src: [...ev.src] }))
        .filter((t) => t.conf >= MIN_CONF)
        .sort((a, b) => b.conf - a.conf)
        .slice(0, MAX_TOPICS);

    return { topics, roots: rootsFromTopics(index, topics), unknownTags: [...new Set(unknownTags)] };
}

// ---------- DB glue (loaded lazily so the core stays testable) ----------

const INDEX_TTL_MS = 10 * 60 * 1000;
let cache = { index: null, loadedAt: 0 };

async function getIndex({ force = false } = {}) {
    if (!force && cache.index && Date.now() - cache.loadedAt < INDEX_TTL_MS) return cache.index;
    const Topic = require('../src/models/topic.model');
    const topics = await Topic.find({ status: 'active' }).lean();
    cache = { index: buildIndex(topics), loadedAt: Date.now() };
    return cache.index;
}

async function resolveForPost(input) {
    return resolvePostTopics(await getIndex(), input);
}

// Unknown hashtags become 'candidate' topics with a counter. Promotion to 'active' is manual
// for now (later: promote when seen from N distinct authors, or when the audience maps them).
async function recordCandidates(tags) {
    const clean = [...new Set(tags)].filter((t) => t.length >= 3 && t.length <= 30);
    if (!clean.length) return;
    const Topic = require('../src/models/topic.model');
    await Topic.bulkWrite(
        clean.map((slug) => ({
            updateOne: {
                filter: { slug },
                update: {
                    $inc: { candidateCount: 1 },
                    $setOnInsert: { name: slug, root: 'other', status: 'candidate' },
                },
                upsert: true,
            },
        })),
        { ordered: false }
    );
}

module.exports = {
    normalizeTag,
    buildIndex,
    resolvePostTopics,
    topicsFromText,
    suggestTopics,
    rootsFromTopics,
    getIndex,
    resolveForPost,
    recordCandidates,
};