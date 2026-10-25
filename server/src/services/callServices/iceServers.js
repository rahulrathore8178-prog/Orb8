'use strict';

const crypto = require('crypto');

const TURN_TTL_SECONDS = 60 * 60;

/**
 * ICE server list handed to the clients' RTCPeerConnection.
 *
 * - STUN is always included (public Google STUN, free).
 * - TURN is added when configured. Without TURN, roughly 1 in 5 calls fail
 *   (strict NATs, mobile carriers, corporate Wi-Fi).
 *
 * TURN env vars (pick ONE style):
 *   TURN_URLS         comma-separated, e.g. "turn:turn.example.com:3478,turns:turn.example.com:443?transport=tcp"
 *   TURN_SECRET       coturn "use-auth-secret": short-lived credentials generated per user here
 *   TURN_USERNAME +
 *   TURN_CREDENTIAL   static credentials (what most managed TURN providers give you)
 *
 * If your provider has its own "generate credentials" API (Twilio, Cloudflare, ...),
 * this function is the single place to call it.
 */
function buildIceServers(userId) {
    const iceServers = [
        { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
    ];

    const turnUrls = (process.env.TURN_URLS || '')
        .split(',')
        .map((u) => u.trim())
        .filter(Boolean);

    if (turnUrls.length > 0) {
        if (process.env.TURN_SECRET) {
            const expiry = Math.floor(Date.now() / 1000) + TURN_TTL_SECONDS;
            const username = `${expiry}:${userId}`;
            const credential = crypto
                .createHmac('sha1', process.env.TURN_SECRET)
                .update(username)
                .digest('base64');
            iceServers.push({ urls: turnUrls, username, credential });
        } else if (process.env.TURN_USERNAME && process.env.TURN_CREDENTIAL) {
            iceServers.push({
                urls: turnUrls,
                username: process.env.TURN_USERNAME,
                credential: process.env.TURN_CREDENTIAL,
            });
        }
    }

    return { iceServers, ttlSeconds: TURN_TTL_SECONDS };
}

module.exports = { buildIceServers };