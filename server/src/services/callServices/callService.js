'use strict';

const mongoose = require('mongoose');
const CallLog = require('../../models/callLog.model');
const User = require('../../models/user.model');
const registry = require('../../services/callServices/socketRegistry');

const RING_TIMEOUT_MS = Number(process.env.CALL_RING_TIMEOUT_MS) || 45 * 1000;
const RECONNECT_GRACE_MS = Number(process.env.CALL_RECONNECT_GRACE_MS) || 8 * 1000;
const MAX_CALLS_PER_MINUTE = 6;
const CALL_TYPES = ['audio', 'video'];

class CallError extends Error {
    constructor(status, code, message) {
        super(message);
        this.name = 'CallError';
        this.status = status;
        this.code = code;
    }
}

/**
 * Live call state, in memory (single server instance).
 *   activeCalls: callId -> state
 *   userCall:    userId -> callId   (a user can be in one call at a time)
 *
 * state = {
 *   callId, type, status: 'ringing' | 'active',
 *   callerId, calleeId, callerDeviceId, calleeDeviceId,
 *   caller: { id, username, profilePic },
 *   ringEndsAt, answeredAt, timer, closed, ready
 * }
 *
 * Every transition checks and changes `state` synchronously BEFORE any `await`.
 * Node runs one callback at a time, so "accept" racing "timeout" racing "cancel"
 * resolves cleanly: the first one wins, the others see the new status.
 *
 * To run more than one server instance, this state and the socket registry have to
 * move to Redis (see the notes at the end of the chat).
 */
const activeCalls = new Map();
const userCall = new Map();

const publicUser = (u) => ({ id: String(u._id), username: u.username, profilePic: u.profilePic });

function incomingEvent(state) {
    return {
        type: 'call-incoming',
        call: {
            callId: state.callId,
            type: state.type,
            caller: state.caller,
            ringTimeoutMs: Math.max(0, state.ringEndsAt - Date.now()),
        },
    };
}

function releaseSlots(state) {
    state.closed = true;
    clearTimeout(state.timer);
    activeCalls.delete(state.callId);
    if (userCall.get(state.callerId) === state.callId) userCall.delete(state.callerId);
    if (userCall.get(state.calleeId) === state.callId) userCall.delete(state.calleeId);
}

/** Finish a call: free the users, tell both sides, then persist the outcome. */
async function closeCall(state, status, endReason) {
    if (state.closed) return;
    releaseSlots(state);

    const endedAt = new Date();
    const durationSec = state.answeredAt
        ? Math.max(0, Math.round((endedAt - state.answeredAt) / 1000))
        : 0;

    // `call-ended` is the single source of truth for clients tearing a call down.
    const event = { type: 'call-ended', callId: state.callId, status, reason: endReason, durationSec };
    registry.sendToUser(state.callerId, event);
    registry.sendToUser(state.calleeId, event);

    try {
        await state.ready;
        await CallLog.updateOne(
            { _id: state.callId },
            { $set: { status, endReason, endedAt, durationSec } }
        );
    } catch (err) {
        console.error('Failed to persist call end:', err);
    }
}

function onRingTimeout(state) {
    if (state.closed || state.status !== 'ringing') return;
    closeCall(state, 'missed', 'timeout');
}

function logUnconnected(callerId, calleeId, type, endReason) {
    // Fire and forget: the callee still sees it in their missed-call history.
    CallLog.create({ callerId, calleeId, type, status: 'missed', endReason, endedAt: new Date() })
        .catch((err) => console.error('Failed to log missed call:', err));
}

async function startCall({ callerId, calleeId, callerDeviceId, type }) {
    if (!mongoose.isValidObjectId(calleeId) || calleeId === callerId) {
        throw new CallError(400, 'INVALID_RECIPIENT', 'A valid recipient is required');
    }
    if (!CALL_TYPES.includes(type)) {
        throw new CallError(400, 'INVALID_TYPE', 'Call type must be "audio" or "video"');
    }
    // The caller needs a live socket, otherwise nobody could ever deliver the answer to them.
    if (!registry.findSocket(callerId, callerDeviceId)) {
        throw new CallError(409, 'SOCKET_NOT_CONNECTED', 'Realtime connection is not ready. Reconnect and try again');
    }

    const [caller, callee] = await Promise.all([
        User.findById(callerId).select('username profilePic blockedUsers'),
        User.findById(calleeId).select('username profilePic blockedUsers'),
    ]);
    if (!caller || !callee) throw new CallError(404, 'USER_NOT_FOUND', 'User not found');

    const blocked =
        (caller.blockedUsers || []).some((id) => String(id) === calleeId) ||
        (callee.blockedUsers || []).some((id) => String(id) === callerId);
    if (blocked) throw new CallError(403, 'CALL_UNAVAILABLE', 'Calling is unavailable for this user');

    const recent = await CallLog.countDocuments({
        callerId,
        createdAt: { $gt: new Date(Date.now() - 60 * 1000) },
    });
    if (recent >= MAX_CALLS_PER_MINUTE) {
        throw new CallError(429, 'RATE_LIMITED', 'Too many calls. Try again in a minute');
    }

    // ---- No `await` between these checks and the reservation below (only inside branches that throw) ----
    if (userCall.has(callerId)) {
        throw new CallError(409, 'ALREADY_IN_CALL', 'You are already in a call');
    }
    if (!registry.isOnline(calleeId)) {
        logUnconnected(callerId, calleeId, type, 'unavailable');
        // TODO (push notifications phase): send an FCM/APNs "incoming call" push here.
        throw new CallError(409, 'CALLEE_OFFLINE', 'User is unavailable');
    }
    if (userCall.has(calleeId)) {
        logUnconnected(callerId, calleeId, type, 'busy');
        throw new CallError(409, 'CALLEE_BUSY', 'User is on another call');
    }

    const callId = String(new mongoose.Types.ObjectId());
    const state = {
        callId,
        type,
        status: 'ringing',
        callerId,
        calleeId,
        callerDeviceId,
        calleeDeviceId: null,
        caller: publicUser(caller),
        ringEndsAt: Date.now() + RING_TIMEOUT_MS,
        answeredAt: null,
        timer: null,
        closed: false,
        ready: null,
    };
    activeCalls.set(callId, state);
    userCall.set(callerId, callId);
    userCall.set(calleeId, callId);

    state.ready = CallLog.create({ _id: callId, callerId, calleeId, type, status: 'ringing' });
    try {
        await state.ready;
    } catch (err) {
        releaseSlots(state);
        throw err;
    }
    if (state.closed) throw new CallError(409, 'CALL_ENDED', 'Call ended before it started');

    state.timer = setTimeout(() => onRingTimeout(state), RING_TIMEOUT_MS);
    registry.sendToUser(calleeId, incomingEvent(state));

    return {
        callId,
        type,
        status: 'ringing',
        callee: publicUser(callee),
        ringTimeoutMs: RING_TIMEOUT_MS,
    };
}

async function acceptCall({ callId, userId, deviceId }) {
    const state = activeCalls.get(callId);
    if (!state || state.calleeId !== userId) throw new CallError(404, 'CALL_NOT_FOUND', 'Call not found');
    if (state.status !== 'ringing') throw new CallError(409, 'CALL_NOT_RINGING', 'This call is no longer ringing');

    const socket = registry.findSocket(userId, deviceId);
    if (!socket) throw new CallError(409, 'SOCKET_NOT_CONNECTED', 'Realtime connection is not ready. Reconnect and try again');

    // If the caller dropped while ringing, there is nobody to send the offer.
    if (!registry.findSocket(state.callerId, state.callerDeviceId)) {
        closeCall(state, 'missed', 'caller_disconnected');
        throw new CallError(409, 'CALLER_UNAVAILABLE', 'The caller is no longer available');
    }

    state.status = 'active';
    state.calleeDeviceId = deviceId;
    state.answeredAt = new Date();
    clearTimeout(state.timer);

    // Stop the ringing on the callee's other devices, and tell the caller to send the offer.
    registry.sendToUser(userId, { type: 'call-handled', callId, reason: 'answered_elsewhere' }, { exceptSocket: socket });
    registry.sendToDevice(state.callerId, state.callerDeviceId, { type: 'call-accepted', callId });

    try {
        await state.ready;
        await CallLog.updateOne({ _id: callId }, { $set: { status: 'active', answeredAt: state.answeredAt } });
    } catch (err) {
        console.error('Failed to persist call accept:', err);
    }

    return { callId, type: state.type, status: 'active' };
}

async function rejectCall({ callId, userId }) {
    const state = activeCalls.get(callId);
    if (!state || state.calleeId !== userId) throw new CallError(404, 'CALL_NOT_FOUND', 'Call not found');
    if (state.status !== 'ringing') throw new CallError(409, 'CALL_NOT_RINGING', 'This call is no longer ringing');
    await closeCall(state, 'rejected', 'declined');
    return { callId, status: 'rejected' };
}

/**
 * Hang up. Idempotent on purpose: both sides often press "end" at the same moment,
 * and the second request should not be an error.
 */
async function endCall({ callId, userId }) {
    const state = activeCalls.get(callId);
    if (!state) return { callId, alreadyEnded: true };
    if (state.callerId !== userId && state.calleeId !== userId) {
        throw new CallError(404, 'CALL_NOT_FOUND', 'Call not found');
    }

    if (state.status === 'ringing') {
        if (state.callerId === userId) await closeCall(state, 'cancelled', 'cancelled');
        else await closeCall(state, 'rejected', 'declined');
    } else {
        await closeCall(state, 'ended', 'hangup');
    }
    return { callId, alreadyEnded: false };
}

/**
 * A socket closed. If it was the device carrying a call, give it a short grace
 * period to reconnect (same deviceId) before ending the call, so a Wi-Fi to
 * mobile-data handoff doesn't kill it.
 */
function handleDisconnect(userId, deviceId) {
    const callId = userCall.get(userId);
    const state = callId && activeCalls.get(callId);
    if (!state) return;

    const isCaller = state.callerId === userId && state.callerDeviceId === deviceId;
    const isCallee = state.calleeId === userId && state.calleeDeviceId === deviceId;
    if (!isCaller && !isCallee) return;

    setTimeout(() => {
        if (state.closed) return;
        if (registry.findSocket(userId, deviceId)) return; // it came back
        closeCall(state, state.status === 'ringing' ? 'cancelled' : 'ended', 'disconnected');
    }, RECONNECT_GRACE_MS);
}

/**
 * Authorization for every offer / answer / ICE message: the sender must be one of
 * the two exact devices of an ACTIVE call. Returns the other side's socket or null.
 */
function resolveRelayTarget(callId, userId, deviceId) {
    const state = activeCalls.get(callId);
    if (!state || state.status !== 'active') return null;
    if (state.callerId === userId && state.callerDeviceId === deviceId) {
        return registry.findSocket(state.calleeId, state.calleeDeviceId);
    }
    if (state.calleeId === userId && state.calleeDeviceId === deviceId) {
        return registry.findSocket(state.callerId, state.callerDeviceId);
    }
    return null;
}

/**
 * If a call is still ringing when a device registers (app opened from a push
 * notification, or a reconnect), ring that device too.
 */
function replayIncomingCall(userId, socket) {
    const callId = userCall.get(userId);
    const state = callId && activeCalls.get(callId);
    if (state && state.status === 'ringing' && state.calleeId === userId) {
        registry.send(socket, incomingEvent(state));
    }
}

/** Live state is lost on restart/deploy, so close any log rows left open. Run once at startup. */
async function reconcileStaleCalls() {
    const result = await CallLog.updateMany(
        { status: { $in: ['ringing', 'active'] } },
        { $set: { status: 'failed', endReason: 'server_restart', endedAt: new Date() } }
    );
    if (result.modifiedCount) console.log(`Closed ${result.modifiedCount} stale call(s) from before restart`);
}

module.exports = {
    CallError,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    handleDisconnect,
    resolveRelayTarget,
    replayIncomingCall,
    reconcileStaleCalls,
};