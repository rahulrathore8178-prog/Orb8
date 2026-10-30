const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs/promises');
const mongoose = require('mongoose');
const crypto = require('crypto');
const { checkAndAwardBadges } = require('./badge.controller');
const { sendOtpEmail } = require('../utils/mailer');
const post = require('../models/post.model');
const { uploadBufferToDrive } = require('../utils/driveUpload');
const { currentStreak, dayKey, getDailyPrompt } = require('../utils/habit');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client();

const USERNAME_RE = /^[a-zA-Z0-9_.]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESERVED = new Set(['admin', 'administrator', 'orbit', 'orb8', 'support', 'help', 'settings', 'root', 'system', 'me', 'api', 'null', 'undefined']);
const CI = { locale: 'en', strength: 2 }; // case-insensitive matching
const DUMMY_HASH = bcrypt.hashSync('orbit-dummy-password', 10); // keeps login timing equal for unknown users
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_COOLDOWN_MS = 60 * 1000;

// Placeholder for Google accounts that haven't picked a username yet.
// '#' is not allowed by USERNAME_RE, so no real user can ever have one.
const tempUsername = () => `pending#${crypto.randomBytes(4).toString('hex')}`;
const isTempUsername = (name) => typeof name === 'string' && name.includes('#');

// An account is complete when it has a real username and a password.
const hasCredentials = (u) =>
  Boolean(u && typeof u.username === 'string' && u.username.trim() && !isTempUsername(u.username) && u.password);

const PROFILE_PICS_DIR = path.join(__dirname, '..', '..', 'uploads', 'profile-pics');
const MAX_PROCESSED_IMAGE_BYTES = 450 * 1024;

function buildStoredImagePath(fileName) {
  return `/uploads/profile-pics/${fileName}`;
}

// An account is complete when it can actually log in with a username + password.
// const hasCredentials = (u) => Boolean(u && typeof u.username === 'string' && u.username.trim() && u.password);

// Make the stored flag agree with reality. Uses updateOne so schema validation can never block a login.
async function syncProfileFlag(user) {
  const complete = hasCredentials(user);
  if (user.needsProfileCompletion !== !complete) {
    await userModel.updateOne({ _id: user._id }, { $set: { needsProfileCompletion: !complete } });
    user.needsProfileCompletion = !complete;
  }
  return complete;
}

async function storeProfileImage(userId, buffer) {
  let out = null;
  for (const quality of [78, 70, 62, 55, 48]) {
    out = await sharp(buffer).rotate()
      .resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true })
      .webp({ quality }).toBuffer();
    if (out.length <= MAX_PROCESSED_IMAGE_BYTES) break;
  }
  if (!out || out.length > 1024 * 1024) {
    const e = new Error('Image is too large after compression.');
    e.status = 413;
    throw e;
  }
  const { publicUrl } = await uploadBufferToDrive(out, `${userId}-${Date.now()}.webp`, 'image/webp');
  return publicUrl;
}

// Used when RESPONDING: add the current host
function toPublicUrl(req, profilePic) {
  if (!profilePic || typeof profilePic !== 'string') return profilePic;
  const path = profilePic.replace(/^https?:\/\/[^/]+/, ''); // also fixes old localhost records
  const explicitBase = process.env.PUBLIC_API_URL;
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const base = (explicitBase || `${protocol}://${req.get('host')}`).replace(/\/$/, '');
  return `${base}${path}`;
}

function getUploadedProfileImageFilePath(profilePic) {
  if (!profilePic || typeof profilePic !== 'string') {
    return null;
  }

  const match = profilePic.match(/\/uploads\/profile-pics\/([^/?#]+)/);
  if (!match?.[1]) {
    return null;
  }

  const fileName = path.basename(match[1]);
  return path.join(PROFILE_PICS_DIR, fileName);
}

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

function buildUserPayload(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    profilePic: user.profilePic || '',
    bio: user.bio || '',
    createdAt: user.createdAt,
    notifications: (user.notifications || []).slice(-10).reverse(),
    friends: user.friends || [],
    friendRequests: user.friendRequests || [],
    isPrivate: user.isPrivate ?? true,
    blockedUsers: user.blockedUsers || [],
    profileGridLayout: user.profileGridLayout || [],
    savedCollections: user.savedCollections || [],
    notificationPreferences: user.notificationPreferences || {},
    preferences: user.preferences || [],
  };
}

function signToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// const USERNAME_RE = /^[a-zA-Z0-9_.]{3,20}$/;
// An account is complete when it can actually log in with a username + password.
// const hasCredentials = (u) => Boolean(u && typeof u.username === 'string' && u.username.trim() && u.password);

// Make the stored flag agree with reality. Uses updateOne so schema validation can never block a login.
async function syncProfileFlag(user) {
  const complete = hasCredentials(user);
  if (user.needsProfileCompletion !== !complete) {
    await userModel.updateOne({ _id: user._id }, { $set: { needsProfileCompletion: !complete } });
    user.needsProfileCompletion = !complete;
  }
  return complete;
}

async function storeProfileImage(userId, buffer) {
  let out = null;
  for (const quality of [78, 70, 62, 55, 48]) {
    out = await sharp(buffer).rotate()
      .resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true })
      .webp({ quality }).toBuffer();
    if (out.length <= MAX_PROCESSED_IMAGE_BYTES) break;
  }
  if (!out || out.length > 1024 * 1024) {
    const e = new Error('Image is too large after compression.');
    e.status = 413;
    throw e;
  }
  const { publicUrl } = await uploadBufferToDrive(out, `${userId}-${Date.now()}.webp`, 'image/webp');
  return publicUrl;
}

async function registerUser(req, res) {
  try {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = req.body?.password;

    if (!USERNAME_RE.test(username)) {
      return res.status(400).json({ field: 'username', message: 'Username must be 3-20 characters: letters, numbers, _ or .' });
    }
    if (RESERVED.has(username.toLowerCase())) {
      return res.status(409).json({ field: 'username', message: 'That username is not available.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ field: 'email', message: 'Enter a valid email address.' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ field: 'password', message: 'Password must be at least 6 characters.' });
    }

    const matches = await userModel.find({ $or: [{ email }, { username }] }).collation(CI).limit(4);
    const byEmail = matches.find((u) => (u.email || '').toLowerCase() === email);
    if (byEmail) {
      if (!hasCredentials(byEmail)) {
        return res.status(409).json({
          code: 'GOOGLE_ACCOUNT_PENDING',
          field: 'email',
          message: 'This email is already linked to a Google sign-in. Tap "Continue with Google" to finish setting it up.',
        });
      }
      return res.status(409).json({ field: 'email', message: 'An account with this email already exists. Try logging in.' });
    }
    if (matches.some((u) => (u.username || '').toLowerCase() === username.toLowerCase())) {
      return res.status(409).json({ field: 'username', message: 'Username already taken.' });
    }

    const user = await userModel.create({
      username,
      email,
      password: await bcrypt.hash(password, 10),
      authProvider: 'local',
      needsProfileCompletion: false, // email signups are complete by definition
      notifications: [{ title: 'Welcome to Orb8', detail: 'Your feed is ready.' }],
    });

    const token = signToken(user._id);
    res.cookie('token', token, getCookieOptions());
    return res.status(201).json({ message: 'Registration successful.', token, user: buildUserPayload(user), profileComplete: true });
  } catch (error) {
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] === 'email' ? 'email' : 'username';
      return res.status(409).json({ field, message: field === 'email' ? 'An account with this email already exists.' : 'Username already taken.' });
    }
    console.error('registerUser error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

async function loginUser(req, res) {
  try {
    const raw = typeof req.body?.emailOrUsername === 'string' ? req.body.emailOrUsername.trim() : '';
    const password = req.body?.password;
    if (!raw || typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'Enter your email or username and your password.' });
    }

    const query = raw.includes('@') ? { email: raw.toLowerCase() } : { username: raw };
    const user = await userModel.findOne(query).collation(CI);

    if (!user) {
      await bcrypt.compare(password, DUMMY_HASH); // same timing as a real check
      return res.status(401).json({ message: 'Incorrect email/username or password.' });
    }

    if (!user.password) {
      return res.status(401).json({
        code: 'GOOGLE_ONLY',
        message: 'This account uses Google sign-in. Tap "Continue with Google", or use "Forgot password" to create a password.',
      });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Incorrect email/username or password.' });
    }

    if (!hasCredentials(user)) {
      return res.status(403).json({
        code: 'PROFILE_INCOMPLETE',
        message: 'Your profile is not finished yet. Tap "Continue with Google" to complete it.',
      });
    }

    await syncProfileFlag(user);
    const token = signToken(user._id);
    res.cookie('token', token, getCookieOptions());
    return res.status(200).json({ message: 'Login successful.', token, user: buildUserPayload(user), profileComplete: true });
  } catch (error) {
    console.error('loginUser error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

// googleMobile
async function googleMobile(req, res) {
  const { idToken } = req.body || {};
  if (!idToken) return res.status(400).json({ message: 'idToken is required.' });

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: [process.env.GOOGLE_WEB_CLIENT_ID, process.env.GOOGLE_IOS_CLIENT_ID].filter(Boolean),
    });
    payload = ticket.getPayload();
  } catch (error) {
    console.error('Google token verify failed:', error.message);
    return res.status(401).json({ message: 'Invalid Google token.' });
  }

  try {
    if (!payload?.email || !payload.email_verified) {
      return res.status(401).json({ message: 'Google account email is not verified.' });
    }
    const email = payload.email.toLowerCase();

    // One account per email: find by Google id first, then by email (an email signup).
    let user = await userModel.findOne({ googleId: payload.sub });
    if (!user) user = await userModel.findOne({ email }).collation(CI);

    if (user) {
      if (user.googleId && user.googleId !== payload.sub) {
        return res.status(403).json({ message: 'This email is linked to a different Google account.' });
      }
      if (!user.googleId) {
        await userModel.updateOne({ _id: user._id }, { $set: { googleId: payload.sub } });
        user.googleId = payload.sub;
      }
    } else {
      try {
        user = await userModel.create({
          email,
          username: tempUsername(), // schema requires a username; completeProfile replaces this
          googleId: payload.sub,
          authProvider: 'google',
          needsProfileCompletion: true,
          notifications: [{ title: 'Welcome to Orb8', detail: 'Your feed is ready.' }],
        });
      } catch (e) {
        if (e?.code !== 11000) throw e;
        user = await userModel.findOne({ email }).collation(CI); // two sign-ins raced; use the winner
        if (!user) throw e;
      }
    }

    const profileComplete = await syncProfileFlag(user);

    const token = signToken(user._id);
    res.cookie('token', token, getCookieOptions());
    return res.status(200).json({
      message: 'Google login successful.',
      token,
      user: buildUserPayload(user),
      profileComplete,
    });
  } catch (error) {
    console.error('googleMobile error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

async function getCurrentUser(req, res) {
  try {
    const user = await userModel.findById(req.user.id)
      .select('-password')
    // .populate('badges.badge');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ user: buildUserPayload(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function updateProfile(req, res) {
  try {
    const { username, profilePic, bio } = req.body;
    const updates = {};

    if (typeof username === 'string' && username.trim()) {
      const normalized = username.trim();
      const existing = await userModel.findOne({ username: normalized, _id: { $ne: req.user.id } });
      if (existing) {
        return res.status(409).json({ message: 'Username is already taken.' });
      }
      updates.username = normalized;
    }

    if (typeof profilePic === 'string') {
      updates.profilePic = profilePic.trim();
    }

    if (typeof bio === 'string') {
      updates.bio = bio.trim().substring(0, 200); // Enforce max length
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid profile fields provided.' });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: buildUserPayload(updatedUser)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function uploadProfileImage(req, res) {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ message: 'No image uploaded. Send the file in the "profilePic" field.' });
    }

    let optimized;
    try {
      optimized = await optimizeProfileImage(req.file.buffer);
    } catch (e) {
      if (e.status === 413) return res.status(413).json({ message: 'That photo is too large. Try a smaller one.' });
      return res.status(400).json({ message: 'That file could not be read as an image.' });
    }
    console.log(`[avatar] ${req.file.size} -> ${optimized.length} bytes`);

    const { publicUrl } = await uploadBufferToDrive(optimized, `${req.user.id}-${Date.now()}.webp`, 'image/webp');
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user.id,
      { $set: { profilePic: publicUrl } },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: 'Profile image uploaded successfully.',
      user: buildUserPayload(updatedUser),
      imageSizeBytes: optimized.length,
    });
  } catch (error) {
    console.error('uploadProfileImage error:', error);
    return res.status(500).json({ message: 'Could not upload your photo. Please try again.' });
  }
}
async function getNotifications(req, res) {
  try {
    const user = await userModel.findById(req.user.id).select('notifications');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const notifications = (user.notifications || []).slice(-20).reverse();
    const unreadCount = (user.notifications || []).filter(item => !item.isRead).length;
    return res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

const CHECKLIST_DAYS = 7;

async function getHabit(req, res) {
  try {
    const user = await userModel.findById(req.user.id).select('streakCount lastActiveDay');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.status(200).json({
      streakCount: currentStreak(user),
      activeToday: user.lastActiveDay === dayKey(),
      prompt: getDailyPrompt(),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getChecklist(req, res) {
  try {
    const user = await userModel.findById(req.user.id).select('profilePic bio friends createdAt');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const hasPosted = await post.Post.exists({ author: user._id, isActive: true });
    const items = [
      { key: 'photo', label: 'Add a profile photo', done: Boolean(user.profilePic), to: '/profile' },
      { key: 'bio', label: 'Write a short bio', done: Boolean(user.bio && user.bio.trim()), to: '/profile' },
      { key: 'friend', label: 'Connect with a friend', done: (user.friends || []).length > 0, to: '/explore?tab=search' },
      { key: 'post', label: 'Share your first post', done: Boolean(hasPosted), to: '/community?compose=1' },
    ];

    const ageDays = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000);
    return res.status(200).json({
      items,
      completed: items.filter(item => item.done).length,
      total: items.length,
      daysLeft: Math.max(0, CHECKLIST_DAYS - ageDays),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function markAllNotificationsRead(req, res) {
  try {
    await userModel.updateOne(
      { _id: req.user.id },
      { $set: { 'notifications.$[].isRead': true } }
    );
    return res.status(200).json({ unreadCount: 0 });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function markNotificationRead(req, res) {
  try {
    const { notificationId } = req.params;
    const user = await userModel.findOneAndUpdate(
      { _id: req.user.id, 'notifications._id': notificationId },
      { $set: { 'notifications.$.isRead': true } },
      { new: true }
    ).select('notifications');

    if (!user) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    return res.status(200).json({
      message: 'Notification updated.',
      notifications: (user.notifications || []).slice(-20).reverse(),
      unreadCount: (user.notifications || []).filter(item => !item.isRead).length
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function updateStreak(req, res) {
  try {
    const { streakCount } = req.body;

    if (typeof streakCount !== 'number' || Number.isNaN(streakCount) || streakCount < 0) {
      return res.status(400).json({ message: 'streakCount must be a non-negative number.' });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      req.user.id,
      { $set: { streakCount: Math.floor(streakCount) } },
      { new: true }
    );

    // Check and award streak-milestone badges after streak update
    try {
      await checkAndAwardBadges(req.user.id);
    } catch (badgeError) {
      console.error('Badge check error after streak update:', badgeError);
    }

    // Refresh user to capture any XP/level/league changes from badge bonuses
    const refreshedUser = await userModel.findById(req.user.id);

    // ── Streak milestone notifications ──────────────────────────────────────
    const milestones = [7, 30, 100, 365];
    const newStreak = refreshedUser.streakCount;
    if (milestones.includes(newStreak)) {
      const titles = { 7: '🔥 1 Week Streak!', 30: '🔥 30 Day Streak!', 100: '💯 100 Day Streak!', 365: '🏆 365 Day Streak!' };
      const details = { 7: 'One full week of learning — keep it going!', 30: 'A whole month! You\'re unstoppable!', 100: 'Triple digits! You\'re a learning machine!', 365: 'An entire year of daily learning. Legendary!' };
      await userModel.findByIdAndUpdate(req.user.id, {
        $push: { notifications: { title: titles[newStreak], detail: details[newStreak] } }
      });
    }

    return res.status(200).json({
      message: 'Streak updated.',
      streakCount: refreshedUser.streakCount,
      streakMilestone: milestones.includes(newStreak) ? newStreak : null,
      user: buildUserPayload(await userModel.findById(req.user.id))
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getPublicProfile(req, res) {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID.' });
    }

    const user = await userModel.findById(userId)
      .select('username profilePic bio totalXp level league streakCount badges friends isPrivate blockedUsers profileGridLayout')
      .populate('badges.badge')
      .populate('friends', 'username profilePic');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Relationship between the logged-in user and the profile being viewed
    const me = req.user.id.toString();
    const them = userId.toString();
    const viewer = await userModel.findById(me).select('blockedUsers');
    const isBlocked = user.blockedUsers.some(id => String(id) === me)
      || viewer?.blockedUsers?.some(id => String(id) === them);
    if (isBlocked) return res.status(404).json({ message: 'User not found.' });

    let friendStatus = 'none';
    if (me === them) {
      friendStatus = 'self';
    } else if (await userModel.exists({ _id: me, friends: them })) {
      friendStatus = 'friends';
    } else if (await userModel.exists({ _id: them, 'friendRequests.from': me })) {
      friendStatus = 'request_sent';       // I already asked them
    } else if (await userModel.exists({ _id: me, 'friendRequests.from': them })) {
      friendStatus = 'request_received';   // they asked me
    }

    return res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        profilePic: user.profilePic || '',
        bio: user.bio || '',
        totalXp: user.totalXp || 0,
        level: user.level || 1,
        friends: user.friends || [],
        league: user.league || 'Bronze 1',
        streakCount: user.streakCount || 0,
        badges: user.badges || [],
        friendStatus,
        isPrivate: user.isPrivate,
        canViewPosts: !user.isPrivate || friendStatus === 'friends' || friendStatus === 'self',
        profileGridLayout: user.profileGridLayout || [],
      },
    });
  } catch (error) {
    console.error('getPublicProfile error:', error);
    return res.status(500).json({ message: error.message });
  }
}

async function claimReward(req, res) {
  try {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const user = await userModel.findById(req.user.id);
    const existing = user.rewards.find(r => r.month === month);
    if (existing && existing.claimed) {
      return res.status(400).json({ message: 'Reward already claimed for this month.' });
    }

    if (existing) {
      existing.claimed = true;
      existing.claimedAt = now;
    } else {
      user.rewards.push({ month, rewardType: 'monthly', claimed: true, claimedAt: now });
    }

    // Grant bonus XP for monthly reward
    user.totalXp = (user.totalXp || 0) + 50;
    await user.save();

    await userModel.findByIdAndUpdate(req.user.id, {
      $push: { notifications: { title: '🎁 Monthly Reward Claimed!', detail: 'You earned 50 bonus XP for your monthly reward!' } }
    });

    const refreshed = await userModel.findById(req.user.id);
    return res.status(200).json({ message: 'Reward claimed!', bonusXp: 50, user: buildUserPayload(refreshed) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function forgotPassword(req, res) {
  const generic = { message: 'If that email exists, a code has been sent.' };
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.toLowerCase().trim() : '';
    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });

    const user = await userModel.findOne({ email: email.toLowerCase().trim() });
    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({ message: 'If that email exists, an OTP has been sent.' });
    }

    // Resend cooldown, answered with the same generic reply so nothing leaks.
    const issuedAt = user.resetTokenExpiry ? new Date(user.resetTokenExpiry).getTime() - OTP_TTL_MS : 0;
    if (issuedAt && Date.now() - issuedAt < OTP_COOLDOWN_MS) return res.status(200).json(generic);

    // Keep the same response whether delivery succeeds or the account exists.
    try {
      const result = await sendOtpEmail(user.email, otp);
      if (!result.sent) console.warn('[AUTH] Password reset email provider is not configured.');
    } catch (mailError) {
      console.error('[AUTH] Password reset email delivery failed:', mailError.message);
    }
    if (!emailSent) console.warn('[AUTH] Reset email was not sent. Check SMTP settings.');

    return res.status(200).json({
      message: 'If that email exists, an OTP has been sent.'
    });
  } catch (error) {
    console.error('[AUTH] Forgot password error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

async function resetPassword(req, res) {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.toLowerCase().trim() : '';
    const otp = String(req.body?.otp ?? '').trim();
    const newPassword = req.body?.newPassword;

    if (!EMAIL_RE.test(email) || !/^\d{6}$/.test(otp) || typeof newPassword !== 'string') {
      return res.status(400).json({ message: 'Email, the 6-digit code and a new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const user = await userModel.findOne({ email, resetTokenExpiry: { $gt: new Date() } });
    if (!user || !user.resetToken) {
      return res.status(400).json({ message: 'Invalid or expired code.' });
    }

    if ((user.resetOtpAttempts || 0) >= 5) {
      await userModel.updateOne({ _id: user._id }, { $set: { resetToken: null, resetTokenExpiry: null, resetOtpAttempts: 0 } });
      return res.status(429).json({ message: 'Too many attempts. Please request a new code.' });
    }

    const digest = crypto.createHash('sha256').update(otp).digest('hex');
    const ok = digest.length === user.resetToken.length &&
      crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(user.resetToken));
    if (!ok) {
      await userModel.updateOne({ _id: user._id }, { $inc: { resetOtpAttempts: 1 } });
      return res.status(400).json({ message: 'Invalid or expired code.' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await userModel.updateOne({ _id: user._id }, {
      $set: {
        password: hash,
        resetToken: null,
        resetTokenExpiry: null,
        resetOtpAttempts: 0,
        needsProfileCompletion: !hasCredentials({ username: user.username, password: hash }),
      },
    });

    return res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('[AUTH] Reset password error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const user = await userModel.findOne({
      email: email.toLowerCase().trim(),
      resetTokenExpiry: { $gt: new Date() }
    });
    if (!user || !user.resetToken) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    // Lock after too many wrong attempts
    if (user.resetOtpAttempts >= 5) {
      user.resetToken = null;
      user.resetTokenExpiry = null;
      user.resetOtpAttempts = 0;
      await user.save();
      return res.status(429).json({ message: 'Too many attempts. Please request a new OTP.' });
    }

    const otpDigest = crypto.createHash('sha256').update(String(otp)).digest('hex');
    if (otpDigest !== user.resetToken) {
      user.resetOtpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    user.resetOtpAttempts = 0;
    await user.save();

    return res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}


// completeProfile
const completeProfile = async (req, res) => {
  try {
    const password = req.body?.password;
    const bio = req.body?.bio;
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';

    if (!USERNAME_RE.test(username)) {
      return res.status(400).json({ message: 'Username must be 3-20 characters: letters, numbers, _ or .' });
    }
    if (RESERVED.has(username.toLowerCase())) {
      return res.status(409).json({ message: 'That username is not available.' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (bio !== undefined && (typeof bio !== 'string' || bio.length > 150)) {
      return res.status(400).json({ message: 'Bio must be 150 characters or less' });
    }

    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // This endpoint sets a password without the old one, so it works exactly once.
    if (hasCredentials(user)) {
      await syncProfileFlag(user);
      return res.status(409).json({ message: 'Your profile is already complete.' });
    }

    const taken = await userModel.exists({ username, _id: { $ne: user._id } }).collation(CI);
    if (taken) return res.status(409).json({ message: 'Username already taken' });

    let profilePic;
    if (req.file?.buffer) {
      try {
        profilePic = await storeProfileImage(user._id, req.file.buffer);
      } catch (imgErr) {
        if (imgErr.status === 413) return res.status(413).json({ message: 'That photo is too large. Try a smaller one.' });
        console.error('completeProfile image error:', imgErr.message); // a photo problem should not block signup
      }
    }

    const updated = await userModel.findByIdAndUpdate(
      user._id,
      {
        $set: {
          username,
          password: await bcrypt.hash(password, 10),
          bio: typeof bio === 'string' ? bio.trim() : '',
          needsProfileCompletion: false,
          ...(profilePic ? { profilePic } : {}),
        },
      },
      { new: true }
    );

    return res.status(200).json({
      message: 'Profile completed',
      user: buildUserPayload(updated),
      photoSaved: Boolean(profilePic) || !req.file,
    });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ message: 'Username already taken' });
    console.error('Complete profile error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

async function usernameAvailable(req, res) {
  try {
    const u = typeof req.query.u === 'string' ? req.query.u.trim() : '';
    if (!USERNAME_RE.test(u) || RESERVED.has(u.toLowerCase())) {
      return res.status(200).json({ available: false, reason: 'invalid' });
    }
    const taken = await userModel.exists({ username: u }).collation(CI);
    return res.status(200).json({ available: !taken });
  } catch (error) {
    return res.status(500).json({ message: 'Could not check username.' });
  }
};

const AVATAR_PX = 720;                    // sharp on a 3x phone screen, tiny to upload
const AVATAR_TARGET_BYTES = 160 * 1024;

async function optimizeProfileImage(input) {
  let out = null;
  for (const quality of [82, 76, 70, 62, 54, 46]) {
    out = await sharp(input, { failOn: 'none', limitInputPixels: 100_000_000 })
      .rotate() // honor the phone's orientation, then strip metadata
      .resize({ width: AVATAR_PX, height: AVATAR_PX, fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
    if (out.length <= AVATAR_TARGET_BYTES) break;
  }
  if (!out || out.length > 1024 * 1024) {
    const e = new Error('Image is too large after compression.');
    e.status = 413;
    throw e;
  }
  return out;
}

async function storeProfileImage(userId, buffer) {
  const optimized = await optimizeProfileImage(buffer);
  const { publicUrl } = await uploadBufferToDrive(optimized, `${userId}-${Date.now()}.webp`, 'image/webp');
  return publicUrl;
}

const logoutUser = async (req, res) => {
  res.clearCookie('token', getCookieOptions());
  return res.status(200).json({ message: 'Logged out successfully.' });
};

const EXPO_TOKEN_RE = /^(Exponent|Expo)PushToken\[[^\]]+\]$/;

async function registerPushToken(req, res) {
  try {
    const token = typeof req.body?.token === 'string' ? req.body.token.trim() : '';
    console.log('[push] register request from', String(req.user.id), '| token:', token, '| platform:', req.body?.platform);
    if (!EXPO_TOKEN_RE.test(token)) return res.status(400).json({ message: 'Invalid push token.' });

    await userModel.updateMany({ deviceTokens: token, _id: { $ne: req.user.id } }, { $pull: { deviceTokens: token } });
    await userModel.updateOne({ _id: req.user.id }, { $pull: { deviceTokens: token } });
    await userModel.updateOne({ _id: req.user.id }, { $push: { deviceTokens: { $each: [token], $slice: -10 } } });
    console.log('[push] token saved for', String(req.user.id));
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('registerPushToken error:', error);
    return res.status(500).json({ message: 'Could not save push token.' });
  }
}

async function removePushToken(req, res) {
  try {
    const token = typeof req.body?.token === 'string' ? req.body.token.trim() : '';
    if (token) await userModel.updateOne({ _id: req.user.id }, { $pull: { deviceTokens: token } });
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: 'Could not remove push token.' });
  }
}

module.exports = {
  registerUser,
  loginUser,
  googleMobile,
  getCurrentUser,
  getPublicProfile,
  updateProfile,
  uploadProfileImage,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getChecklist,
  getHabit,
  updateStreak,
  claimReward,
  forgotPassword,
  resetPassword,
  completeProfile,
  logoutUser,
  usernameAvailable,
  optimizeProfileImage,
  registerPushToken,
  removePushToken,
};