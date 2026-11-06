require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');
const { startMonthlyRewardJob, startWeeklyChallengeReminder } = require('./src/jobs/scheduler');
const { reconcileUserLeagues } = require('./src/jobs/reconciliation');
const { ensureDefaultBadges } = require('./src/controllers/badge.controller');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const registry = require('./src/services/callServices/socketRegistry');
const callService = require('./src/services/callServices/callService');
const { handleCallMessage } = require('./src/services/callServices/callingSignal');
const bandwidth = require('./src/config/bandwidthService');
const { POOL, SERVER_ID } = require('./src/config/serverPool');

const PORT = process.env.PORT || 5000;
const TRUST_PROXY_HOPS = parseInt(process.env.TRUST_PROXY_HOPS || '2', 10);
const REGISTER_TIMEOUT_MS = 15000;

(async () => {
  try {
    app.set('trust proxy', TRUST_PROXY_HOPS);

    await connectDB();
    await bandwidth.start(); // loads usage + decides who is active

    await ensureDefaultBadges();

    // Only the ACTIVE server touches shared state at boot. A standby that merely woke up
    // must not close calls that are live on the active server.
    if (bandwidth.amActive()) {
      await reconcileUserLeagues();
      await callService.reconcileStaleCalls();
    }

    // Cron jobs would otherwise fire on all 8 servers (duplicate rewards). Set RUN_JOBS=true on s1 only.
    if (process.env.RUN_JOBS === 'true') {
      startMonthlyRewardJob();
      startWeeklyChallengeReminder();
    }

    const server = http.createServer(app);
    server.keepAliveTimeout = 65 * 1000;
    server.headersTimeout = 66 * 1000;

    const wss = new WebSocket.Server({ server, maxPayload: 64 * 1024 });

    const heartbeat = setInterval(() => {
      wss.clients.forEach((s) => {
        if (!s.isAlive) return s.terminate();
        s.isAlive = false;
        s.ping();
      });
    }, 30000);
    wss.on('close', () => clearInterval(heartbeat));

    // When this server stops being the active one, tell everyone to reconnect elsewhere.
    bandwidth.onDrain(() => {
      console.log('Draining: asking all sockets to move to the active server');
      wss.clients.forEach((s) => {
        try { s.send(JSON.stringify({ type: 'redirect', active: bandwidth.activeServer() })); } catch { }
        s.close(4002, 'server draining');
      });
    });

    app.set('publishChatMessage', (recipientId, message) => {
      registry.sendToUser(recipientId, { type: 'chat-message', message });
    });
    app.set('publishChatEvent', (userId, payload) => {
      registry.sendToUser(userId, payload);
    });

    wss.on('connection', (socket) => {
      // Count outgoing websocket bytes.
      const origSend = socket.send.bind(socket);
      socket.send = (data, ...args) => {
        try { bandwidth.add(Buffer.byteLength(data) + 6); } catch { }
        return origSend(data, ...args);
      };

      // Wrong server (stale client)? Point it to the right one.
      if (bandwidth.activeId() && !bandwidth.amActive()) {
        try { socket.send(JSON.stringify({ type: 'redirect', active: bandwidth.activeServer() })); } catch { }
        return socket.close(4002, 'not active server');
      }

      socket.isAlive = true;
      socket.registered = false;
      socket.on('pong', () => { socket.isAlive = true; });
      socket.on('error', (err) => console.error('Socket error:', err.message));

      const registerTimer = setTimeout(() => {
        if (!socket.registered) socket.close(4001, 'register timeout');
      }, REGISTER_TIMEOUT_MS);

      socket.on('message', (rawData) => {
        let msg;
        try { msg = JSON.parse(rawData); } catch { return; }
        if (!msg || typeof msg !== 'object') return;

        try {
          if (msg.type === 'register') {
            const decoded = jwt.verify(msg.token, process.env.JWT_SECRET);
            const userId = String(decoded.id);
            const deviceId = registry.registerSocket(socket, userId, msg.deviceId);
            socket.registered = true;
            clearTimeout(registerTimer);
            registry.send(socket, { type: 'registered', deviceId });
            callService.replayIncomingCall(userId, socket);
            console.log(`Registered user ${userId} (device ${deviceId})`);
            return;
          }

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
          callService.handleDisconnect(userId, deviceId);
          console.log(`User ${userId} socket closed. Online users: ${registry.onlineUserIds().length}`);
        }
      });
    });

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 [${SERVER_ID}] running on port ${PORT} (${POOL.length} servers in pool)`);
    });

    const shutdown = (signal) => {
      console.log(`${signal} received, shutting down`);
      clearInterval(heartbeat);
      wss.clients.forEach((s) => s.close(1012, 'service restart'));
      bandwidth.flush().catch(() => { }).finally(() => server.close(() => process.exit(0)));
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