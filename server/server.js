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

    // Heartbeat: drop dead sockets so they don't pile up behind Render's proxy
    const heartbeat = setInterval(() => {
      wss.clients.forEach((s) => {
        if (!s.isAlive) return s.terminate();
        s.isAlive = false;
        s.ping();
      });
    }, 30000);
    wss.on('close', () => clearInterval(heartbeat));

    app.set('publishChatMessage', (recipientId, message) => {
      console.log("Publishing message");
      console.log("Recipient:", recipientId);
      console.log("Connected clients:", [...clients.keys()]);

      const recipientSocket = clients.get(String(recipientId));
      if (recipientSocket?.readyState === WebSocket.OPEN) {
        recipientSocket.send(JSON.stringify({ type: 'chat-message', message }));
      }
    });

    // Generic push to one user: { type: 'messages-read' | 'message-edited', ... }
    app.set('publishChatEvent', (userId, payload) => {
      const socket = clients.get(String(userId));
      if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
    });

    wss.on('connection', (socket) => {
      socket.isAlive = true;
      socket.on('pong', () => { socket.isAlive = true; });
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
            socket.send(JSON.stringify({ type: 'registered' }));
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