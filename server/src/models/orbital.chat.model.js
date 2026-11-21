const mongoose = require('mongoose');

const orbitalChatSchema = new mongoose.Schema({
    orbitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Orbital', required: true },
    seq: { type: Number, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, default: '', maxlength: 2000 },
    clientId: { type: String, default: null },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'OrbitalMessage', default: null },
    timestamp: { type: Date, default: Date.now },
});

orbitalChatSchema.index({ orbitalId: 1, seq: -1 }, { unique: true });
// makes client retries idempotent
orbitalChatSchema.index(
    { senderId: 1, clientId: 1 },
    { unique: true, partialFilterExpression: { clientId: { $type: 'string' } } }
);

module.exports = mongoose.model('OrbitalChat', orbitalChatSchema);