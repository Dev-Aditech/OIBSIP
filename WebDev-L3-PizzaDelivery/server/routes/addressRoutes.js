const express = require('express');
const { getAddresses, addAddress, setDefault, removeAddress } = require('../controllers/addressController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

router.get('/', getAddresses);
router.post('/', addAddress);
router.put('/:id/default', setDefault);
router.delete('/:id', removeAddress);

module.exports = router;