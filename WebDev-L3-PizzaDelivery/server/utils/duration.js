// Turns "30 minutes", "2 hours" or "7 days" into milliseconds
const UNITS = {
  minutes: 60 * 1000,
  hours: 60 * 60 * 1000,
  days: 24 * 60 * 60 * 1000,
};
const MAX_MS = 365 * UNITS.days;

function parseDuration(amount, unit) {
  if (typeof unit !== 'string' || !Object.prototype.hasOwnProperty.call(UNITS, unit)) {
    return { error: 'Choose minutes, hours or days' };
  }
  const n = Number(amount);
  if (!Number.isInteger(n) || n < 1) {
    return { error: 'Enter a whole number of 1 or more' };
  }
  const ms = n * UNITS[unit];
  if (ms > MAX_MS) {
    return { error: 'The longest suspension is 365 days' };
  }
  return { ms };
}

module.exports = { parseDuration };