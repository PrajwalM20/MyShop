const crypto = require('crypto');
const Order = require('../models/Order');

// @POST /api/payment/create-order
const createPaymentOrder = async (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'your_razorpay_key_id') {
    return res.status(503).json({ message: 'Payment gateway not configured yet' });
  }
  try {
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const { amount, currency = 'INR', receipt } = req.body;
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1,
    });
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ message: 'Payment order creation failed', error: err.message });
  }
};

// @POST /api/payment/verify
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = hmac.digest('hex');
  if (digest !== razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }
  res.json({ success: true, paymentId: razorpay_payment_id });
};

// @POST /api/payment/webhook
const handleWebhook = async (req, res) => {
  res.json({ received: true });
};

module.exports = { createPaymentOrder, verifyPayment, handleWebhook };