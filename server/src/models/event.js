const mongoose = require('mongoose');
const { INTERACTION_WEIGHTS } = require('../../personalized/interest-math');

// Append-only behavior log. Even events we don't learn from yet (impression = 0 weight) are kept:
// they are the raw material for cohort stats now and for ML ranking later.
const eventSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        persona: { type: String, default: 'default' },
        post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
        type: { type: String, enum: Object.keys(INTERACTION_WEIGHTS), required: true },
        dwellMs: { type: Number, default: 0 },
        source: { type: String, enum: ['feed', 'search', 'profile', 'orbital', 'explore', 'notification'], default: 'feed' },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

eventSchema.index({ post: 1, type: 1, createdAt: -1 });
eventSchema.index({ user: 1, post: 1, type: 1, createdAt: -1 }); // impression de-dup lookup
// keep ~90 days; aggregate what you need before it expires
eventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.models.Event || mongoose.model('Event', eventSchema);