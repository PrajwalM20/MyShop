const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Simple feedback schema
const feedbackSchema = new mongoose.Schema({
  orderId:   { type: String },
  rating:    { type: Number, min: 1, max: 5, required: true },
  tags:      [{ type: String }],
  comment:   { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});
const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

// POST /api/feedback — public (customer submits after payment)
router.post('/', async (req, res) => {
  try {
    const { orderId, rating, tags, comment } = req.body;
    const fb = await Feedback.create({ orderId, rating, tags: tags || [], comment: comment || '' });
    res.json({ success: true, id: fb._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/feedback — owner only (view all feedback)
const { protect, ownerOnly } = require('../middleware/authMiddleware');
router.get('/', protect, ownerOnly, async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(100);
    res.json(feedbacks);
  } catch (err) {
    console.error('Failed to fetch feedbacks', err);
    res.status(500).json({ message: 'Failed to fetch feedbacks' });
  }
});

module.exports = router;