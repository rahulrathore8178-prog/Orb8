'use strict';

/**
 * Backend topic extractor (no AI, no network). Clients only send `content`; everything about WHAT the
 * post is about is derived here from its text:
 *
 *   raw    hashtags as typed (lowercased, no '#'), e.g. 'c++', 'node.js'. Goes to the topic resolver,
 *          which understands them
 *   stored hashtags cleaned to [a-z0-9_] for the Post.hashtags field (same rule you already used)
 *   text   the caption with hashtags, @mentions and URLs removed. This is what caption-word matching
 *          sees, so a #react tag is not counted twice and "@react_dev" / "github.com/react" do not
 *          pose as topic mentions
 */

const MAX_HASHTAGS_STORED = 30;

const URL_RE = /https?:\/\/\S+|www\.\S+/gi;
const MENTION_RE = /(?<![\p{L}\p{N}_])@[\p{L}\p{N}_.]{1,40}/gu;
// #tag, also #c++ / #c# / #node.js; "#react#nodejs" gives two tags; skips HTML entities like &#39;
const HASHTAG_RE = /(?<!&)#([\p{L}\p{N}_]{1,50}(?:\.js(?![\p{L}\p{N}_])|\+\+|#(?![\p{L}\p{N}_]))?)/gu;

const sanitizeTag = (t) => String(t).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

function extractFromContent(content) {
    const source = typeof content === 'string' ? content : '';
    const noUrls = source.replace(URL_RE, ' ');

    const raw = [];
    for (const m of noUrls.matchAll(HASHTAG_RE)) {
        const tag = m[1].toLowerCase();
        if (/^\d+$/.test(tag)) continue; // "#1 priority" is a number, not a topic
        raw.push(tag);
    }
    const rawUnique = [...new Set(raw)];

    const stored = [...new Set(rawUnique.map(sanitizeTag).filter(Boolean))].slice(0, MAX_HASHTAGS_STORED);
    const text = noUrls.replace(HASHTAG_RE, ' ').replace(MENTION_RE, ' ').replace(/\s+/g, ' ').trim();

    return { raw: rawUnique, stored, text };
}

module.exports = { extractFromContent, sanitizeTag, MAX_HASHTAGS_STORED };