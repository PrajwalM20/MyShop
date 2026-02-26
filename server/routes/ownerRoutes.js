const express = require('express');
const router = express.Router();
const { getAllOrders, getOrderById, updateOrderStatus, getDashboardStats, exportOrders } = require('../controllers/ownerController');
const { protect, ownerOnly } = require('../middleware/authMiddleware');

router.use(protect, ownerOnly);

router.get('/dashboard', getDashboardStats);
router.get('/orders', getAllOrders);
router.get('/orders/export', exportOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;
