const router = require('express').Router();
const bw = require('../config/bandwidthService');
const { SERVER_ID } = require('../config/serverPool');

router.get('/ping', (_req, res) => res.json({ ok: true, self: SERVER_ID }));

router.get('/active', async (req, res) => {
    try {
        const skip = String(req.query.skip || '').split(',').filter(Boolean);
        const st = await bw.getStatus(skip);
        res.set('Cache-Control', 'no-store');
        res.json({
            active: st.active,
            exhausted: st.exhausted,
            self: SERVER_ID,
            servers: st.servers.map((s) => ({ id: s.id, gb: +(s.bytes / 1024 ** 3).toFixed(2), full: s.full })),
        });
    } catch (e) {
        res.status(500).json({ message: 'status failed' });
    }
});

module.exports = router;