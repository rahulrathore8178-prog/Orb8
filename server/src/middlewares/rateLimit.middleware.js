const rateLimit = require('express-rate-limit');

// 5 orbital messages per 3 seconds per user (keyed by user id, not IP, so shared Wi-Fi isn't punished)
exports.orbitalMessageLimiter = rateLimit({
    windowMs: 3000,
    limit: 5,
    keyGenerator: (req) => String(req.user.id),
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'You are sending messages too fast. Slow down a little.' },
});