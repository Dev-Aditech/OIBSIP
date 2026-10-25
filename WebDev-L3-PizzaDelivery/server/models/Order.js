const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    name: String,
    category: String,
    price: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    quantity: { type: Number, default: 1, min: 1, max: 10 },
    totalPrice: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status: {
      type: String,
      enum: ['Order Received', 'In Kitchen', 'Sent to Delivery'],
      default: 'Order Received',
    },
    stockDeducted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);