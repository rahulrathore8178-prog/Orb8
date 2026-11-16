const jwt = require('jsonwebtoken');

function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    // The header decides the account. The cookie is only for clients that send no header (e.g. a browser).
    // If a header is present but invalid, we fail instead of falling back to a cookie from another account.
    const token = bearerToken || req.cookies?.token;

    if (!token) {
      console.warn(`[AUTH] No token found in request ${req.method} ${req.originalUrl}`);
      return res.status(401).json({ message: 'Unauthorized. Please login first.' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('[AUTH] JWT_SECRET is not configured');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      _id: decoded.id,
    };
    return next();
  } catch (error) {
    console.error(`[AUTH] Token verification failed on ${req.method} ${req.originalUrl}:`, error.message);
    return res.status(401).json({ message: 'Invalid or expired session.' });
  }
}

module.exports = {
  protect
};