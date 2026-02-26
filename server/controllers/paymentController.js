const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @POST /api/payment/create-order
const createPaymentOrder = async (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body;

  const options = {
    amount: amount * 100, // paise
    currency,
    receipt: receipt || `rcpt_${Date.now()}`,
    payment_capture: 1,
    notes: { source: 'ClickQueue' },
  };

  try {
    const order = await razorpay.orders.create(options);
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

  res.json({ success: true, paymentId: razorpay_payment_id, message: 'Payment verified!' });
};

// @POST /api/payment/webhook  (Razorpay webhook for auto status updates)
const handleWebhook = async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);

  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(body);
  const digest = hmac.digest('hex');

  if (digest !== signature) return res.status(400).json({ message: 'Invalid webhook signature' });

  const event = req.body.event;

  if (event === 'payment.captured') {
    const paymentId = req.body.payload.payment.entity.id;
    const orderId = req.body.payload.payment.entity.order_id;

    await Order.findOneAndUpdate(
      { razorpayOrderId: orderId },
      { paymentStatus: 'paid', paymentId }
    );
  }

  res.json({ received: true });
};

module.exports = { createPaymentOrder, verifyPayment, handleWebhook };
