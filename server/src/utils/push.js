const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const userModel = require('../models/user.model');

// Prefer an env var (base64 of the service-account JSON) so the key never lives in git.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8'))
    : require('../config/orbit-661b7-firebase-adminsdk-fbsvc-8e8ddf5842.json');

const firebaseApp = getApps().length
    ? getApps()[0]
    : initializeApp({ credential: cert(serviceAccount) });
const messaging = getMessaging(firebaseApp);

const MAX_BATCH_SIZE = 500;
const CHANNEL_ID = 'default'; // must match the channel created in the app (push.ts)
const INVALID_TOKEN_CODES = new Set([
    'messaging/registration-token-not-registered',
    'messaging/invalid-registration-token',
]);

const stringifyData = (data) =>
    Object.fromEntries(
        Object.entries(data || {})
            .filter(([, value]) => value !== undefined && value !== null)
            .map(([key, value]) => [key, typeof value === 'object' ? JSON.stringify(value) : String(value)])
    );

async function sendPush(userIds, { title, body, data = {}, category = 'social' }) {
    try {
        const ids = [].concat(userIds).filter(Boolean);
        if (!ids.length) return;

        const users = await userModel
            .find({ _id: { $in: ids } })
            .select('deviceTokens notificationPreferences');
        const messages = [];

        for (const user of users) {
            const preferences = user.notificationPreferences || {};
            if (preferences.pushEnabled === false || preferences[category] === false) continue;

            for (const raw of user.deviceTokens || []) {
                const token = typeof raw === 'string' ? raw.trim() : '';
                if (!token || token.startsWith('ExponentPushToken')) continue; // legacy Expo tokens
                messages.push({
                    token,
                    notification: { title, body },
                    data: stringifyData(data),
                    android: {
                        priority: 'high',
                        notification: { channelId: CHANNEL_ID },
                    },
                    apns: {
                        headers: { 'apns-priority': '10' },
                        payload: { aps: { sound: 'default' } },
                    },
                });
            }
        }

        if (!messages.length) return;

        const invalidTokens = [];
        for (let index = 0; index < messages.length; index += MAX_BATCH_SIZE) {
            const batch = messages.slice(index, index + MAX_BATCH_SIZE);
            const response = await messaging.sendEach(batch); // takes an array of messages

            response.responses.forEach((result, i) => {
                if (result.success) return;
                console.error('[push] FCM send failed:', result.error?.code, result.error?.message);
                if (INVALID_TOKEN_CODES.has(result.error?.code)) {
                    invalidTokens.push(batch[i].token);
                }
            });
        }

        if (invalidTokens.length) {
            await userModel.updateMany(
                { deviceTokens: { $in: invalidTokens } },
                { $pull: { deviceTokens: { $in: invalidTokens } } }
            );
        }
    } catch (error) {
        console.error('[push] FCM notification failed:', error.message);
    }
}

module.exports = { sendPush };