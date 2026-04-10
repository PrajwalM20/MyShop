const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  orderId:   { type: String },
  rating:    { type: Number, min: 1, max: 5, required: true },
  tags:      [{ type: String }],
  comment:   { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});
const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

// POST /api/feedback — public (customer submits)
router.post('/', async (req, res) => {
  try {
    const { orderId, rating, tags, comment } = req.body;
    const fb = await Feedback.create({
      orderId, rating, tags: tags || [], comment: comment || '',
    });
    res.json({ success: true, id: fb._id });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// GET /api/feedback — owner only
const { protect, ownerOnly } = require('../middleware/authMiddleware');
router.get('/', protect, ownerOnly, async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(200);
    res.json(feedbacks);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/feedback/:id — owner only — remove a single feedback permanently
router.delete('/:id', protect, ownerOnly, async (req, res) => {
  try {
    const fb = await Feedback.findById(req.params.id);
    if (!fb) return res.status(404).json({ message: 'Feedback not found' });
    await fb.deleteOne();
    res.json({ success: true, message: 'Feedback deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;