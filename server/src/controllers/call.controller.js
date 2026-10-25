'use strict';

const mongoose = require('mongoose');
const CallLog = require('../models/callLog.model');
const callService = require('../services/callServices/callService');
const { buildIceServers } = require('../services/callServices/iceServers');

const { CallError } = callService;

function fail(res, err, label) {
    if (err instanceof CallError) {
        return res.status(err.status).json({ success: false, code: err.code, message: err.message });
    }
    console.error(`${label} error:`, err);
    return res.status(500).json({ success: false, message: 'Something went wrong' });
}

const pickUser = (u) =>
    u && u._id ? { id: String(u._id), username: u.username, profilePic: u.profilePic } : null;

function formatCall(call, viewerId) {
    const callerId = String((call.callerId && call.callerId._id) || call.callerId);
    return {
        id: String(call._id),
        type: call.type,
        status: call.status,
        direction: callerId === String(viewerId) ? 'outgoing' : 'incoming',
        caller: pickUser(call.callerId),
        callee: pickUser(call.calleeId),
        createdAt: call.createdAt,
        answeredAt: call.answeredAt,
        endedAt: call.endedAt,
        durationSec: call.durationSec,
        endReason: call.endReason,
    };
}

// GET /api/calls/ice-servers
exports.getIceServers = (req, res) => {
    return res.json({ success: true, ...buildIceServers(String(req.user.id)) });
};

// POST /api/calls   body: { recipientId, type: 'audio' | 'video', deviceId }
exports.startCall = async (req, res) => {
    console.log('startCall called with body:', req.body);
    console.log('req.user.id:', req.user.id);
    console.log('req.user:', req.user);
    console.log('req:', req);
    try {
        const userId = req.user.id;
        const { recipientId, type, deviceId } = req.body;
        const call = await callService.startCall({
            callerId: userId,
            calleeId: String(recipientId),
            callerDeviceId: deviceId,
            type,
        });
        return res.status(201).json({ success: true, call, ...buildIceServers(userId) });
    } catch (err) {
        return fail(res, err, 'Start call');
    }
};

// POST /api/calls/:callId/accept   body: { deviceId }
exports.acceptCall = async (req, res) => {
    try {
        const userId = req.user.id;
        const call = await callService.acceptCall({
            callId: req.params.callId,
            userId,
            deviceId: req.body.deviceId,
        });
        return res.json({ success: true, call, ...buildIceServers(userId) });
    } catch (err) {
        return fail(res, err, 'Accept call');
    }
};

// POST /api/calls/:callId/reject
exports.rejectCall = async (req, res) => {
    try {
        const call = await callService.rejectCall({
            callId: req.params.callId,
            userId: req.user.id,
        });
        return res.json({ success: true, call });
    } catch (err) {
        return fail(res, err, 'Reject call');
    }
};

// POST /api/calls/:callId/end   (hang up, or cancel while still ringing)
exports.endCall = async (req, res) => {
    try {
        const call = await callService.endCall({
            callId: req.params.callId,
            userId: req.user.id,
        });
        return res.json({ success: true, call });
    } catch (err) {
        return fail(res, err, 'End call');
    }
};

// GET /api/calls?before=<callLogId>&limit=30
exports.getCallHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 50);
        const query = { $or: [{ callerId: userId }, { calleeId: userId }] };

        if (req.query.before) {
            if (!mongoose.isValidObjectId(req.query.before)) {
                return res.status(400).json({ success: false, message: 'Invalid cursor' });
            }
            query._id = { $lt: req.query.before };
        }

        const rows = await CallLog.find(query)
            .sort({ _id: -1 })
            .limit(limit + 1)
            .populate([
                { path: 'callerId', select: 'username profilePic' },
                { path: 'calleeId', select: 'username profilePic' },
            ])
            .lean();

        const hasMore = rows.length > limit;
        const page = hasMore ? rows.slice(0, limit) : rows;

        return res.json({
            success: true,
            calls: page.map((c) => formatCall(c, userId)),
            nextCursor: hasMore ? String(page[page.length - 1]._id) : null,
        });
    } catch (err) {
        return fail(res, err, 'Call history');
    }
};