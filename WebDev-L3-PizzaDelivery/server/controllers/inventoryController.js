const Inventory = require('../models/Inventory');

// For customers building a pizza: only items in stock, no internal fields
exports.getMenuItems = async (req, res) => {
  try {
    const items = await Inventory.find({ quantity: { $gt: 0 } })
      .select('name category price')
      .sort({ category: 1, name: 1 });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// For admin: everything, including stock and thresholds
exports.getAllInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ category: 1, name: 1 });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: manually update stock, threshold or price
exports.updateInventory = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    for (const field of ['quantity', 'threshold', 'price']) {
      if (req.body[field] !== undefined) {
        const value = Number(req.body[field]);
        if (Number.isNaN(value) || value < 0) {
          return res.status(400).json({ message: `${field} must be a number, 0 or more` });
        }
        item[field] = value;
      }
    }

    // Stock is healthy again, so allow future low-stock alerts
    if (item.quantity >= item.threshold) item.lowStockAlertSent = false;

    await item.save();
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};