const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Each item in a multi-service order
const orderItemSchema = new mongoose.Schema({
  serviceType: {
    type: String,
    enum: ['passport','print_4x6','print_5x7','print_a4','lamination_normal',
           'lamination_fiber','school_id','flex','custom'],
    required: true,
  },
  serviceLabel: { type: String },   // human readable e.g. "Passport (8 copies)"
  quantity: { type: Number, required: true, min: 1 },
  pricePerUnit: { type: Number, required: true },
  copies: { type: Number, default: 1 }, // e.g. passport = 8 copies per unit
  subtotal: { type: Number, required: true },
  photoIndexes: [{ type: Number }],  // which uploaded photos belong to this item
  note: { type: String },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    default: () => 'CQ-' + uuidv4().slice(0, 8).toUpperCase(),
    unique: true,
  },
  customer: {
    name:  { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, required: true },
  },
  photos: [{
    url: String, publicId: String, originalName: String,
  }],

  // NEW: multi-item support
  items: [orderItemSchema],

  // Legacy single-service fields (kept for backward compat)
  serviceType: { type: String, default: 'custom' },
  quantity:    { type: Number, default: 1 },

  totalAmount:   { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
  paymentId:     { type: String },
  razorpayOrderId: { type: String },
  orderStatus:   { type: String, enum: ['pending','processing','ready','completed','cancelled'], default: 'pending' },
  queueNumber:   { type: Number },
  notes:         { type: String },
  notifiedAt:    { type: Date },
}, { timestamps: true });

orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    this.queueNumber = count + 1;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);