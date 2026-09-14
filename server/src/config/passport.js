const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');

const NODE_ENV = process.env.NODE_ENV || 'development';
const BACKEND_URL =
  process.env.BACKEND_URL ||
  (NODE_ENV === 'production'
    ? 'https://orb8.onrender.com'
    : 'http://localhost:5000');

let isGoogleEnabled = false;

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (user) return done(null, user);

          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await User.findOne({ email });
            if (user) {
              user.googleId = profile.id;
              if (!user.profilePic && profile.photos?.[0]?.value) {
                user.profilePic = profile.photos[0].value;
              }
              await user.save();
              return done(null, user);
            }
          }

          user = await User.create({
            username:
              (profile.displayName?.replace(/\s+/g, '_').toLowerCase() || 'google_user') +
              '_' +
              Date.now().toString(36),
            email: email || `${profile.id}@google.oauth`,
            googleId: profile.id,
            authProvider: 'google',
            profilePic: profile.photos?.[0]?.value || '',
            needsProfileCompletion: true,
          });

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  isGoogleEnabled = true;
  // console.log('[PASSPORT] Google OAuth ENABLED');
  // console.log('[PASSPORT] NODE_ENV:', NODE_ENV);
  // console.log('[PASSPORT] BACKEND_URL:', BACKEND_URL);
  // console.log('[PASSPORT] GOOGLE_CLIENT_ID prefix:', process.env.GOOGLE_CLIENT_ID?.slice(0, 20));
  // console.log('[PASSPORT] callbackURL:', `${BACKEND_URL}/api/auth/google/callback`);
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