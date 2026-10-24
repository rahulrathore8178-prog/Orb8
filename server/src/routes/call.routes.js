'use strict';

const express = require('express');
// Use the same auth middleware your other routes use. It must set req.user.id.
// const auth = require('../middleware/auth');
const calls = require('../controllers/call.controller');

const router = express.Router();

// router.use(auth);

router.get('/ice-servers', calls.getIceServers);
router.get('/', calls.getCallHistory);
router.post('/', calls.startCall);
router.post('/:callId/accept', calls.acceptCall);
router.post('/:callId/reject', calls.rejectCall);
router.post('/:callId/end', calls.endCall);

module.exports = router;