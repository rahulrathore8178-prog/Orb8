const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    serverId: { type: String, required: true },
    period: { type: String, required: true }, // 'YYYY-MM' (UTC)
    bytes: { type: Number, default: 0 },
    updatedAt: { type: Date },
});
schema.index({ serverId: 1, period: 1 }, { unique: true });

module.exports = mongoose.models.BandwidthUsage || mongoose.model('BandwidthUsage', schema);