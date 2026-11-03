const mongoose = require('mongoose');

// One interest profile per (user, persona). Until personas exist everyone uses persona = 'default';
// when you add social / professional / private, nothing here changes: just pass the persona name.
const personaProfileSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        persona: { type: String, default: 'default' },

        // { [topicSlug]: { s, l, sAt, lAt, days, lastDay, n } }  see services/interestMath.js
        // Mixed + NO default on purpose: a default {} conflicts with upserts that $set 'interests.<slug>'.
        interests: { type: mongoose.Schema.Types.Mixed },

        blocked: [{ type: String }],      // hard mutes: topics filtered out of the feed entirely
        aspirations: [{ type: String }],  // "who I want to become" topics (onboarding / AI chat)
        signalCount: { type: Number }, // total learning events processed = profile maturity
    },
    { timestamps: true }
);

personaProfileSchema.index({ user: 1, persona: 1 }, { unique: true });

module.exports = mongoose.models.PersonaProfile || mongoose.model('PersonaProfile', personaProfileSchema);