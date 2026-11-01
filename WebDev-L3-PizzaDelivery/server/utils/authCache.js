// Remembers each person's account status for a short time, so most requests do not need a database lookup.
// Admin actions (suspend, unsuspend, delete) clear the entry at once, so they still take effect immediately.
const TTL = 30 * 1000;
const entries = new Map();

exports.getCached = (id) => {
  const entry = entries.get(String(id));
  if (!entry) return null;
  if (entry.expires < Date.now()) {
    entries.delete(String(id));
    return null;
  }
  return entry.value;
};

exports.setCached = (id, value) => {
  if (entries.size > 5000) entries.clear(); // keeps memory small
  entries.set(String(id), { value, expires: Date.now() + TTL });
};

exports.invalidateUser = (id) => {
  entries.delete(String(id));
};