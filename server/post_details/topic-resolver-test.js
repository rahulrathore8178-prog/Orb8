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