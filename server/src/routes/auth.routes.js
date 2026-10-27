const express = require('express');
const authController = require('../controllers/auth.controller');
const passport = require('../config/passport');
const { isGoogleEnabled } = require('../config/passport');
const jwt = require('jsonwebtoken');
const { protect } = require('../middlewares/auth.middleware');
const { profileImageUpload } = require('../middlewares/upload.middleware');
// const { googleMobile } = require('../controllers/googleMobile.controller');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

router.post('/user/register', authController.registerUser);
router.post('/user/login', authController.loginUser);
router.post('/google/mobile', authController.googleMobile);
router.get('/user/me', protect, authController.getCurrentUser);
router.get('/user/:userId/public',protect, authController.getPublicProfile);
router.patch('/user/profile', protect, authController.updateProfile);
router.patch('/user/profile/image', protect, profileImageUpload, authController.uploadProfileImage);
router.get('/user/notifications', protect, authController.getNotifications);
router.patch('/user/notifications/read-all', protect, authController.markAllNotificationsRead);
router.get('/user/checklist', protect, authController.getChecklist);
router.get('/user/habit', protect, authController.getHabit);
router.patch('/user/notifications/:notificationId/read', protect, authController.markNotificationRead);
router.patch('/user/streak', protect, authController.updateStreak);
router.post('/user/rewards/claim', protect, authController.claimReward);
router.post('/user/forgot-password', authController.forgotPassword);
router.post('/user/reset-password', authController.resetPassword);
router.get('/user/logout', authController.logoutUser);
router.patch('/complete-profile', protect, upload.profileImageUpload, authController.completeProfile);
router.get('/user/username-available', authController.usernameAvailable);
router.patch('/complete-profile', protect, authController.completeProfile);
router.get('/oauth/status', (req, res) => {
  res.json({ google: isGoogleEnabled });
});
router.post('/user/push-token', protect, authController.registerPushToken);
router.delete('/user/push-token', protect, authController.removePushToken);

const frontendUrl = process.env.FRONTEND_URL;
const TAG = '[GOOGLE-AUTH]';
const requestOrigin = (req) => `${req.headers['x-forwarded-proto'] || req.protocol}://${req.headers['x-forwarded-host'] || req.headers.host}`;
const maskToken = (token) => (token ? `${token.slice(0, 8)}...(${token.length} chars)` : 'none');

if (!frontendUrl) {
  console.warn(`${TAG} FRONTEND_URL is not set, so post-login redirects will start with "undefined"`);
}

// The login token rides on this redirect, so only exact, known origins are allowed.
const BUILT_IN_FRONTENDS = ['https://orb8-ochre.vercel.app'];
const LOCAL_DEV_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const toOrigin = (value) => {
  try {
    return new URL(String(value)).origin;
  } catch {
    return null;
  }
};

const allowedFrontends = new Set(
  [frontendUrl, ...BUILT_IN_FRONTENDS, ...(process.env.ALLOWED_FRONTEND_ORIGINS || '').split(',')]
    .map((value) => (value && value.trim() ? toOrigin(value.trim()) : null))
    .filter(Boolean)
);

const isAllowedFrontend = (origin) => Boolean(origin) && (allowedFrontends.has(origin) || LOCAL_DEV_ORIGIN.test(origin));
const defaultFrontend = () => toOrigin(frontendUrl) || frontendUrl;

console.log(`${TAG} S0 allowed frontends`, { fallback: defaultFrontend() || 'UNSET', allowed: [...allowedFrontends], localhostAllowed: true });

// Prefer the explicit ?return= from the client, then the Referer header.
const pickFrontend = (req) => {
  const fromQuery = toOrigin(req.query.return);
  const fromReferer = toOrigin(req.headers.referer);
  const candidates = [['query', fromQuery], ['referer', fromReferer]];
  for (const [source, origin] of candidates) {
    if (!origin) continue;
    if (isAllowedFrontend(origin)) return { origin, source };
    console.warn(`${TAG} ignoring frontend origin not on allowlist`, { source, origin });
  }
  return { origin: defaultFrontend(), source: 'env FRONTEND_URL' };
};

const frontendFromState = (req) => {
  try {
    const { fe } = jwt.verify(String(req.query.state || ''), process.env.JWT_SECRET);
    if (isAllowedFrontend(fe)) return { origin: fe, source: 'state' };
    console.warn(`${TAG} state carried an origin that is not allowed`, { fe });
  } catch (error) {
    console.warn(`${TAG} state missing or invalid, using env FRONTEND_URL`, { reason: error.message });
  }
  return { origin: defaultFrontend(), source: 'env FRONTEND_URL' };
};

if (isGoogleEnabled) {
  router.get(
    '/google',
    (req, res, next) => {
      const frontend = pickFrontend(req);
      console.log(`${TAG} S1 /google hit`, {
        requestHost: requestOrigin(req),
        callbackSentToGoogle: `${requestOrigin(req)}/api/auth/google/callback`,
        referer: req.headers.referer || 'none',
        returnParam: req.query.return || 'none',
        returningUserTo: frontend.origin,
        chosenFrom: frontend.source,
      });

      let state;
      try {
        state = jwt.sign({ fe: frontend.origin }, process.env.JWT_SECRET, { expiresIn: '10m' });
      } catch (error) {
        console.error(`${TAG} S1 could not sign state, will fall back to FRONTEND_URL`, { reason: error.message });
      }
      passport.authenticate('google', { scope: ['profile', 'email'], ...(state ? { state } : {}) })(req, res, next);
    }
  );

  router.get(
    '/google/callback',
    (req, res, next) => {
      req.frontend = frontendFromState(req);
      console.log(`${TAG} S2 /google/callback hit`, {
        requestHost: requestOrigin(req),
        queryKeys: Object.keys(req.query),
        googleError: req.query.error || null,
        googleErrorDescription: req.query.error_description || null,
        returningUserTo: req.frontend.origin,
        chosenFrom: req.frontend.source,
      });
      next();
    },
    (req, res, next) => {
      passport.authenticate('google', { session: false }, (err, user, info) => {
        if (err || !user) {
          const googleReply = String(err?.oauthError?.data || '');
          console.error(`${TAG} S3 authenticate FAILED`, {
            name: err?.name || null,
            message: err?.message || null,
            googleReply: googleReply || null,
            info: info || null,
            hint: googleReply.includes('redirect_uri_mismatch')
              ? `Add ${requestOrigin(req)}/api/auth/google/callback to Authorized redirect URIs in Google Cloud Console`
              : null,
          });
          return res.redirect(`${req.frontend.origin}/login?error=oauth_failed`);
        }
        req.user = user;
        console.log(`${TAG} S3 authenticate OK`, { user: String(user._id) });
        return next();
      })(req, res, next);
    },
    (req, res) => {
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      const user = req.user;
      const base = req.frontend.origin;
      const target = user.needsProfileCompletion == true ? `${base}/signup` : `${base}/community`;
      console.log(`${TAG} S4 redirecting browser to frontend`, {
        user: String(user._id),
        needsProfileCompletion: Boolean(user.needsProfileCompletion),
        redirectTo: `${target}?token=${maskToken(token)}`,
      });
      return res.redirect(`${target}?token=${token}`);
    }
  );
} else {
  router.get('/google', (_req, res) =>
    res.status(503).json({ message: 'Google OAuth is not configured.' })
  );
  router.get('/google/callback', (_req, res) =>
    res.status(503).json({ message: 'Google OAuth is not configured.' })
  );
}

module.exports = router;