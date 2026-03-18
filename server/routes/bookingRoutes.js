const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, ownerOnly } = require('../middleware/authMiddleware');

const bookingSchema = new mongoose.Schema({
  date:        { type: String, required: true, unique: true }, // "YYYY-MM-DD"
  status:      { type: String, enum: ['available','booked','blocked'], default: 'available' },
  purpose:     { type: String, default: '' },
  clientName:  { type: String, default: '' },
  clientPhone: { type: String, default: '' },
  clientAddress:{ type: String, default: '' },
  eventType:   { type: String, default: '' },
  notes:       { type: String, default: '' },
  createdAt:   { type: Date, default: Date.now },
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

// GET /api/bookings?month=2026-03  — public, returns all bookings for a month
router.get('/', async (req, res) => {
  try {
    const { month } = req.query;
    const filter = month ? { date: { $regex: `^${month}` } } : {};
    const bookings = await Booking.find(filter).sort({ date: 1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/bookings — client submits booking request (creates as 'booked' pending owner review)
router.post('/', async (req, res) => {
  try {
    const { date, clientName, clientPhone, clientAddress, eventType, notes } = req.body;
    if (!date || !clientName || !clientPhone || !eventType)
      return res.status(400).json({ message: 'Name, phone, date and event type are required' });
    const existing = await Booking.findOne({ date });
    if (existing && existing.status !== 'available')
      return res.status(400).json({ message: 'This date is already booked. Please choose another.' });
    const booking = await Booking.findOneAndUpdate(
      { date },
      { date, clientName, clientPhone, clientAddress: clientAddress || '', eventType, notes: notes || '', status: 'booked' },
      { upsert: true, new: true }
    );
    res.json({ success: true, booking });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/bookings/:date — owner updates status/notes
router.put('/:date', protect, ownerOnly, async (req, res) => {
  try {
    const { status, notes, clientName, clientPhone, clientAddress, eventType } = req.body;
    const booking = await Booking.findOneAndUpdate(
      { date: req.params.date },
      { $set: { status, notes, clientName, clientPhone, clientAddress, eventType } },
      { upsert: true, new: true }
    );
    res.json({ success: true, booking });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/bookings/:date — owner clears a booking
router.delete('/:date', protect, ownerOnly, async (req, res) => {
  try {
    await Booking.findOneAndDelete({ date: req.params.date });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;