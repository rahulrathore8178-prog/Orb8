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

// Proxy hops in front of Express: Render's LB (1) + your nginx (1) = 2.
// If nginx itself is hosted on Render (another LB in front of it), set TRUST_PROXY_HOPS=3.
const TRUST_PROXY_HOPS = parseInt(process.env.TRUST_PROXY_HOPS || '2', 10);

// An unregistered socket is closed after this long (stops idle junk connections).
const REGISTER_TIMEOUT_MS = 15000;

(async () => {
  try {
    app.set('trust proxy', TRUST_PROXY_HOPS);

    await connectDB();
    await ensureDefaultBadges();

    await reconcileUserLeagues();
    // Live call state lives in memory, so close any call rows left open by the last run.
    await callService.reconcileStaleCalls();
    startMonthlyRewardJob();
    startWeeklyChallengeReminder();

    const server = http.createServer(app);
    // Keep-alive must outlast the proxies in front, otherwise you get random 502s.
    server.keepAliveTimeout = 65 * 1000;
    server.headersTimeout = 66 * 1000;

    // 64 KB is far above any SDP / ICE / chat payload and stops oversized frames early.
    const wss = new WebSocket.Server({ server, maxPayload: 64 * 1024 });

    // Heartbeat: drop dead sockets so they don't pile up behind the proxies
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
      socket.registered = false;
      socket.on('pong', () => { socket.isAlive = true; });
      // Without this, a socket error can surface as an unhandled 'error' event.
      socket.on('error', (err) => console.error('Socket error:', err.message));

      const registerTimer = setTimeout(() => {
        if (!socket.registered) socket.close(4001, 'register timeout');
      }, REGISTER_TIMEOUT_MS);

      socket.on('message', (rawData) => {
        // NOTE: raw messages are not logged. Call signaling carries SDP and ICE
        // data, which is noisy and shouldn't sit in your logs.
        let msg;
        try {
          msg = JSON.parse(rawData);
        } catch {
          return;
        }
        if (!msg || typeof msg !== 'object') return;

        try {
          if (msg.type === 'register') {
            const decoded = jwt.verify(msg.token, process.env.JWT_SECRET);
            const userId = String(decoded.id);
            const deviceId = registry.registerSocket(socket, userId, msg.deviceId);
            socket.registered = true;
            clearTimeout(registerTimer);
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
        clearTimeout(registerTimer);
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

    // Graceful shutdown (Render sends SIGTERM on deploy/restart): tell clients to
    // reconnect (nginx will route them) instead of just dropping them.
    const shutdown = (signal) => {
      console.log(`${signal} received, shutting down`);
      clearInterval(heartbeat);
      wss.clients.forEach((s) => s.close(1012, 'service restart'));
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(0), 10000).unref();
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('❌ Server failed to start:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
})();