const mongoose = require('mongoose');

// One document per topic. "react" is a specific topic, "technology" is its root (umbrella).
// Umbrella scores are never stored per user; they are derived from specifics via `root`.
const ROOTS = ['technology', 'education', 'entertainment', 'news', 'sports', 'lifestyle', 'business', 'other'];

const topicSchema = new mongoose.Schema(
    {
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        name: { type: String, required: true, trim: true },
        parent: { type: String, default: null, index: true }, // react -> frontend -> webdev
        root: { type: String, enum: ROOTS, default: 'other', index: true }, // umbrella category
        aliases: [{ type: String, lowercase: true, trim: true }], // reactjs, react.js ...
        // soft links used later for small interest "spill-over" (react <-> nextjs), never full propagation
        related: [{ _id: false, slug: String, w: { type: Number, min: 0, max: 1 } }],
        // 'candidate' = unknown hashtag seen in posts, waiting to be reviewed/promoted
        status: { type: String, enum: ['active', 'candidate'], default: 'active', index: true },
        candidateCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.models.Topic || mongoose.model('Topic', topicSchema);
module.exports.ROOTS = ROOTS;