const express = require('express');
const { createPayment, verifyPayment, mockConfirm } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', protect, createPayment);
router.post('/verify', protect, verifyPayment);
router.post('/mock-confirm', protect, mockConfirm);

module.exports = router;