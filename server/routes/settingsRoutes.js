const express = require('express');
const router = express.Router();
const { getServices, updateServices, getPrices, updatePrices, getShopInfo, updateShopInfo } = require('../controllers/settingsController');
const { protect, ownerOnly } = require('../middleware/authMiddleware');

router.get('/services',   getServices);
router.get('/prices',     getPrices);
router.get('/shop-info',  getShopInfo);

router.put('/services',   protect, ownerOnly, updateServices);
router.put('/prices',     protect, ownerOnly, updatePrices);
router.put('/shop-info',  protect, ownerOnly, updateShopInfo);

module.exports = router;