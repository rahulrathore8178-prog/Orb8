  const { cert, getApps, initializeApp } = require("firebase-admin/app");
  const { getMessaging } = require("firebase-admin/messaging");
  const User = require("../models/user.model");
  const serviceAccount = require("../config/orbit-661b7-firebase-adminsdk-fbsvc-8e8ddf5842.json");

  const firebaseApp = getApps().length
    ? getApps()[0]
    : initializeApp({
      credential: cert(serviceAccount),
    });
  const messaging = getMessaging(firebaseApp);

  async function sendPushNotification(deviceToken, title, body, data = {}) {
    try {
      return await messaging.send({
        token: deviceToken,
        notification: { title, body },
        data: Object.fromEntries(
          Object.entries(data).map(([key, value]) => [key, String(value)])
        ),
      });
    } catch (error) {
      console.error("FCM send failed:", error);
      throw error;
    }
  }

  async function notifyUser(userId, title, body, data = {}) {
    const user = await User.findById(userId).select("deviceTokens notificationPreferences");

    if (!user?.deviceTokens?.length) return;
    const preferences = user.notificationPreferences || {};
    if (preferences.pushEnabled === false) return;
    if (['social', 'learning', 'product'].includes(data.category) && preferences[data.category] === false) return;

    await Promise.allSettled(
      user.deviceTokens.map((token) =>
        sendPushNotification(token, title, body, data)
      )
    );
  }

  module.exports = {
    sendPushNotification,
    notifyUser,
  };