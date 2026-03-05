const Order = require('../models/Order');
const {
  sendOrderReadyEmail, sendOrderReadySMS, sendOrderReadyWhatsApp,
} = require('../config/notifications');

// @GET /api/owner/orders
const getAllOrders = async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status && status !== 'all') filter.orderStatus = status;
  if (search) {
    filter.$or = [
      { orderId: { $regex: search, $options: 'i' } },
      { 'customer.name': { $regex: search, $options: 'i' } },
      { 'customer.phone': { $regex: search, $options: 'i' } },
    ];
  }
  const orders = await Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
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
  if (status === 'ready' && !order.notifiedAt) {
    order.notifiedAt = new Date();
    Promise.allSettled([sendOrderReadyEmail(order), sendOrderReadySMS(order), sendOrderReadyWhatsApp(order)]);
  }
  await order.save();
  res.json({ success: true, order });
};

// @PUT /api/owner/orders/:id  — edit customer details / notes
const updateOrder = async (req, res) => {
  const { customerName, customerPhone, customerEmail, notes, serviceType, quantity } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (customerName)  order.customer.name  = customerName;
  if (customerPhone) order.customer.phone = customerPhone;
  if (customerEmail !== undefined) order.customer.email = customerEmail;
  if (notes !== undefined) order.notes = notes;
  if (serviceType) order.serviceType = serviceType;
  if (quantity) order.quantity = parseInt(quantity);
  await order.save();
  res.json({ success: true, order });
};

// @DELETE /api/owner/orders/:id
const deleteOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  await order.deleteOne();
  res.json({ success: true, message: 'Order deleted' });
};

// @DELETE /api/owner/orders/bulk — delete multiple
const bulkDeleteOrders = async (req, res) => {
  const { ids } = req.body;
  if (!ids || !ids.length) return res.status(400).json({ message: 'No IDs provided' });
  await Order.deleteMany({ _id: { $in: ids } });
  res.json({ success: true, message: `${ids.length} orders deleted` });
};

// @DELETE /api/owner/orders/clear/:status — clear all by status
const clearOrdersByStatus = async (req, res) => {
  const { status } = req.params;
  const result = await Order.deleteMany({ orderStatus: status });
  res.json({ success: true, message: `${result.deletedCount} ${status} orders deleted` });
};

// @GET /api/owner/customers — unique customer list
const getCustomers = async (req, res) => {
  const customers = await Order.aggregate([
    { $group: {
      _id: '$customer.phone',
      name: { $last: '$customer.name' },
      email: { $last: '$customer.email' },
      phone: { $last: '$customer.phone' },
      totalOrders: { $sum: 1 },
      totalSpent: { $sum: '$totalAmount' },
      lastOrder: { $max: '$createdAt' },
    }},
    { $sort: { lastOrder: -1 } },
  ]);
  res.json(customers);
};

// @GET /api/owner/dashboard
const getDashboardStats = async (req, res) => {
  const [totalOrders, pendingOrders, processingOrders, readyOrders, completedOrders, revenueAgg, todayOrders] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: 'pending' }),
    Order.countDocuments({ orderStatus: 'processing' }),
    Order.countDocuments({ orderStatus: 'ready' }),
    Order.countDocuments({ orderStatus: 'completed' }),
    Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Order.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)), $lt: new Date(new Date().setHours(23,59,59,999)) } }),
  ]);
  const sevenDays = await Order.aggregate([
    { $match: { paymentStatus: 'paid', createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json({ totalOrders, pendingOrders, processingOrders, readyOrders, completedOrders, totalRevenue: revenueAgg[0]?.total || 0, todayOrders, revenueChart: sevenDays });
};

// @GET /api/owner/orders/export
const exportOrders = async (req, res) => {
  const orders = await Order.find({ paymentStatus: 'paid' }).sort({ createdAt: -1 });
  const rows = [
    ['Order ID','Queue #','Name','Phone','Email','Service','Qty','Amount','Status','Date'],
    ...orders.map(o => [o.orderId, o.queueNumber, o.customer.name, o.customer.phone, o.customer.email || '', o.serviceType, o.quantity, o.totalAmount, o.orderStatus, new Date(o.createdAt).toLocaleDateString('en-IN')]),
  ];
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
  res.send(csv);
};

module.exports = { getAllOrders, getOrderById, updateOrderStatus, updateOrder, deleteOrder, bulkDeleteOrders, clearOrdersByStatus, getCustomers, getDashboardStats, exportOrders };