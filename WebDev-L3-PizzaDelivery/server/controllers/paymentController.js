const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const { checkLowStock } = require('../utils/lowStockJob');

// Real Razorpay is used only when both keys exist in .env. Otherwise: mock mode.
const useRazorpay = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

async function getOwnOrder(orderId, userId) {
  if (!mongoose.isValidObjectId(orderId)) return null;
  return Order.findOne({ _id: orderId, user: userId });
}

// Marks the order paid and deducts stock. Safe against double-clicks and repeat calls.
async function completePayment(orderId, paymentId) {
  // Only one request can flip pending -> paid, so stock is never deducted twice
  const order = await Order.findOneAndUpdate(
    { _id: orderId, paymentStatus: 'pending' },
    { paymentStatus: 'paid', razorpayPaymentId: paymentId },
    { new: true }
  );
  if (!order) {
    return { ok: false, code: 409, message: 'This order is not awaiting payment' };
  }

  const deducted = [];
  for (const item of order.items) {
    // Only deducts if enough stock is still there
    const result = await Inventory.updateOne(
      { _id: item.inventoryId, quantity: { $gte: order.quantity } },
      { $inc: { quantity: -order.quantity } }
    );

    if (result.modifiedCount === 0) {
      // Put back what we already took, then fail the order
      for (const id of deducted) {
        await Inventory.updateOne({ _id: id }, { $inc: { quantity: order.quantity } });
      }
      order.paymentStatus = 'failed';
      await order.save();
      return {
        ok: false,
        code: 409,
        message: `${item.name} just ran out of stock. Your payment was not completed.`,
      };
    }
    deducted.push(item.inventoryId);
  }

  order.stockDeducted = true;
  await order.save();

  // Check straight away whether this order pushed any item below its threshold
  checkLowStock().catch((err) => console.error('Low stock check failed:', err.message));

  return { ok: true, order };
}

// Step 1 of payment: prepare it
exports.createPayment = async (req, res) => {
  try {
    const order = await getOwnOrder(req.body.orderId, req.user.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.paymentStatus !== 'pending') {
      return res.status(409).json({ message: 'This order is not awaiting payment' });
    }

    if (useRazorpay()) {
      const Razorpay = require('razorpay');
      const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      const rzpOrder = await instance.orders.create({
        amount: Math.round(order.totalPrice * 100), // Razorpay wants the smallest unit (paise)
        currency: 'INR',
        receipt: order._id.toString(),
      });
      order.razorpayOrderId = rzpOrder.id;
      await order.save();

      return res.json({
        mode: 'razorpay',
        keyId: process.env.RAZORPAY_KEY_ID,
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        orderId: order._id,
      });
    }

    // Mock mode
    order.razorpayOrderId = `mock_order_${crypto.randomBytes(8).toString('hex')}`;
    await order.save();
    res.json({
      mode: 'mock',
      razorpayOrderId: order.razorpayOrderId,
      amount: Math.round(order.totalPrice * 100),
      currency: 'INR',
      orderId: order._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not start payment' });
  }
};

// Step 2 (real Razorpay): check the signature Razorpay sends after payment
exports.verifyPayment = async (req, res) => {
  try {
    if (!useRazorpay()) {
      return res.status(400).json({ message: 'Razorpay is not configured' });
    }

    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const order = await getOwnOrder(orderId, req.user.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment details' });
    }
    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ message: 'Payment does not match this order' });
    }

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const valid =
      expected.length === razorpay_signature.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));
    if (!valid) return res.status(400).json({ message: 'Payment verification failed' });

    const result = await completePayment(order._id, razorpay_payment_id);
    if (!result.ok) return res.status(result.code).json({ message: result.message });
    res.json({ message: 'Payment successful', order: result.order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Step 2 (mock mode): the fake "Success" / "Fail" buttons
exports.mockConfirm = async (req, res) => {
  try {
    if (useRazorpay()) {
      return res.status(400).json({ message: 'Mock payments are disabled when Razorpay is configured' });
    }

    const order = await getOwnOrder(req.body.orderId, req.user.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (req.body.success === false) {
      if (order.paymentStatus !== 'pending') {
        return res.status(409).json({ message: 'This order is not awaiting payment' });
      }
      order.paymentStatus = 'failed';
      await order.save();
      return res.json({ message: 'Payment failed', order });
    }

    const paymentId = `mock_pay_${crypto.randomBytes(8).toString('hex')}`;
    const result = await completePayment(order._id, paymentId);
    if (!result.ok) return res.status(result.code).json({ message: result.message });
    res.json({ message: 'Payment successful', order: result.order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};