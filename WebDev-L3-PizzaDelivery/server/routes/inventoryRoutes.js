const express = require('express');
const {
  getMenuItems,
  getAllInventory,
  updateInventory,
} = require('../controllers/inventoryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getMenuItems);
router.get('/admin', protect, adminOnly, getAllInventory);
router.put('/:id', protect, adminOnly, updateInventory);

module.exports = router;