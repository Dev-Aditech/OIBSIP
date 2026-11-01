export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'upper', label: 'One uppercase letter (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'One lowercase letter (a-z)', test: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number (0-9)', test: (p) => /\d/.test(p) },
  { id: 'special', label: 'One special character (! @ # $ ...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export const passwordIsValid = (p) => PASSWORD_RULES.every((rule) => rule.test(p));

// 7 to 15 digits, optional leading +, spaces, dashes and brackets allowed
export const isValidPhone = (value) => {
  const v = String(value ?? '').trim();
  const digits = v.replace(/\D/g, '');
  return /^\+?[\d\s()-]+$/.test(v) && digits.length >= 7 && digits.length <= 15;
};