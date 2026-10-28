require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');
const { startMonthlyRewardJob, startWeeklyChallengeReminder } = require('./src/jobs/scheduler');
const { reconcileUserLeagues } = require('./src/jobs/reconciliation');
const { ensureDefaultBadges } = require('./src/controllers/badge.controller');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

// Call system. Adjust these paths if your files live somewhere else.
const registry = require('./src/services/callServices/socketRegistry');
const callService = require('./src/services/callServices/callService');
const { handleCallMessage } = require('./src/services/callServices/callingSignal');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    await ensureDefaultBadges();

    app.set('trust proxy', 1);

    await reconcileUserLeagues();
    // Live call state lives in memory, so close any call rows left open by the last run.
    await callService.reconcileStaleCalls();
    startMonthlyRewardJob();
    startWeeklyChallengeReminder();

    const server = http.createServer(app);
    // 64 KB is far above any SDP / ICE / chat payload and stops oversized frames early.
    const wss = new WebSocket.Server({ server, maxPayload: 64 * 1024 });

    // Heartbeat: drop dead sockets so they don't pile up behind Render's proxy
    const heartbeat = setInterval(() => {
      wss.clients.forEach((s) => {
        if (!s.isAlive) return s.terminate();
        s.isAlive = false;
        s.ping();
      });
    }, 30000);
    wss.on('close', () => clearInterval(heartbeat));

    // Chat: deliver to every device the recipient has online.
    app.set('publishChatMessage', (recipientId, message) => {
      registry.sendToUser(recipientId, { type: 'chat-message', message });
    });

    // Generic push to one user: { type: 'messages-read' | 'message-edited', ... }
    app.set('publishChatEvent', (userId, payload) => {
      registry.sendToUser(userId, payload);
    });

    wss.on('connection', (socket) => {
      socket.isAlive = true;
      socket.on('pong', () => { socket.isAlive = true; });

      socket.on('message', (rawData) => {
        // NOTE: raw messages are no longer logged. Call signaling carries SDP and ICE
        // data, which is noisy and shouldn't sit in your logs.
        let msg;
        try {
          msg = JSON.parse(rawData);
        } catch {
          return;
        }

        try {
          if (msg.type === 'register') {
            const decoded = jwt.verify(msg.token, process.env.JWT_SECRET);
            const userId = String(decoded.id);
            const deviceId = registry.registerSocket(socket, userId, msg.deviceId);
            registry.send(socket, { type: 'registered', deviceId });
            // If a call is ringing for this user right now, ring this device too.
            callService.replayIncomingCall(userId, socket);
            console.log(`Registered user ${userId} (device ${deviceId})`);
            return;
          }

          // call-offer / call-answer / call-ice / call-meta
          if (handleCallMessage(socket, msg)) return;

          if (msg.type === 'chat-message') {
            registry.send(socket, { type: 'error', message: 'Send messages through the REST API' });
          }
        } catch (err) {
          if (msg.type === 'register') {
            registry.send(socket, { type: 'error', code: 'AUTH_FAILED', message: 'Could not authenticate this socket' });
          }
          console.error('Failed to process ws msg:', err.message);
        }
      });

      socket.on('close', () => {
        const { userId, deviceId } = socket;
        registry.unregisterSocket(socket);
        if (userId) {
          // Gives an in-call device a short grace period to reconnect before the call is ended.
          callService.handleDisconnect(userId, deviceId);
          console.log(`User ${userId} socket closed. Online users: ${registry.onlineUserIds().length}`);
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