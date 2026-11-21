const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    orbitalId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    lastReadSeq: { type: Number, default: 0 },
});
schema.index({ orbitalId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('OrbitalRead', schema);