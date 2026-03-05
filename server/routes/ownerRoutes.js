const express = require('express');
const router = express.Router();
const {
  getAllOrders, getOrderById, updateOrderStatus, updateOrder,
  deleteOrder, bulkDeleteOrders, clearOrdersByStatus,
  getCustomers, getDashboardStats, exportOrders,
} = require('../controllers/ownerController');
const { protect, ownerOnly } = require('../middleware/authMiddleware');

router.use(protect, ownerOnly);

router.get('/dashboard', getDashboardStats);
router.get('/orders/export', exportOrders);
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id', updateOrder);
router.delete('/orders/bulk', bulkDeleteOrders);
router.delete('/orders/clear/:status', clearOrdersByStatus);
router.delete('/orders/:id', deleteOrder);
router.get('/customers', getCustomers);

module.exports = router;