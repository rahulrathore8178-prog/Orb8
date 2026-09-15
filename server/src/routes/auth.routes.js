const express = require('express');
const authController = require('../controllers/auth.controller');
const passport = require('../config/passport');
const { isGoogleEnabled } = require('../config/passport');
const jwt = require('jsonwebtoken');
const { protect } = require('../middlewares/auth.middleware');
const { profileImageUpload } = require('../middlewares/upload.middleware');

const router = express.Router();

router.post('/user/register', authController.registerUser);
router.post('/user/login', authController.loginUser);
router.get('/user/me', protect, authController.getCurrentUser);
router.get('/user/:userId/public', authController.getPublicProfile);
router.patch('/user/profile', protect, authController.updateProfile);
router.patch('/user/profile/image', protect, profileImageUpload, authController.uploadProfileImage);
router.get('/user/notifications', protect, authController.getNotifications);
router.patch('/user/notifications/:notificationId/read', protect, authController.markNotificationRead);
router.patch('/user/streak', protect, authController.updateStreak);
router.post('/user/rewards/claim', protect, authController.claimReward);
router.post('/user/forgot-password', authController.forgotPassword);
router.post('/user/reset-password', authController.resetPassword);
router.get('/user/logout', authController.logoutUser);
router.post('/completeProfile', authController.completeProfile);

router.get('/oauth/status', (req, res) => {
  res.json({ google: isGoogleEnabled });
});

const frontendUrl = process.env.FRONTEND_URL

if (isGoogleEnabled) {
  router.get(
    '/google',
    (req, res, next) => {
      console.log('[AUTH] /google hit');
      console.log('[AUTH] callback expected:', `${process.env.BACKEND_URL}/api/auth/google/callback`);
      next();
    },
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  router.get(
    '/google/callback',
    (req, res, next) => {
      console.log('[AUTH] /google/callback hit');
      console.log('[AUTH] query:', req.query);
      next();
    },
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${frontendUrl}/login?error=oauth_failed`,
    }),
    (req, res) => {
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      const user = req.user;
      console.log(`[AUTH] Google OAuth success user=${req.user._id}`);
      if (user.needsProfileCompletion == true) {
        return res.redirect(`${frontendUrl}/signup?token=${token}`);
      }
      console.log(`[AUTH] Google OAuth success, redirecting to ${frontendUrl}/auth/success?token=${token}`);
      return res.redirect(`${frontendUrl}/auth/success?token=${token}`);
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