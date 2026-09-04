const express = require('express');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
const authRoutes = require('./routes/auth.routes');
const learningRoutes = require('./routes/learning.routes');
const challengeRoutes = require('./routes/challenge.routes');
const badgeRoutes = require('./routes/badge.routes');
const communityRoutes = require('./routes/community.routes');
const socialRoutes = require('./routes/social.routes');
const cors = require('cors');
const path = require('path');
const chatRoutes = require('./routes/chat.routes');
const otpRoutes = require('./routes/otp.routes');
const capsuleRoutes = require('./routes/capsule.routes')
const askIgrisRoutes = require('./routes/askigris.routes');
const firebaseRoutes = require('./routes/firebase.routes');

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use((req, _res, next) => {
  console.log(
    `[REQ] ${req.method} ${req.originalUrl} host=${req.headers.host} origin=${req.headers.origin || '-'} proto=${req.headers['x-forwarded-proto'] || req.protocol}`
  );
  next();
});

app.use(passport.initialize());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/capsule', capsuleRoutes)
app.use('/api/askigris', askIgrisRoutes);
app.use('/api/firebase', firebaseRoutes);

// // add this log
// console.log('Loading community routes...');
// const communityRoutes = require('./routes/community.routes');
// console.log('Community routes loaded:', typeof communityRoutes);

// app.use('/api/community', communityRoutes);

module.exports = app;