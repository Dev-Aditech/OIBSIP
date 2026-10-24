require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Inventory = require('./models/Inventory');

const items = [
  // Bases (5)
  { name: 'Thin Crust', category: 'base', price: 150 },
  { name: 'Classic Hand-Tossed', category: 'base', price: 180 },
  { name: 'Cheese Burst', category: 'base', price: 250 },
  { name: 'Whole Wheat', category: 'base', price: 200 },
  { name: 'Gluten-Free', category: 'base', price: 280 },
  // Sauces (5)
  { name: 'Tomato Marinara', category: 'sauce', price: 30 },
  { name: 'Pesto', category: 'sauce', price: 50 },
  { name: 'BBQ', category: 'sauce', price: 40 },
  { name: 'White Garlic', category: 'sauce', price: 45 },
  { name: 'Spicy Arrabbiata', category: 'sauce', price: 40 },
  // Cheeses
  { name: 'Mozzarella', category: 'cheese', price: 60 },
  { name: 'Cheddar', category: 'cheese', price: 70 },
  { name: 'Gouda', category: 'cheese', price: 80 },
  { name: 'Parmesan', category: 'cheese', price: 90 },
  // Vegetables
  { name: 'Onion', category: 'veggie', price: 20 },
  { name: 'Capsicum', category: 'veggie', price: 25 },
  { name: 'Mushroom', category: 'veggie', price: 35 },
  { name: 'Tomato', category: 'veggie', price: 20 },
  { name: 'Sweet Corn', category: 'veggie', price: 25 },
  { name: 'Black Olives', category: 'veggie', price: 35 },
  { name: 'Jalapeno', category: 'veggie', price: 30 },
  { name: 'Spinach', category: 'veggie', price: 25 },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Inventory: only inserts items that don't exist yet, so re-running never resets your stock
  for (const item of items) {
    await Inventory.updateOne(
      { name: item.name, category: item.category },
      { $setOnInsert: { ...item, quantity: 100, threshold: 20 } },
      { upsert: true }
    );
  }
  console.log(`Inventory ready (${items.length} items)`);

  // Admin account
  const email = process.env.ADMIN_EMAIL.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists');
  } else {
    await User.create({
      name: process.env.ADMIN_NAME || 'Admin',
      email,
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
      role: 'admin',
      isVerified: true,
    });
    console.log('Admin created');
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});