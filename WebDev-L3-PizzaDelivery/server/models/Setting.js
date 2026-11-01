const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: { type: String, default: 'app', unique: true },
  alertEmail: { type: String, default: '' },
  lowStockEnabled: { type: Boolean, default: true },
  defaultThreshold: { type: Number, default: 20, min: 0 },
});

// One settings document for the whole app, created on first use
settingSchema.statics.get = function () {
  return this.findOneAndUpdate(
    { key: 'app' },
    { $setOnInsert: { key: 'app' } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

module.exports = mongoose.model('Setting', settingSchema);