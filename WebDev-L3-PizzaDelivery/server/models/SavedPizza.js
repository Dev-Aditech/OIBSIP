const mongoose = require('mongoose');

const savedPizzaSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    baseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    sauceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    cheeseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    veggieIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('SavedPizza', savedPizzaSchema);