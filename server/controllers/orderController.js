const Order = require('../models/Order');
const { uploadToCloudinary } = require('../config/cloudinary');
const { Settings, DEFAULT_SERVICES } = require('./settingsController');
const {
  sendOrderConfirmationEmail, sendOwnerNotificationEmail,
  sendOrderConfirmationSMS, sendOrderConfirmationWhatsApp,
} = require('../config/notifications');

// Helper — fetch live services from DB
const getLiveServices = async () => {
  try {
    const s = await Settings.findOne({ key: 'services' });
    return s ? s.value : DEFAULT_SERVICES;
  } catch { return DEFAULT_SERVICES; }
};

// @GET /api/orders/services  (public)
const getServices = async (req, res) => {
  const services = await getLiveServices();
  res.json(services);
};

// @POST /api/orders/create
const createOrder = async (req, res) => {
  const { name, email, phone, notes, razorpayPaymentId, razorpayOrderId, items: itemsJson } = req.body;
  const files = req.files;

  if (!files || files.length === 0)
    return res.status(400).json({ message: 'At least one photo is required' });

  // Upload photos
  const photos = await Promise.all(
    files.map(async (file) => {
      const result = await uploadToCloudinary(file.path);
      return { url: result.url, publicId: result.publicId, originalName: file.originalname };
    })
  );

  // Parse items
  let items = [];
  try { items = JSON.parse(itemsJson); } catch { items = []; }

  // Verify prices server-side
  const liveServices = await getLiveServices();
  const serviceMap = {};
  liveServices.forEach(s => { serviceMap[s.id] = s; });

  let totalAmount = 0;
  const verifiedItems = items.map(item => {
    const svc = serviceMap[item.serviceType];
    const pricePerUnit = svc ? svc.price : 0;
    const subtotal = pricePerUnit * item.quantity;
    totalAmount += subtotal;
    return {
      serviceType: item.serviceType,
      serviceLabel: svc ? svc.label : item.serviceType,
      quantity: item.quantity,
      pricePerUnit,
      copies: svc?.copies || 1,
      subtotal,
      photoIndexes: item.photoIndexes || [],
      note: item.note || '',
    };
  });

  // Fallback for single-service orders
  const primaryItem = verifiedItems[0] || {};

  const order = await Order.create({
    customer: { name, email: email || '', phone },
    photos,
    items: verifiedItems,
    serviceType: primaryItem.serviceType || 'custom',
    quantity: primaryItem.quantity || 1,
    totalAmount,
    paymentStatus: razorpayPaymentId ? 'paid' : 'pending',
    paymentId: razorpayPaymentId,
    razorpayOrderId,
    notes,
  });

  Promise.allSettled([
    sendOrderConfirmationEmail(order),
    sendOwnerNotificationEmail(order),
    sendOrderConfirmationSMS(order),
    sendOrderConfirmationWhatsApp(order),
  ]);

  res.status(201).json({
    success: true,
    orderId: order.orderId,
    queueNumber: order.queueNumber,
    totalAmount: order.totalAmount,
    message: 'Order placed successfully!',
  });
};

// @GET /api/orders/track/:orderId
const trackOrder = async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId }).select(
    'orderId queueNumber customer.name serviceType items quantity totalAmount paymentStatus orderStatus createdAt'
  );
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
};

// @GET /api/orders/price/:serviceType
const getPrice = async (req, res) => {
  const services = await getLiveServices();
  const svc = services.find(s => s.id === req.params.serviceType);
  if (!svc) return res.status(404).json({ message: 'Service not found' });
  res.json({ serviceType: svc.id, pricePerUnit: svc.price });
};

module.exports = { createOrder, trackOrder, getPrice, getServices };