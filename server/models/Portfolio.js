const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ['passport', 'print', 'lamination', 'school_id', 'wedding', 'event', 'other'],
    default: 'other',
  },
  imageUrl: { type: String, required: true },
  publicId: { type: String },
  description: { type: String },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);