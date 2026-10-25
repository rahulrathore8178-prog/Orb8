'use strict';

const crypto = require('crypto');
const WebSocket = require('ws');

/**
 * Who is connected right now.
 *
 * userId -> Set<socket>. A user can be connected from several devices or tabs at
 * once (this replaces the old `clients: userId -> socket` map, where a second
 * connection silently kicked the first one out).
 *
 * Every socket also has a `deviceId`, so a call can be pinned to the exact device
 * that started or answered it, even if the same user is online elsewhere.
 */
const userSockets = new Map();

const DEVICE_ID_PATTERN = /^[\w-]{8,64}$/;
const EMPTY = new Set();

function getSockets(userId) {
    return userSockets.get(String(userId)) || EMPTY;
}

function addSocket(userId, socket) {
    const id = String(userId);
    if (!userSockets.has(id)) userSockets.set(id, new Set());
    userSockets.get(id).add(socket);
    socket.userId = id;
}

function removeSocket(userId, socket) {
    const id = String(userId);
    const set = userSockets.get(id);
    if (!set) return;
    set.delete(socket);
    if (set.size === 0) userSockets.delete(id);
}

/**
 * Called on the WS `register` message after the JWT is verified.
 * Returns the deviceId the socket ended up with (client-supplied if valid,
 * otherwise generated) so it can be echoed back in the `registered` reply.
 */
function registerSocket(socket, userId, requestedDeviceId) {
    if (socket.userId) removeSocket(socket.userId, socket);
    socket.deviceId =
        typeof requestedDeviceId === 'string' && DEVICE_ID_PATTERN.test(requestedDeviceId)
            ? requestedDeviceId
            : crypto.randomUUID();
    addSocket(userId, socket);
    return socket.deviceId;
}

function unregisterSocket(socket) {
    if (socket.userId) removeSocket(socket.userId, socket);
}

function isOnline(userId) {
    for (const s of getSockets(userId)) {
        if (s.readyState === WebSocket.OPEN) return true;
    }
    return false;
}

/** Newest open socket for this user+device (the newest wins if a reconnect overlapped the old one). */
function findSocket(userId, deviceId) {
    if (!deviceId) return null;
    let found = null;
    for (const s of getSockets(userId)) {
        if (s.deviceId === deviceId && s.readyState === WebSocket.OPEN) found = s;
    }
    return found;
}

function send(socket, payload) {
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(typeof payload === 'string' ? payload : JSON.stringify(payload));
    return true;
}

function sendToUser(userId, payload, { exceptSocket = null } = {}) {
    const data = JSON.stringify(payload);
    for (const s of getSockets(userId)) {
        if (s !== exceptSocket && s.readyState === WebSocket.OPEN) s.send(data);
    }
}

function sendToDevice(userId, deviceId, payload) {
    return send(findSocket(userId, deviceId), payload);
}

function onlineUserIds() {
    return [...userSockets.keys()];
}

module.exports = {
    registerSocket,
    unregisterSocket,
    isOnline,
    findSocket,
    send,
    sendToUser,
    sendToDevice,
    onlineUserIds,
};