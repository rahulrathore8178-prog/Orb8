'use strict';

const express = require('express');
const { protect } = require('../middlewares/auth.middleware'); // sets req.user.id from the JWT
const calls = require('../controllers/call.controller');

const router = express.Router();

router.use(protect);

router.get('/ice-servers', calls.getIceServers);
router.get('/', calls.getCallHistory);
router.post('/', calls.startCall);
router.post('/:callId/accept', calls.acceptCall);
router.post('/:callId/reject', calls.rejectCall);
router.post('/:callId/end', calls.endCall);

module.exports = router;
