const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { emailLayout, escapeHtml } = require('../utils/emailTemplate');
const { passwordMessage, normalizePhone } = require('../utils/validators');

const clientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';
const DAY = 24 * 60 * 60 * 1000;

async function sendVerificationEmail(user, token) {
  const url = `${clientUrl()}/verify-email/${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your SliceCraft email',
    html: emailLayout({
      title: 'Verify your email',
      preheader: 'One quick step before you can build your first pizza',
      content: `<p style="margin:0 0 12px;">Hi ${escapeHtml(user.name)},</p>
        <p style="margin:0 0 12px;">Welcome to SliceCraft! Confirm your email address to start building and ordering your own pizza.</p>
        <p style="margin:0;color:#78716c;font-size:13px;">This link is valid for 24 hours.</p>`,
      buttonText: 'Verify my email',
      buttonUrl: url,
    }),
  });
}

exports.register = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.toLowerCase().trim();
    const phone = normalizePhone(req.body.phone);
    const { password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!phone) {
      return res.status(400).json({ message: 'Enter a valid phone number' });
    }
    const passwordError = passwordMessage(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      name,
      email,
      phone,
      password: await bcrypt.hash(password, 10),
      verificationToken,
      verificationTokenExpires: Date.now() + DAY,
    });

    // The account exists even if the email fails, so the user can ask for a new one
    let emailSent = true;
    try {
      await sendVerificationEmail(user, verificationToken);
    } catch (err) {
      emailSent = false;
      console.error('Verification email failed:', err.message);
    }

    res.status(201).json({
      emailSent,
      message: emailSent
        ? 'Registered. Please verify your email.'
        : 'Registered, but the verification email could not be sent. Use "Resend verification email".',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid verification link' });
    }

    // Clicking the link twice (or an email scanner opening it) is not an error
    if (user.isVerified) {
      return res.json({ message: 'Your email is already verified. You can log in.' });
    }
    if (user.verificationTokenExpires < Date.now()) {
      return res.status(400).json({ message: 'This link has expired. Request a new verification email.' });
    }

    user.isVerified = true;
    await user.save();
    res.json({ message: 'Email verified. You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    // Same reply whether or not the email exists, so nobody can probe for registered emails
    const reply = { message: 'If that account exists and is not verified, a new link has been sent.' };

    const user = email ? await User.findOne({ email }) : null;
    if (!user || user.isVerified || user.role !== 'user') return res.json(reply);

    // At most one email per minute per account
    const lastSent = user.verificationTokenExpires ? user.verificationTokenExpires.getTime() - DAY : 0;
    if (Date.now() - lastSent < 60 * 1000) return res.json(reply);

    const token = crypto.randomBytes(32).toString('hex');
    user.verificationToken = token;
    user.verificationTokenExpires = Date.now() + DAY;
    await user.save();

    await sendVerificationEmail(user, token);
    res.json(reply);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not send the email. Please try again.' });
  }
};

exports.login = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });

    // Admins must use the separate admin login
    if (user && user.role === 'admin') {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Same message for wrong email or wrong password, so attackers can't tell which was wrong
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (user.suspendedUntil && user.suspendedUntil > new Date()) {
      return res.status(403).json({
        code: 'ACCOUNT_SUSPENDED',
        message: 'Your account is suspended',
        until: user.suspendedUntil,
        reason: user.suspensionReason,
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email, role: 'admin' });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email phone role isVerified createdAt');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const user = await User.findOne({ email });

    // Always reply the same way, so nobody can find out which emails are registered
    const reply = { message: 'If that email is registered, a reset link has been sent.' };
    if (!user) return res.json(reply);

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Reset your SliceCraft password',
      html: emailLayout({
        title: 'Reset your password',
        preheader: 'Use this link within the next hour',
        content: `<p style="margin:0 0 12px;">Hi ${escapeHtml(user.name)},</p>
          <p style="margin:0 0 12px;">We received a request to reset your password. Click the button below to choose a new one.</p>
          <p style="margin:0;color:#78716c;font-size:13px;">This link is valid for 1 hour. If you did not ask for this, you can safely ignore this email and your password will stay the same.</p>`,
        buttonText: 'Reset my password',
        buttonUrl: `${clientUrl()}/reset-password/${rawToken}`,
      }),
    });

    res.json(reply);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const passwordError = passwordMessage(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const phone = normalizePhone(req.body.phone);

    if (!name || name.length > 80) {
      return res.status(400).json({ message: 'Enter your name (80 characters at most)' });
    }
    if (!phone) {
      return res.status(400).json({ message: 'Enter a valid phone number' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Account not found' });

    user.name = name;
    user.phone = phone;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (typeof currentPassword !== 'string' || !currentPassword) {
      return res.status(400).json({ message: 'Enter your current password' });
    }
    const passwordError = passwordMessage(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Account not found' });

    // A wrong current password is a 400, not a 401, so the app does not log the person out
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ message: 'Your current password is incorrect' });
    }
    if (await bcrypt.compare(newPassword, user.password)) {
      return res.status(400).json({ message: 'The new password must be different from the current one' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};