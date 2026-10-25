const express = require('express');
const {
  getSummary,
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/summary', protect, getSummary);
router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.get('/:id', protect, getOrderById);

module.exports = router;