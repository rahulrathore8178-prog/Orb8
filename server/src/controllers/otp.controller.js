const jwt = require('jsonwebtoken');
const OtpCode = require('../models/otpCode.model');
const User = require('../models/user.model'); // adjust path/name if different
const { generateOtp, hashOtp } = require('../utils/otp');
const { sendOtpEmail } = require('../utils/mailer');

function cookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

exports.sendOtp = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const existing = await OtpCode.findOne({ email });
    if (existing && existing.resendAfter > new Date()) {
      const waitSec = Math.ceil((existing.resendAfter.getTime() - Date.now()) / 1000);
      return res.status(429).json({ message: `Please wait ${waitSec}s before requesting another OTP` });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(email, otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    const resendAfter = new Date(Date.now() + 60 * 1000);   // 60 sec cooldown

    await OtpCode.findOneAndUpdate(
      { email },
      { otpHash, expiresAt, attempts: 0, resendAfter },
      { upsert: true, new: true }
    );

    await sendOtpEmail(email, otp, { expiresInMinutes: 5 });

    return res.status(200).json({ message: 'If the email exists, OTP has been sent.' });
  } catch (err) {
    console.error('[OTP] sendOtp error:', err.message);
    return res.status(500).json({ message: 'Failed to send OTP' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const otp = String(req.body.otp || '').trim();

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const doc = await OtpCode.findOne({ email });
    if (!doc) return res.status(400).json({ message: 'Invalid or expired OTP' });

    if (doc.expiresAt < new Date()) {
      await OtpCode.deleteOne({ _id: doc._id });
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (doc.attempts >= 5) {
      return res.status(429).json({ message: 'Too many invalid attempts. Request a new OTP.' });
    }

    const expectedHash = hashOtp(email, otp);
    if (expectedHash !== doc.otpHash) {
      doc.attempts += 1;
      await doc.save();
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP valid -> one-time use
    await OtpCode.deleteOne({ _id: doc._id });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        username: email.split('@')[0]
      });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, cookieOptions());

    return res.status(200).json({
      message: 'OTP verified successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (err) {
    console.error('[OTP] verifyOtp error:', err.message);
    return res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

exports.logout = async (_req, res) => {
  res.clearCookie('token', cookieOptions());
  return res.status(200).json({ message: 'Logged out' });
};