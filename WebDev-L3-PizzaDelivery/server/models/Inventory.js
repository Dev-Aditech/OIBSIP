const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: ['base', 'sauce', 'cheese', 'veggie'], required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    threshold: { type: Number, default: 20, min: 0 },
    lowStockAlertSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

inventorySchema.index({ name: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);