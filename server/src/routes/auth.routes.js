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
router.patch('/user/notifications/:notificationId/read', protect, authController.markNotificationRead);
router.patch('/user/streak', protect, authController.updateStreak);
router.post('/user/rewards/claim', protect, authController.claimReward);
router.post('/user/forgot-password', authController.forgotPassword);
router.post('/user/reset-password', authController.resetPassword);
router.get('/user/logout', authController.logoutUser);
router.patch('/complete-profile', protect, upload.profileImageUpload, authController.completeProfile);

router.get('/oauth/status', (req, res) => {
  res.json({ google: isGoogleEnabled });
});

const frontendUrl = process.env.FRONTEND_URL;
const TAG = '[GOOGLE-AUTH]';
const requestOrigin = (req) => `${req.headers['x-forwarded-proto'] || req.protocol}://${req.headers['x-forwarded-host'] || req.headers.host}`;
const maskToken = (token) => (token ? `${token.slice(0, 8)}...(${token.length} chars)` : 'none');

if (!frontendUrl) {
  console.warn(`${TAG} FRONTEND_URL is not set, so post-login redirects will start with "undefined"`);
}

if (isGoogleEnabled) {
  router.get(
    '/google',
    (req, res, next) => {
      console.log(`${TAG} S1 /google hit`, {
        requestHost: requestOrigin(req),
        callbackSentToGoogle: `${requestOrigin(req)}/api/auth/google/callback`,
        referer: req.headers.referer || 'none',
        frontendUrl,
      });
      next();
    },
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  router.get(
    '/google/callback',
    (req, res, next) => {
      console.log(`${TAG} S2 /google/callback hit`, {
        requestHost: requestOrigin(req),
        queryKeys: Object.keys(req.query),
        googleError: req.query.error || null,
        googleErrorDescription: req.query.error_description || null,
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
          return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
        }
        req.user = user;
        console.log(`${TAG} S3 authenticate OK`, { user: String(user._id) });
        return next();
      })(req, res, next);
    },
    (req, res) => {
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      const user = req.user;
      const target = user.needsProfileCompletion == true ? `${frontendUrl}/signup` : `${frontendUrl}/community`;
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