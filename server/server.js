require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');
const { startMonthlyRewardJob, startWeeklyChallengeReminder } = require('./src/jobs/scheduler');
const { reconcileUserLeagues } = require('./src/jobs/reconciliation');
const { ensureDefaultBadges } = require('./src/controllers/badge.controller');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

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

    app.set('publishChatMessage', (recipientId, message) => {
      console.log("Publishing message");
      console.log("Recipient:", recipientId);
      console.log("Connected clients:", [...clients.keys()]);

      const recipientSocket = clients.get(String(recipientId));
      if (recipientSocket?.readyState === WebSocket.OPEN) {
        recipientSocket.send(JSON.stringify({ type: 'chat-message', message }));
      }
    });

    wss.on('connection', async (socket) => {
      console.log('New WS connection');
      let registeredUserId = null;

      socket.on('message', async (rawData) => {
        console.log('📨 WS Message Received:', rawData.toString());
        try {
          const msg = JSON.parse(rawData);
          console.log('📨 Parsed Message:', msg)

          if (msg.type === 'register') {
            const decoded = jwt.verify(msg.token, process.env.JWT_SECRET);
            registeredUserId = String(decoded.id);
            clients.set(registeredUserId, socket);
            console.log(`Registered user ${registeredUserId}`);
            return;
          }

          if (msg.type === 'chat-message') {
            socket.send(JSON.stringify({ type: 'error', message: 'Send messages through the REST API' }));
          }
        } catch (err) {
          console.error('Failed to process ws msg', err);
        }
      });

      socket.on('close', () => {
        if (registeredUserId && clients.get(registeredUserId) === socket) {
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