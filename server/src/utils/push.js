const { Expo } = require('expo-server-sdk');
const userModel = require('../models/user.model');

const expo = new Expo(process.env.EXPO_ACCESS_TOKEN ? { accessToken: process.env.EXPO_ACCESS_TOKEN } : {});

async function sendPush(userIds, { title, body, data = {}, category = 'social' }) {
    try {
        const ids = [].concat(userIds).filter(Boolean);
        console.log('[push] sendPush called for', ids.map(String), '|', title);
        if (!ids.length) return;

        const users = await userModel.find({ _id: { $in: ids } }).select('deviceTokens notificationPreferences');
        console.log('[push] users found:', users.length);

        const messages = [];
        for (const u of users) {
            const prefs = u.notificationPreferences || {};
            console.log('[push] user', String(u._id), '| tokens:', (u.deviceTokens || []).length, '| prefs:', JSON.stringify(prefs));
            if (prefs.pushEnabled === false || prefs[category] === false) {
                console.log('[push] skipped by preferences');
                continue;
            }
            for (const to of u.deviceTokens || []) {
                if (!Expo.isExpoPushToken(to)) {
                    console.log('[push] invalid token skipped:', to);
                    continue;
                }
                messages.push({ to, title, body, data, sound: 'default', channelId: 'default', priority: 'high' });
            }
        }
        console.log('[push] messages to send:', messages.length);
        if (!messages.length) return;

        const dead = [];
        for (const chunk of expo.chunkPushNotifications(messages)) {
            try {
                const tickets = await expo.sendPushNotificationsAsync(chunk);
                tickets.forEach((t, i) => {
                    if (t.status === 'error') {
                        console.error('[push] ticket ERROR:', t.message, JSON.stringify(t.details));
                        if (t.details?.error === 'DeviceNotRegistered') dead.push(chunk[i].to);
                    } else {
                        console.log('[push] ticket ok:', t.id);
                    }
                });
            } catch (e) {
                console.error('[push] chunk failed:', e.message);
            }
        }
        if (dead.length) {
            console.log('[push] removing dead tokens:', dead.length);
            await userModel.updateMany({ deviceTokens: { $in: dead } }, { $pull: { deviceTokens: { $in: dead } } });
        }
    } catch (e) {
        console.error('[push] sendPush error:', e.message);
    }
}

module.exports = { sendPush };