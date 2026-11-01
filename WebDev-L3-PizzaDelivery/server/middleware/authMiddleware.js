const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getCached, setCached } = require('../utils/authCache');

// Checks the login token AND the account itself, so a deleted or suspended person is locked out
// straight away (not when their token expires). The account check is cached for a few seconds.
exports.protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  let payload;
  try {
    payload = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  try {
    let account = getCached(payload.id);

    if (!account) {
      const user = await User.findById(payload.id).select('role suspendedUntil suspensionReason').lean();
      if (!user) {
        return res.status(401).json({ code: 'ACCOUNT_DELETED', message: 'This account no longer exists' });
      }
      account = {
        role: user.role,
        suspendedUntil: user.suspendedUntil ? new Date(user.suspendedUntil).getTime() : 0,
        reason: user.suspensionReason,
      };
      setCached(payload.id, account);
    }

    // Compared with the clock every time, so a suspension ends on schedule even while cached
    if (account.suspendedUntil > Date.now()) {
      return res.status(403).json({
        code: 'ACCOUNT_SUSPENDED',
        message: 'Your account is suspended',
        until: new Date(account.suspendedUntil),
        reason: account.reason,
      });
    }

    // The role comes from the database, so changes to it apply within seconds
    req.user = { id: String(payload.id), role: account.role };
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
};