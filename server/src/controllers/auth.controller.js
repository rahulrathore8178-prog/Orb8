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

const PROFILE_PICS_DIR = path.join(__dirname, '..', '..', 'uploads', 'profile-pics');
const MAX_PROCESSED_IMAGE_BYTES = 450 * 1024;

function buildStoredImagePath(fileName) {
  return `/uploads/profile-pics/${fileName}`;
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
    notifications: (user.notifications || []).slice(-10).reverse(),
    friends: user.friends || [],
    friendRequests: user.friendRequests || [],
    preferences: user.preferences || [],
  };
}

function signToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

async function registerUser(req, res) {
  const { username, email, password } = req.body;

  try {
    const isUserAlreadyExist = await userModel.findOne({ $or: [{ username }, { email }] });
    if (isUserAlreadyExist) {
      return res.status(409).json({ message: 'Username or email already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
      notifications: [
        {
          title: 'Welcome to Orb8',
          detail: 'Your feed is ready.'
        }
      ]
    });

    const token = signToken(user._id);
    res.cookie('token', token, getCookieOptions());

    return res.status(201).json({
      message: 'Registration successful.',
      token,
      user: buildUserPayload(user)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function loginUser(req, res) {
  try {
    const { emailOrUsername, password } = req.body;
    const user = await userModel.findOne({
      $or: [
        { username: emailOrUsername },
        { email: emailOrUsername }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = signToken(user._id);
    res.cookie('token', token, getCookieOptions());

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: buildUserPayload(user)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
      return res.status(400).json({ message: 'No image file uploaded. Use field name "image".' });
    }

    await fs.mkdir(PROFILE_PICS_DIR, { recursive: true });

    const qualitySteps = [78, 70, 62, 55, 48];
    let optimizedBuffer = null;

    for (const quality of qualitySteps) {
      const candidate = await sharp(req.file.buffer)
        .rotate()
        .resize({
          width: 640,
          height: 640,
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality })
        .toBuffer();

      optimizedBuffer = candidate;
      if (candidate.length <= MAX_PROCESSED_IMAGE_BYTES) {
        break;
      }
    }

    if (!optimizedBuffer || optimizedBuffer.length > 1024 * 1024) {
      return res.status(413).json({
        message: 'Image is still too large after compression. Please upload a simpler image.'
      });
    }

    const fileName = `${req.user.id}-${Date.now()}.webp`;
    const absoluteFilePath = path.join(PROFILE_PICS_DIR, fileName);
    await fs.writeFile(absoluteFilePath, optimizedBuffer);

    const existingUser = await userModel.findById(req.user.id).select('profilePic');
    const previousUploadedFile = getUploadedProfileImageFilePath(existingUser?.profilePic);

    const { publicUrl } = await uploadBufferToDrive(
      optimizedBuffer,
      fileName,
      'image/webp'
    );

    await userModel.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          profilePic: publicUrl
        }
      }
    );

    if (previousUploadedFile && previousUploadedFile !== absoluteFilePath) {
      await fs.unlink(previousUploadedFile).catch(() => { });
    }

    return res.status(200).json({
      message: 'Profile image uploaded successfully.',
      user: buildUserPayload(updatedUser),
      imageSizeBytes: optimizedBuffer.length,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getNotifications(req, res) {
  try {
    const user = await userModel.findById(req.user.id).select('notifications');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const notifications = (user.notifications || []).slice(-20).reverse();
    return res.status(200).json({ notifications });
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
      notifications: (user.notifications || []).slice(-20).reverse()
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
      .select('username profilePic bio totalXp level league streakCount badges friends')
      .populate('badges.badge')
      .populate('friends', 'username profilePic');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Relationship between the logged-in user and the profile being viewed
    const me = req.user.id.toString();
    const them = userId.toString();

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
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const user = await userModel.findOne({ email: email.toLowerCase().trim() });
    // Always return success to prevent email enumeration
    if (!user) {
      console.log(`[AUTH] Forgot password attempt for non-existent email: ${email}`);
      return res.status(200).json({ message: 'If that email exists, an OTP has been sent.' });
    }

    // 6-digit cryptographically-random OTP; store only its SHA-256 digest
    const otp = String(crypto.randomInt(100000, 1000000));
    user.resetToken = crypto.createHash('sha256').update(otp).digest('hex');
    user.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    user.resetOtpAttempts = 0;
    await user.save();

    console.log(`[AUTH] Password reset requested for ${email}. OTP: ${otp}`);

    // Send the OTP via email when SMTP is configured; never fail the request on email errors.
    let emailSent = false;
    try {
      const result = await sendOtpEmail(user.email, otp);
      emailSent = result.sent;
      if (emailSent) {
        console.log(`[AUTH] OTP email sent successfully to ${email}`);
      } else {
        console.warn(`[AUTH] Email provider not configured. Showing OTP in response for development.`);
      }
    } catch (mailError) {
      console.error(`[AUTH] Error sending reset OTP to ${email}:`, mailError.message);
    }

    return res.status(200).json({
      message: 'If that email exists, an OTP has been sent.',
      // Only expose the OTP in the response outside production (so dev works without SMTP).
      // This allows testing without email configuration.
      otp: process.env.NODE_ENV !== 'production' && !emailSent ? otp : undefined
    });
  } catch (error) {
    console.error('[AUTH] Forgot password error:', error);
    return res.status(500).json({ message: error.message });
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


const completeProfile = async (req, res) => {
  console.log('[AUTH] completeProfile hit', req.body);
  try {
    const { username, password } = req.body;

    if (!username || username.trim().length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const taken = await userModel.findOne({ username: username.trim(), _id: { $ne: req.user.id } });
    if (taken) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.username = username.trim();
    user.password = await bcrypt.hash(password, 10);
    user.needsProfileCompletion = false;
    await user.save();

    return res.status(200).json({
      message: 'Profile completed',
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error('Complete profile error:', err);
    return res.status(500).json({ message: err.message });
  }
};

async function logoutUser(req, res) {
  res.clearCookie('token', getCookieOptions());
  return res.status(200).json({ message: 'Logout successful' });
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  getPublicProfile,
  updateProfile,
  uploadProfileImage,
  getNotifications,
  markNotificationRead,
  updateStreak,
  claimReward,
  forgotPassword,
  resetPassword,
  completeProfile,
  logoutUser,
};