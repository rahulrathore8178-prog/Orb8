const nodemailer = require('nodemailer');
const { Resend } = require('resend');

let cachedTransporter = null;

/**
 * Returns true when an email provider is configured via environment variables.
 * Provider priority:
 * 1) Resend API
 * 2) Brevo HTTP API
 * 3) Mailtrap sending API
 * 4) SMTP OAuth2 (Gmail/Google Workspace)
 * 5) SMTP user/pass
 */
function isMailConfigured() {
  const smtpOauthConfigured = Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN
  );

  const smtpPasswordConfigured = Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );

  const configured = Boolean(
    process.env.RESEND_API_KEY ||
      process.env.BREVO_API_KEY ||
      process.env.MAILTRAP_TOKEN ||
      smtpOauthConfigured ||
      smtpPasswordConfigured
  );

  if (configured) {
    let providerInfo = '';
    if (process.env.RESEND_API_KEY) providerInfo = 'Resend API';
    else if (process.env.BREVO_API_KEY) providerInfo = 'Brevo API';
    else if (process.env.MAILTRAP_TOKEN) providerInfo = 'Mailtrap API';
    else if (smtpOauthConfigured) providerInfo = `SMTP OAuth2 (${process.env.SMTP_USER})`;
    else if (smtpPasswordConfigured) providerInfo = `SMTP Password (${process.env.SMTP_USER})`;
    
    console.log(`[MAIL] ✓ Email provider configured: ${providerInfo}`);
  } else {
    console.warn('[MAIL] ✗ No email provider configured. Password resets will not send emails.');
  }

  return configured;
}

/**
 * Resolves sender identity from environment.
 */
function getSender() {
  return {
    name: process.env.MAIL_FROM_NAME || 'Orb8',
    address:
      process.env.MAIL_FROM_ADDRESS ||
      process.env.SMTP_FROM ||
      process.env.SMTP_USER ||
      'onboarding@resend.dev'
  };
}

/**
 * OTP email content.
 */
function buildOtpMessage(otp, expiresInMinutes = 10) {
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0f1419;border-radius:16px;color:#e5e7eb">
      <h2 style="margin:0 0 8px;color:#22d3ee">Orb8 verification code</h2>
      <p style="margin:0 0 18px;color:#9ca3af;font-size:14px">Use the one-time code below. It expires in ${expiresInMinutes} minutes.</p>
      <div style="font-size:32px;font-weight:800;letter-spacing:10px;text-align:center;padding:16px;background:#1a2332;border:1px solid #2a3a4a;border-radius:12px;color:#fff">${otp}</div>
      <p style="margin:18px 0 0;color:#6b7280;font-size:12px">If you didn't request this, you can safely ignore this email.</p>
    </div>`;
  return {
    subject: 'Your Orb8 verification code',
    text: `Your Orb8 verification code is ${otp}. It expires in ${expiresInMinutes} minutes.`,
    html
  };
}

async function sendViaResend(to, message) {
  const sender = {
    name: process.env.MAIL_FROM_NAME || 'Orb8',
    address: process.env.MAIL_FROM_ADDRESS || 'onboarding@resend.dev',
  };
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: `${sender.name} <${sender.address}>`,
    to: [to],
    subject: message.subject,
    text: message.text,
    html: message.html,
  });

  if (error) {
    console.error('[MAIL] Resend rejected the OTP email:', error.name || 'provider error');
    throw new Error('Resend email delivery failed');
  }

  return { sent: true, provider: 'resend', id: data?.id };
}

/**
 * Brevo via HTTPS API (port 443-friendly for Render/Vercel).
 */
async function sendViaBrevo(to, message) {
  const sender = getSender();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    console.log('[MAIL] Sending OTP email via Brevo API');
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify({
        sender: { email: sender.address, name: sender.name },
        to: [{ email: to }],
        subject: message.subject,
        textContent: message.text,
        htmlContent: message.html
      }),
      signal: controller.signal
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Brevo API ${res.status}: ${detail}`);
    }

    console.log('[MAIL] OTP email sent via Brevo API');
    return { sent: true, provider: 'brevo' };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Creates/caches nodemailer transporter.
 */
function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  // Mailtrap API transport
  if (process.env.MAILTRAP_TOKEN) {
    console.log('[MAIL] Using Mailtrap API transport');
    const { MailtrapTransport } = require('mailtrap');
    cachedTransporter = nodemailer.createTransport(
      MailtrapTransport({ token: process.env.MAILTRAP_TOKEN })
    );
    return cachedTransporter;
  }

  // SMTP OAuth2 (Gmail/Workspace)
  const hasSmtpOauth =
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN;

  if (hasSmtpOauth) {
    console.log(`[MAIL] Using SMTP OAuth2 transport for ${process.env.SMTP_USER} (Gmail/Workspace)`);
    const port = Number(process.env.SMTP_PORT) || 587;
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        type: 'OAuth2',
        user: process.env.SMTP_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN
      }
    });
    return cachedTransporter;
  }

  // SMTP user/pass fallback
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log(`[MAIL] Using SMTP password transport for ${process.env.SMTP_USER}`);
    const port = Number(process.env.SMTP_PORT) || 587;
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    return cachedTransporter;
  }

  console.warn('[MAIL] No email transporter configured (Mailtrap or SMTP)');
  return null;
}

/**
 * Sends password-reset OTP email.
 */
async function sendOtpEmail(to, otp, { expiresInMinutes = 10 } = {}) {
  const message = buildOtpMessage(otp, expiresInMinutes);

  if (process.env.RESEND_API_KEY) {
    return sendViaResend(to, message);
  }

  // Brevo remains available as a fallback provider.
  if (process.env.BREVO_API_KEY) {
    console.log('[MAIL] Email provider: Brevo HTTP API');
    return sendViaBrevo(to, message);
  }

  // 2/3/4) Mailtrap or SMTP OAuth2 or SMTP pass
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[MAIL] Email provider: NONE (email sending disabled)');
    return { sent: false, provider: 'none' };
  }

  const sender = getSender();
  await transporter.sendMail({
    from: { address: sender.address, name: sender.name },
    to,
    subject: message.subject,
    text: message.text,
    html: message.html,
    category: 'Password Reset'
  });

  const provider = process.env.MAILTRAP_TOKEN
    ? 'mailtrap'
    : process.env.GOOGLE_REFRESH_TOKEN
    ? 'smtp-oauth2'
    : 'smtp-password';

  console.log(`[MAIL] Email sent via ${provider}`);
  return { sent: true, provider };
}

module.exports = { sendOtpEmail, isMailConfigured };