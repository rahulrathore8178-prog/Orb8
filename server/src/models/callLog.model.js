'use strict';

const mongoose = require('mongoose');

/**
 * One document per call attempt. It is the permanent record behind call history
 * and "missed call" lists. Live call state (who is ringing, which device answered)
 * lives in memory in services/callService.js, because it changes too fast and is
 * worthless after the call is over.
 */
const callLogSchema = new mongoose.Schema(
    {
        callerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        calleeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['audio', 'video'], required: true },
        status: {
            type: String,
            enum: ['ringing', 'active', 'ended', 'rejected', 'missed', 'cancelled', 'failed'],
            default: 'ringing',
        },
        // hangup | declined | cancelled | timeout | busy | unavailable | disconnected | server_restart | caller_disconnected
        endReason: { type: String, default: null },
        answeredAt: { type: Date, default: null },
        endedAt: { type: Date, default: null },
        durationSec: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// History for a user is "calls where I was caller OR callee", newest first.
// Each $or branch uses its own index.
callLogSchema.index({ callerId: 1, _id: -1 });
callLogSchema.index({ calleeId: 1, _id: -1 });
// Rate limiting (calls started by a user in the last minute)
callLogSchema.index({ callerId: 1, createdAt: -1 });

module.exports = mongoose.models.CallLog || mongoose.model('CallLog', callLogSchema);