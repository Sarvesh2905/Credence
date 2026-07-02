const express = require('express');
const router = express.Router();
const {
  getPassport,
  getStreak,
  getSubscriptions,
  purchaseSubscription,
  getDashboardData,
} = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');

router.get('/data', authMiddleware, getDashboardData);
router.get('/passport', authMiddleware, getPassport);
router.get('/streak', authMiddleware, getStreak);
router.get('/subscriptions', authMiddleware, getSubscriptions);
router.post('/subscriptions/purchase', authMiddleware, purchaseSubscription);

module.exports = router;
