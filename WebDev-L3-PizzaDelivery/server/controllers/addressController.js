const mongoose = require('mongoose');
const Address = require('../models/Address');

const clean = (value, max) => String(value ?? '').trim().slice(0, max);

exports.getAddresses = async (req, res) => {
  try {
    res.json(await Address.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const label = clean(req.body.label, 30);
    const line = clean(req.body.line, 200);
    const city = clean(req.body.city, 80);
    const phone = clean(req.body.phone, 20);

    if (!label || !line || !city || !phone) {
      return res.status(400).json({ message: 'Please fill in every field' });
    }
    if (!/^\+?[\d\s-]{7,20}$/.test(phone)) {
      return res.status(400).json({ message: 'Enter a valid phone number' });
    }

    const count = await Address.countDocuments({ user: req.user.id });
    if (count >= 10) return res.status(400).json({ message: 'You can save up to 10 addresses' });

    const address = await Address.create({ user: req.user.id, label, line, city, phone, isDefault: count === 0 });
    res.status(201).json(address);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.setDefault = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid id' });
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!address) return res.status(404).json({ message: 'Address not found' });

    await Address.updateMany({ user: req.user.id }, { isDefault: false });
    address.isDefault = true;
    await address.save();
    res.json(address);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeAddress = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid id' });
    const removed = await Address.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!removed) return res.status(404).json({ message: 'Address not found' });

    // Keep one default address if any remain
    if (removed.isDefault) {
      const next = await Address.findOne({ user: req.user.id }).sort({ createdAt: -1 });
      if (next) {
        next.isDefault = true;
        await next.save();
      }
    }
    res.json({ message: 'Address removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};