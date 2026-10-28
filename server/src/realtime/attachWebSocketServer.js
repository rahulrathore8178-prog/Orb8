'use strict';

const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const registry = require('../services/callServices/socketRegistry');
const callService = require('../services/callServices/callService');
const { handleCallMessage } = require('../../orb8-webrtc-changes/server/src/services/callServices/callingSignal');

const HEARTBEAT_MS = 30 * 1000;
// Biggest legitimate message is an SDP blob (a few KB). Anything near this is abuse.
const MAX_PAYLOAD_BYTES = 64 * 1024;

/**
 * The single WebSocket entry point for the whole app (chat events + calls).
 *
 * Client -> server
 *   { type: 'register', token, deviceId? }   first message on every connection
 *   { type: 'call-offer' | 'call-answer' | 'call-ice' | 'call-meta', callId, data }
 *
 * Server -> client
 *   { type: 'registered', deviceId }
 *   { type: 'chat-message' | 'messages-read' | 'message-edited', ... }
 *   { type: 'call-incoming' | 'call-accepted' | 'call-handled' | 'call-ended' | 'call-error', ... }
 *   + the relayed call-offer / call-answer / call-ice / call-meta from the other device
 *
 * A user may hold several sockets (phone + browser tab + the chat socket). They are all
 * tracked in socketRegistry; calls are pinned to one exact deviceId.
 */
function attachWebSocketServer(httpServer, app) {
    const wss = new WebSocket.Server({ server: httpServer, maxPayload: MAX_PAYLOAD_BYTES });

    // Heartbeat: drop dead sockets so they don't pile up behind Render's proxy.
    // terminate() fires 'close', which also starts the call reconnect grace period.
    const heartbeat = setInterval(() => {
        wss.clients.forEach((s) => {
            if (!s.isAlive) return s.terminate();
            s.isAlive = false;
            s.ping();
        });
    }, HEARTBEAT_MS);
    wss.on('close', () => clearInterval(heartbeat));

    // Used by chat.controller via req.app.get(...)
    app.set('publishChatMessage', (recipientId, message) => {
        registry.sendToUser(recipientId, { type: 'chat-message', message });
    });
    // Generic push to one user: { type: 'messages-read' | 'message-edited', ... }
    app.set('publishChatEvent', (userId, payload) => {
        registry.sendToUser(userId, payload);
    });

    function handleRegister(socket, msg) {
        let decoded;
        try {
            decoded = jwt.verify(msg.token, process.env.JWT_SECRET);
        } catch {
            registry.send(socket, { type: 'error', code: 'AUTH_FAILED', message: 'Invalid or expired token' });
            return;
        }
        const userId = String(decoded.id);
        const deviceId = registry.registerSocket(socket, userId, msg.deviceId);
        registry.send(socket, { type: 'registered', deviceId });
        // If a call is ringing for this user right now (reconnect / app opened from a push), ring this socket too.
        callService.replayIncomingCall(userId, socket);
    }

    wss.on('connection', (socket) => {
        socket.isAlive = true;
        socket.on('pong', () => {
            socket.isAlive = true;
        });
        // Without a listener an 'error' event (e.g. oversized frame) would crash the process.
        socket.on('error', (err) => console.error('WS socket error:', err.message));

        socket.on('message', (rawData) => {
            // Never log raw frames: 'register' carries the JWT and call signals carry SDP.
            let msg;
            try {
                msg = JSON.parse(rawData.toString());
            } catch {
                return;
            }
            if (!msg || typeof msg.type !== 'string') return;

            try {
                if (msg.type === 'register') return handleRegister(socket, msg);
                if (handleCallMessage(socket, msg)) return;
                if (msg.type === 'chat-message') {
                    registry.send(socket, { type: 'error', message: 'Send messages through the REST API' });
                }
            } catch (err) {
                console.error('Failed to process ws msg:', err);
            }
        });

        socket.on('close', () => {
            const { userId, deviceId } = socket;
            registry.unregisterSocket(socket);
            // If this device was carrying a call, give it a short grace period to reconnect.
            if (userId) callService.handleDisconnect(userId, deviceId);
        });
    });

    return wss;
}

module.exports = { attachWebSocketServer };
