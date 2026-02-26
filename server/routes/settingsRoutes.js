const express = require('express');
const router = express.Router();
const { getPrices, updatePrices, getShopInfo, updateShopInfo } = require('../controllers/settingsController');
const { protect, ownerOnly } = require('../middleware/authMiddleware');

// Public
router.get('/prices', getPrices);
router.get('/shop-info', getShopInfo);

// Owner only
router.put('/prices', protect, ownerOnly, updatePrices);
router.put('/shop-info', protect, ownerOnly, updateShopInfo);

module.exports = router;
