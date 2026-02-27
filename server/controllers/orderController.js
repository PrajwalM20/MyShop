const Order = require('../models/Order');
const { uploadToCloudinary } = require('../config/cloudinary');
const {
  sendOrderConfirmationEmail,
  sendOwnerNotificationEmail,
  sendOrderConfirmationSMS,
  sendOrderConfirmationWhatsApp,
} = require('../config/notifications');

const SERVICE_PRICES = {
  passport: 40,
  print_4x6: 15,
  print_a4: 30,
  lamination: 50,
  school_id: 60,
  custom: 0,
};

// @POST /api/orders/create
const createOrder = async (req, res) => {
  const { name, email, phone, serviceType, quantity, razorpayPaymentId, razorpayOrderId, notes } = req.body;
  const files = req.files;

  if (!files || files.length === 0)
    return res.status(400).json({ message: 'At least one photo is required' });

  // Upload all files to Cloudinary (or local if not configured)
  const photos = await Promise.all(
    files.map(async (file) => {
      const result = await uploadToCloudinary(file.path);
      return {
        url: result.url,
        publicId: result.publicId,
        originalName: file.originalname,
      };
    })
  );

  const pricePerUnit = SERVICE_PRICES[serviceType] || 0;
  const totalAmount = pricePerUnit * parseInt(quantity);

  const order = await Order.create({
    customer: { name, email, phone },
    photos,
    serviceType,
    quantity: parseInt(quantity),
    totalAmount,
    paymentStatus: razorpayPaymentId ? 'paid' : 'pending',
    paymentId: razorpayPaymentId,
    razorpayOrderId,
    notes,
  });

  // Send notifications (non-blocking)
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
    'orderId queueNumber customer.name serviceType quantity totalAmount paymentStatus orderStatus createdAt'
  );
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
};

// @GET /api/orders/price/:serviceType
const getPrice = async (req, res) => {
  const price = SERVICE_PRICES[req.params.serviceType];
  if (price === undefined) return res.status(404).json({ message: 'Service not found' });
  res.json({ serviceType: req.params.serviceType, pricePerUnit: price });
};

// @GET /api/orders/services
const getServices = async (req, res) => {
  const services = Object.entries(SERVICE_PRICES).map(([key, price]) => ({
    id: key,
    label: {
      passport: 'Passport Size Photo',
      print_4x6: 'Photo Print 4x6',
      print_a4: 'Photo Print A4',
      lamination: 'Lamination',
      school_id: 'School ID Card Photo',
      custom: 'Custom Order',
    }[key],
    price,
  }));
  res.json(services);
};

module.exports = { createOrder, trackOrder, getPrice, getServices };