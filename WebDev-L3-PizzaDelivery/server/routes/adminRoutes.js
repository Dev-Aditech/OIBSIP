const express = require('express');
const {
  getCustomers,
  suspendCustomer,
  unsuspendCustomer,
  deleteCustomer,
  getReports,
  getSettings,
  updateSettings,
  applyThreshold,
  sendTestEmail,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect, adminOnly);

router.get('/customers', getCustomers);
router.put('/customers/:id/suspend', suspendCustomer);
router.put('/customers/:id/unsuspend', unsuspendCustomer);
router.delete('/customers/:id', deleteCustomer);
router.get('/reports', getReports);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.post('/settings/apply-threshold', applyThreshold);
router.post('/settings/test-email', sendTestEmail);

module.exports = router;