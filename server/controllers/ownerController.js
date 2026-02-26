const Order = require('../models/Order');
const {
  sendOrderReadyEmail,
  sendOrderReadySMS,
  sendOrderReadyWhatsApp,
} = require('../config/notifications');

// @GET /api/owner/orders
const getAllOrders = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status && status !== 'all') filter.orderStatus = status;

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Order.countDocuments(filter);

  res.json({ orders, total, pages: Math.ceil(total / limit), currentPage: parseInt(page) });
};

// @GET /api/owner/orders/:id
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
};

// @PUT /api/owner/orders/:id/status
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.orderStatus = status;

  // Notify customer when order is marked as 'ready'
  if (status === 'ready' && !order.notifiedAt) {
    order.notifiedAt = new Date();
    Promise.allSettled([
      sendOrderReadyEmail(order),
      sendOrderReadySMS(order),
      sendOrderReadyWhatsApp(order),
    ]);
  }

  await order.save();
  res.json({ success: true, order });
};

// @GET /api/owner/dashboard
const getDashboardStats = async (req, res) => {
  const [
    totalOrders,
    pendingOrders,
    processingOrders,
    readyOrders,
    completedOrders,
    revenueAgg,
    todayOrders,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: 'pending' }),
    Order.countDocuments({ orderStatus: 'processing' }),
    Order.countDocuments({ orderStatus: 'ready' }),
    Order.countDocuments({ orderStatus: 'completed' }),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    }),
  ]);

  const totalRevenue = revenueAgg[0]?.total || 0;

  // Last 7 days revenue chart data
  const sevenDays = await Order.aggregate([
    { $match: { paymentStatus: 'paid', createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    totalOrders,
    pendingOrders,
    processingOrders,
    readyOrders,
    completedOrders,
    totalRevenue,
    todayOrders,
    revenueChart: sevenDays,
  });
};

// @GET /api/owner/orders/export  (CSV)
const exportOrders = async (req, res) => {
  const orders = await Order.find({ paymentStatus: 'paid' }).sort({ createdAt: -1 });

  const rows = [
    ['Order ID', 'Queue #', 'Name', 'Phone', 'Email', 'Service', 'Qty', 'Amount', 'Status', 'Date'],
    ...orders.map((o) => [
      o.orderId, o.queueNumber, o.customer.name, o.customer.phone, o.customer.email,
      o.serviceType, o.quantity, o.totalAmount, o.orderStatus,
      new Date(o.createdAt).toLocaleDateString('en-IN'),
    ]),
  ];

  const csv = rows.map((r) => r.join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=clickqueue-orders.csv');
  res.send(csv);
};

module.exports = { getAllOrders, getOrderById, updateOrderStatus, getDashboardStats, exportOrders };
