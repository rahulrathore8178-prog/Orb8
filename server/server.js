require('dotenv').config();
const app = require('./src/app');
const mongoose = require('mongoose');
const connectDB = require('./src/db/db');
const { startMonthlyRewardJob, startWeeklyChallengeReminder } = require('./src/jobs/scheduler');
const { reconcileUserLeagues } = require('./src/jobs/reconciliation');
const { ensureDefaultBadges } = require('./src/controllers/badge.controller');
const Message = require('./src/models/messages.model');
const { notifyUser } = require("./src/controllers/pushnotification.controller");
const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 5000;
const clients = new Map();

(async () => {
  try {
    await connectDB();
    await ensureDefaultBadges();

    app.set('trust proxy', 1);

    await reconcileUserLeagues();
    startMonthlyRewardJob();
    startWeeklyChallengeReminder();

    const server = http.createServer(app);
    const wss = new WebSocket.Server({ server });

    wss.on('connection', async (socket) => {
      console.log('New WS connection');
      let registeredUserId = null;

      socket.on('message', async (rawData) => {
        try {
          const msg = JSON.parse(rawData);

          if (msg.type === 'register') {
            registeredUserId = msg.userId;
            clients.set(msg.userId, socket);
            console.log(`✅ Registered user ${msg.userId}`);
            console.log(`📋 Active clients:`, Array.from(clients.keys()));
            return;
          }

          // console.log('📨 Raw incoming message:', JSON.stringify(msg, null, 2));

          if (msg.type === 'chat-message') {
            const { senderId, recipientId, text, time, id } = msg.message || {};
            if (!senderId || !recipientId || !text) {
              console.error('❌ Missing required fields:', { senderId, recipientId, text });
              return;
            }

            const saved = await Message.create({
              senderId: new mongoose.Types.ObjectId(senderId),
              recipientId: new mongoose.Types.ObjectId(recipientId),
              content: text,
              type: 'chat_message',
              timestamp: new Date(),
              delivered: false
            });

            await notifyUser(recipientId, "New message", text, {
                  type: "chat-message",
                  senderId: String(senderId),
                  recipientId: String(recipientId),
                  messageId: String(saved._id),
                  timestamp: saved.timestamp.toISOString()
            });

            const payload = JSON.stringify({
              type: 'chat-message',
              message: { id, senderId, recipientId, text, time, timestamp: saved.timestamp }
            });

            const recipientSocket = clients.get(recipientId);
            console.log('🔍 Looking for recipient:', recipientId);
            console.log('📋 Active clients:', Array.from(clients.keys()));
            console.log('🎯 Recipient socket found:', !!recipientSocket);

            if (recipientSocket && recipientSocket.readyState === WebSocket.OPEN) {
              recipientSocket.send(payload);
              console.log('✅ Message sent to recipient:', recipientId);
            } else {
              console.log('❌ Recipient not connected:', recipientId);
            }
          }
        } catch (err) {
          console.error('Failed to process ws msg', err);
        }
      });

      socket.on('close', () => {
        if (registeredUserId) {
          clients.delete(registeredUserId);
          console.log(`🔴 User ${registeredUserId} disconnected and removed`);
          console.log(`📋 Remaining clients:`, Array.from(clients.keys()));
        }
      });
    });

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running with WebSockets + MongoDB on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server failed to start:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
})();