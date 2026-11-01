// Shared input rules. The browser shows the same rules, but the server is the one that enforces them.

// Returns an error message, or null when the password is acceptable
function passwordMessage(password) {
  if (typeof password !== 'string' || !password) return 'Password is required';

  const missing = [];
  if (password.length < 8) missing.push('at least 8 characters');
  if (!/[A-Z]/.test(password)) missing.push('an uppercase letter');
  if (!/[a-z]/.test(password)) missing.push('a lowercase letter');
  if (!/\d/.test(password)) missing.push('a number');
  if (!/[^A-Za-z0-9]/.test(password)) missing.push('a special character');
  if (missing.length) return `Password needs ${missing.join(', ')}`;

  // bcrypt only reads the first 72 bytes
  if (Buffer.byteLength(password) > 72) return 'Password is too long (72 bytes at most)';
  return null;
}

// Returns the cleaned phone number, or null when it is not valid
function normalizePhone(phone) {
  if (typeof phone !== 'string') return null;
  const value = phone.trim();
  const digits = value.replace(/\D/g, '');
  if (!/^\+?[\d\s()-]+$/.test(value) || digits.length < 7 || digits.length > 15) return null;
  return value;
}

module.exports = { passwordMessage, normalizePhone };