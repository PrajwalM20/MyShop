const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const { protect, ownerOnly } = require('../middleware/authMiddleware');

const slotSchema = new mongoose.Schema({
  status:       { type: String, enum: ['available','pending','booked','blocked'], default: 'available' },
  clientName:   { type: String, default: '' },
  clientPhone:  { type: String, default: '' },
  clientAddress:{ type: String, default: '' },
  eventType:    { type: String, default: '' },
  notes:        { type: String, default: '' },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  date:      { type: String, required: true, unique: true },
  morning:   { type: slotSchema, default: () => ({}) },
  afternoon: { type: slotSchema, default: () => ({}) },
  evening:   { type: slotSchema, default: () => ({}) },
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

// GET /api/bookings?month=2026-03
router.get('/', async (req, res) => {
  try {
    const filter = req.query.month ? { date: { $regex: `^${req.query.month}` } } : {};
    const bookings = await Booking.find(filter).sort({ date: 1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/bookings — client submits → status becomes 'pending' (not booked yet)
router.post('/', async (req, res) => {
  try {
    const { date, slot, clientName, clientPhone, clientAddress, eventType, notes } = req.body;
    if (!date || !slot || !clientName || !clientPhone || !eventType)
      return res.status(400).json({ message: 'Date, slot, name, phone and event type are required' });
    if (!['morning','afternoon','evening'].includes(slot))
      return res.status(400).json({ message: 'Invalid time slot' });

    const existing = await Booking.findOne({ date });
    const slotStatus = existing?.[slot]?.status;
    if (slotStatus === 'booked')  return res.status(400).json({ message: `The ${slot} slot is already booked.` });
    if (slotStatus === 'blocked') return res.status(400).json({ message: `The ${slot} slot is not available.` });
    if (slotStatus === 'pending') return res.status(400).json({ message: `The ${slot} slot has a pending request. Please choose another.` });

    // Client request → PENDING (not confirmed until owner accepts)
    const slotData = { status: 'pending', clientName, clientPhone, clientAddress: clientAddress || '', eventType, notes: notes || '' };
    const booking = await Booking.findOneAndUpdate(
      { date },
      { $set: { [slot]: slotData } },
      { upsert: true, new: true }
    );
    res.json({ success: true, booking });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/bookings/:date/:slot — owner updates (accept → booked, block, free)
router.put('/:date/:slot', protect, ownerOnly, async (req, res) => {
  try {
    const { slot } = req.params;
    if (!['morning','afternoon','evening'].includes(slot))
      return res.status(400).json({ message: 'Invalid slot' });
    const { status, notes, clientName, clientPhone, clientAddress, eventType } = req.body;
    const update = { [`${slot}.status`]: status };
    if (notes !== undefined)         update[`${slot}.notes`]         = notes;
    if (clientName !== undefined)    update[`${slot}.clientName`]    = clientName;
    if (clientPhone !== undefined)   update[`${slot}.clientPhone`]   = clientPhone;
    if (clientAddress !== undefined) update[`${slot}.clientAddress`] = clientAddress;
    if (eventType !== undefined)     update[`${slot}.eventType`]     = eventType;
    const booking = await Booking.findOneAndUpdate(
      { date: req.params.date },
      { $set: update },
      { upsert: true, new: true }
    );
    res.json({ success: true, booking });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/bookings/:date/:slot — owner clears slot back to available
router.delete('/:date/:slot', protect, ownerOnly, async (req, res) => {
  try {
    const { slot } = req.params;
    const booking = await Booking.findOneAndUpdate(
      { date: req.params.date },
      { $set: { [slot]: { status: 'available', clientName:'', clientPhone:'', clientAddress:'', eventType:'', notes:'' } } },
      { new: true }
    );
    res.json({ success: true, booking });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;