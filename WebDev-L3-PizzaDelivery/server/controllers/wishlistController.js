const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');
const SavedPizza = require('../models/SavedPizza');

exports.getWishlist = async (req, res) => {
  try {
    const pizzas = await SavedPizza.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();
    const ids = pizzas.flatMap((p) => [p.baseId, p.sauceId, p.cheeseId, ...p.veggieIds]);
    const found = await Inventory.find({ _id: { $in: ids } }).select('name category price quantity').lean();
    const byId = new Map(found.map((i) => [String(i._id), i]));

    res.json(
      pizzas.map((p) => {
        const wanted = [p.baseId, p.sauceId, p.cheeseId, ...p.veggieIds];
        const parts = wanted.map((id) => byId.get(String(id))).filter(Boolean);
        return {
          _id: p._id,
          name: p.name,
          baseId: p.baseId,
          sauceId: p.sauceId,
          cheeseId: p.cheeseId,
          veggieIds: p.veggieIds,
          items: parts.map((i) => ({ _id: i._id, name: i.name, category: i.category, price: i.price })),
          unitPrice: parts.reduce((sum, i) => sum + i.price, 0),
          available: parts.length === wanted.length && parts.every((i) => i.quantity > 0),
        };
      })
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const name = String(req.body.name || 'My custom pizza').trim().slice(0, 60) || 'My custom pizza';
    const { baseId, sauceId, cheeseId } = req.body;
    const rawVeggies = req.body.veggieIds ?? [];
    if (!Array.isArray(rawVeggies)) return res.status(400).json({ message: 'veggieIds must be a list' });

    const veggieIds = [...new Set(rawVeggies)];
    const all = [baseId, sauceId, cheeseId, ...veggieIds];
    if (!baseId || !sauceId || !cheeseId || !all.every((id) => mongoose.isValidObjectId(id))) {
      return res.status(400).json({ message: 'Choose a base, a sauce and a cheese' });
    }

    const found = await Inventory.find({ _id: { $in: all } }).select('category');
    const category = new Map(found.map((i) => [String(i._id), i.category]));
    const valid =
      category.get(String(baseId)) === 'base' &&
      category.get(String(sauceId)) === 'sauce' &&
      category.get(String(cheeseId)) === 'cheese' &&
      veggieIds.every((id) => category.get(String(id)) === 'veggie');
    if (!valid) return res.status(400).json({ message: 'Invalid ingredient choice' });

    if ((await SavedPizza.countDocuments({ user: req.user.id })) >= 20) {
      return res.status(400).json({ message: 'Your wishlist is full (20 pizzas). Remove one first.' });
    }

    const saved = await SavedPizza.create({ user: req.user.id, name, baseId, sauceId, cheeseId, veggieIds });
    res.status(201).json({ _id: saved._id, name: saved.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid id' });
    const result = await SavedPizza.deleteOne({ _id: req.params.id, user: req.user.id });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};