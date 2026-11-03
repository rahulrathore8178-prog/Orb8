const mongoose = require('mongoose');

const SOURCES = ['author', 'hashtag', 'caption', 'prior', 'audience', 'comment', 'clip', 'vlm'];

const topicEvidence = new mongoose.Schema(
    {
        slug: { type: String, required: true },
        conf: { type: Number, required: true, min: 0, max: 1 },
        src: [{ type: String, enum: SOURCES }],
    },
    { _id: false }
);

// 1:1 with Post. Kept separate so hot data (stats, audience counters, labels) never rewrites the
// Post document that every feed read loads. Feed candidate queries hit this collection first.
const postMetaSchema = new mongoose.Schema(
    {
        post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, unique: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        persona: { type: String, default: null },

        // text + priors evidence. The audience job NEVER edits this; it recomputes `topics` from it,
        // so re-running the job is idempotent (evidence cannot compound).
        baseTopics: [topicEvidence],
        // final topics = baseTopics + audience/comment evidence. This is what feeds read.
        topics: [topicEvidence],
        roots: [{ _id: false, root: String, conf: Number }],
        unknownTags: [{ type: String }],

        // known      = text gave a confident label (>= 0.5)
        // exploring  = little/no text; being shown to a mixed sample to learn who it is for
        // labeled    = the audience told us the topic(s)
        // general    = no topic cluster stands out but people engage broadly
        // weak       = enough impressions, little engagement
        label: {
            state: { type: String, enum: ['known', 'exploring', 'labeled', 'general', 'weak'], default: 'exploring' },
            updatedAt: { type: Date, default: null },
        },

        // Raw counters written by the event pipeline (Mixed: keys are topic slugs).
        //   cohorts: { react: { imp, pts } }  impressions / weighted points from users whose top interests include the topic
        //   commentTopics: { react: 2 }       topics mentioned in comments
        audience: {
            totalImp: { type: Number, default: 0 },
            totalPts: { type: Number, default: 0 },
            cohorts: { type: mongoose.Schema.Types.Mixed },
            commentTopics: { type: mongoose.Schema.Types.Mixed },
            lastLabeledImp: { type: Number, default: 0 },
            lastLabeledAt: { type: Date, default: null },
        },

        analysis: {
            status: { type: String, enum: ['pending', 'basic', 'deep', 'skipped', 'failed'], default: 'basic' },
            mediaType: { type: String, enum: ['text', 'image', 'video', 'audio'], default: 'text' },
            vlmUsed: { type: Boolean, default: false },
            // 0..1: how strongly the audience contradicts the declared topics (from cold cohorts)
            mismatch: { type: Number, default: 0, min: 0, max: 1 },
            summary: { type: String, default: '' },
            nearDuplicateOf: { type: String, default: null },
            analyzedAt: { type: Date, default: null },
        },

        // Placeholders for the stage engine.
        stage: { type: Number, default: 0 },
        stats: {
            impressions: { type: Number, default: 0 },
            opens: { type: Number, default: 0 },
            uniqueViewers: { type: Number, default: 0 },
            likes: { type: Number, default: 0 },
            comments: { type: Number, default: 0 },
            saves: { type: Number, default: 0 },
            shares: { type: Number, default: 0 },
            hides: { type: Number, default: 0 },
            completions: { type: Number, default: 0 },
        },
        trend: {
            velocity: { type: Number, default: 0 },
            consistency: { type: Number, default: 0 },
            score: { type: Number, default: 0 },
        },
    },
    { timestamps: true }
);

postMetaSchema.index({ 'topics.slug': 1, stage: 1, createdAt: -1 });
postMetaSchema.index({ 'roots.root': 1, 'trend.score': -1 });
postMetaSchema.index({ unknownTags: 1 });
postMetaSchema.index({ 'label.state': 1, createdAt: -1 }); // exploration pool lookup

module.exports = mongoose.models.PostMeta || mongoose.model('PostMeta', postMetaSchema);