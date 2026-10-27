const { Expo } = require('expo-server-sdk');
const userModel = require('../models/user.model');

const expo = new Expo(process.env.EXPO_ACCESS_TOKEN ? { accessToken: process.env.EXPO_ACCESS_TOKEN } : {});

/**
 * sendPush(userIds, { title, body, data, category })
 * category: 'social' | 'learning' | 'product'  (matches notificationPreferences)
 * Fire and forget: sendPush(...) without await is fine.
 */
async function sendPush(userIds, { title, body, data = {}, category = 'social' }) {
    try {
        const ids = [].concat(userIds).filter(Boolean);
        if (!ids.length) return;

        const users = await userModel.find({ _id: { $in: ids } }).select('deviceTokens notificationPreferences');
        const messages = [];
        for (const u of users) {
            const prefs = u.notificationPreferences || {};
            if (prefs.pushEnabled === false || prefs[category] === false) continue;
            for (const to of u.deviceTokens || []) {
                if (!Expo.isExpoPushToken(to)) continue;
                messages.push({ to, title, body, data, sound: 'default', channelId: 'default', priority: 'high' });
            }
        }
        if (!messages.length) return;

        const dead = [];
        for (const chunk of expo.chunkPushNotifications(messages)) {
            try {
                const tickets = await expo.sendPushNotificationsAsync(chunk);
                tickets.forEach((t, i) => {
                    if (t.status === 'error' && t.details?.error === 'DeviceNotRegistered') dead.push(chunk[i].to);
                });
            } catch (e) {
                console.error('[push] chunk failed:', e.message);
            }
        }
        if (dead.length) {
            await userModel.updateMany({ deviceTokens: { $in: dead } }, { $pull: { deviceTokens: { $in: dead } } });
        }
    } catch (e) {
        console.error('[push] sendPush error:', e.message);
    }
}

module.exports = { sendPush };