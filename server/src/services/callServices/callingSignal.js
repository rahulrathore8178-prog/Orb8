'use strict';

const registry = require('./socketRegistry');
const callService = require('../services/callService');

// SDP offers/answers are a few KB; ICE candidates are tiny. Anything bigger is abuse.
const MAX_SIGNAL_CHARS = 16 * 1024;
const RELAY_TYPES = new Set(['call-offer', 'call-answer', 'call-ice']);

function replyError(socket, callId, code, message) {
    registry.send(socket, { type: 'call-error', callId: callId || null, code, message });
}

/**
 * Relays WebRTC signaling between the two devices of an active call.
 * The server never reads the SDP/ICE content, it only checks WHO may send it and WHERE it goes.
 *
 * Client -> server:  { type: 'call-offer' | 'call-answer' | 'call-ice', callId, data }
 * Server -> peer:    same shape, forwarded as-is
 *
 * Returns true if the message was a call message (handled or rejected), so the
 * caller of this function can `return` early.
 */
function handleCallMessage(socket, msg) {
    if (!RELAY_TYPES.has(msg.type)) return false;

    if (!socket.userId) {
        replyError(socket, msg.callId, 'NOT_REGISTERED', 'Register before sending call signals');
        return true;
    }

    const { callId, data } = msg;
    if (typeof callId !== 'string' || !data || typeof data !== 'object') {
        replyError(socket, callId, 'INVALID_SIGNAL', 'callId and data are required');
        return true;
    }
    if (JSON.stringify(data).length > MAX_SIGNAL_CHARS) {
        replyError(socket, callId, 'SIGNAL_TOO_LARGE', 'Signal payload too large');
        return true;
    }

    const target = callService.resolveRelayTarget(callId, socket.userId, socket.deviceId);
    if (!target) {
        replyError(socket, callId, 'NO_ACTIVE_CALL', 'No active call for this device');
        return true;
    }

    registry.send(target, { type: msg.type, callId, data });
    return true;
}

module.exports = { handleCallMessage };