const express = require('express');
const router = express.Router();
const { createPaymentOrder, verifyPayment, handleWebhook } = require('../controllers/paymentController');

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
