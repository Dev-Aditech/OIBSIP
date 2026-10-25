const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function handleError(res, err) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }
  console.error(err);
  res.status(500).json({ message: 'Server error' });
}

// Validates the chosen ingredients and works out the price
async function buildPizza(body) {
  const { baseId, sauceId, cheeseId } = body;
  const veggieIds = body.veggieIds ?? [];
  const quantity = Number(body.quantity ?? 1);

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    throw new HttpError(400, 'Quantity must be a whole number from 1 to 10');
  }
  if (!baseId || !sauceId || !cheeseId) {
    throw new HttpError(400, 'Please choose a base, a sauce and a cheese');
  }
  if (!Array.isArray(veggieIds)) {
    throw new HttpError(400, 'veggieIds must be a list');
  }

  const uniqueVeggies = [...new Set(veggieIds)];
  const allIds = [baseId, sauceId, cheeseId, ...uniqueVeggies];
  if (!allIds.every((id) => mongoose.isValidObjectId(id))) {
    throw new HttpError(400, 'One or more ingredient ids are invalid');
  }

  const found = await Inventory.find({ _id: { $in: allIds } });
  const byId = new Map(found.map((item) => [item._id.toString(), item]));

  const pick = (id, category, label) => {
    const item = byId.get(String(id));
    if (!item || item.category !== category) {
      throw new HttpError(400, `Invalid ${label} choice`);
    }
    return item;
  };

  const chosen = [
    pick(baseId, 'base', 'base'),
    pick(sauceId, 'sauce', 'sauce'),
    pick(cheeseId, 'cheese', 'cheese'),
    ...uniqueVeggies.map((id) => pick(id, 'veggie', 'vegetable')),
  ];

  for (const item of chosen) {
    if (item.quantity < quantity) {
      throw new HttpError(400, `${item.name} is out of stock`);
    }
  }

  const unitPrice = chosen.reduce((sum, item) => sum + item.price, 0);
  return {
    items: chosen.map((i) => ({
      inventoryId: i._id,
      name: i.name,
      category: i.category,
      price: i.price,
    })),
    quantity,
    unitPrice,
    totalPrice: unitPrice * quantity,
  };
}

// Order summary page: shows the price, saves nothing
exports.getSummary = async (req, res) => {
  try {
    const pizza = await buildPizza(req.body);
    res.json(pizza);
  } catch (err) {
    handleError(res, err);
  }
};

// Creates the order. It stays "pending" until payment is confirmed.
exports.createOrder = async (req, res) => {
  try {
    const pizza = await buildPizza(req.body);
    const order = await Order.create({
      user: req.user.id,
      items: pizza.items,
      quantity: pizza.quantity,
      totalPrice: pizza.totalPrice,
    });
    res.status(201).json(order);
  } catch (err) {
    handleError(res, err);
  }
};

// Customer: their own orders, newest first
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    handleError(res, err);
  }
};

// Customer: one of their own orders (the dashboard will poll this for status)
exports.getOrderById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new HttpError(400, 'Invalid order id');
    }
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) throw new HttpError(404, 'Order not found');
    res.json(order);
  } catch (err) {
    handleError(res, err);
  }
};

// Admin: all paid orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ paymentStatus: 'paid' })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    handleError(res, err);
  }
};

// Admin: move an order through Order Received → In Kitchen → Sent to Delivery
exports.updateOrderStatus = async (req, res) => {
  try {
    const allowed = ['Order Received', 'In Kitchen', 'Sent to Delivery'];
    if (!allowed.includes(req.body.status)) {
      throw new HttpError(400, `Status must be one of: ${allowed.join(', ')}`);
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new HttpError(400, 'Invalid order id');
    }

    const order = await Order.findById(req.params.id);
    if (!order) throw new HttpError(404, 'Order not found');
    if (order.paymentStatus !== 'paid') {
      throw new HttpError(400, 'Only paid orders can change status');
    }

    order.status = req.body.status;
    await order.save();
    res.json(order);
  } catch (err) {
    handleError(res, err);
  }
};