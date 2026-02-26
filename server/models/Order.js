const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    default: () => 'CQ-' + uuidv4().slice(0, 8).toUpperCase(),
    unique: true,
  },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  photos: [
    {
      url: String,
      publicId: String,
      originalName: String,
    },
  ],
  serviceType: {
    type: String,
    enum: ['passport', 'print_4x6', 'print_a4', 'lamination', 'school_id', 'custom'],
    required: true,
  },
  quantity: { type: Number, required: true, min: 1 },
  totalAmount: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentId: { type: String }, // Razorpay payment ID
  razorpayOrderId: { type: String },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'ready', 'completed', 'cancelled'],
    default: 'pending',
  },
  queueNumber: { type: Number },
  notes: { type: String },
  notifiedAt: { type: Date },
}, { timestamps: true });

// Auto assign queue number
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    this.queueNumber = count + 1;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
