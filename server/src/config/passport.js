const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');

const NODE_ENV = process.env.NODE_ENV || 'development';
const TAG = '[GOOGLE-AUTH]';
const maskEmail = (email) => (email ? email.replace(/^(.).*(@.*)$/, '$1***$2') : 'none');

// Relative by default so the host comes from the request, not a stale BACKEND_URL.
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback';

let isGoogleEnabled = false;

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        proxy: true,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          console.log(`${TAG} S3a Google profile received`, {
            googleId: profile.id,
            email: maskEmail(email),
            displayName: profile.displayName,
          });

          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            console.log(`${TAG} S3a existing Google user found`, { user: String(user._id) });
            return done(null, user);
          }

          if (email) {
            user = await User.findOne({ email });
            if (user) {
              console.log(`${TAG} S3a linking Google to existing email account`, { user: String(user._id) });
              user.googleId = profile.id;
              if (!user.profilePic && profile.photos?.[0]?.value) {
                user.profilePic = profile.photos[0].value;
              }
              await user.save();
              return done(null, user);
            }
          }

          const username = profile.displayName?.replace(/\s+/g, '_').toLowerCase() || 'google_user';
          console.log(`${TAG} S3a creating new user`, { username });
          user = await User.create({
            username,
            email: email || `${profile.id}@google.oauth`,
            googleId: profile.id,
            authProvider: 'google',
            profilePic: profile.photos?.[0]?.value || '',
            needsProfileCompletion: true,
          });

          console.log(`${TAG} S3a new user created`, { user: String(user._id) });
          return done(null, user);
        } catch (err) {
          console.error(`${TAG} S3a user lookup/create FAILED`, { name: err.name, message: err.message });
          return done(err, null);
        }
      }
    )
  );

  isGoogleEnabled = true;
  console.log(`${TAG} S0 strategy enabled`, {
    NODE_ENV,
    callbackURL: GOOGLE_CALLBACK_URL,
    ignoredEnvBACKEND_URL: process.env.BACKEND_URL || 'unset',
    FRONTEND_URL: process.env.FRONTEND_URL || 'UNSET',
    clientIdPrefix: process.env.GOOGLE_CLIENT_ID.slice(0, 12),
  });
} else {
  console.warn('[PASSPORT] Google OAuth DISABLED: GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET missing');
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
module.exports.isGoogleEnabled = isGoogleEnabled;