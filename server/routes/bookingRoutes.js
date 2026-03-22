const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { protect, ownerOnly } = require('../middleware/authMiddleware');

// ── Schema ────────────────────────────────────────────────────
const slotSchema = new mongoose.Schema({
  status:        { type: String, enum: ['available','pending','booked','blocked'], default: 'available' },
  clientName:    { type: String, default: '' },
  clientPhone:   { type: String, default: '' },
  clientAddress: { type: String, default: '' },
  eventType:     { type: String, default: '' },
  notes:         { type: String, default: '' },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  date:      { type: String, required: true, unique: true },
  morning:   { type: slotSchema, default: () => ({}) },
  afternoon: { type: slotSchema, default: () => ({}) },
  evening:   { type: slotSchema, default: () => ({}) },
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

// ── Notify owner by email ─────────────────────────────────────
const notifyOwner = async ({ clientName, clientPhone, clientAddress, eventType, notes, date, slot }) => {
  const ownerEmail = process.env.OWNER_EMAIL;
  const emailUser  = process.env.EMAIL_USER;
  const emailPass  = process.env.EMAIL_PASS;

  if (!ownerEmail || !emailUser || !emailPass) {
    console.log('📧 Owner notification skipped — email not configured');
    return;
  }
  if (emailUser === 'your_gmail@gmail.com' || emailUser === 'your_email@gmail.com') {
    console.log('📧 Owner notification skipped — placeholder email in .env');
    return;
  }

  const slotLabel = slot === 'morning' ? '🌅 Morning (8AM–12PM)'
                  : slot === 'afternoon' ? '☀️ Afternoon (12PM–4PM)'
                  : '🌇 Evening (4PM–8PM)';

  const eventLabel = eventType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: { user: emailUser, pass: emailPass },
    });

    await transporter.sendMail({
      from: `"ClickQueue Bookings" <${emailUser}>`,
      to:   ownerEmail,
      subject: `📅 New Booking Request — ${clientName} (${eventLabel})`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#0d0d1a;color:#fff;border-radius:12px;overflow:hidden">
          <div style="background:#D4AF37;padding:20px 28px">
            <h2 style="margin:0;color:#0d0d1a;font-size:20px">📅 New Booking Request</h2>
            <p style="margin:6px 0 0;color:#0d0d1a;font-size:14px">Someone wants to book a session</p>
          </div>
          <div style="padding:24px 28px">
            <table style="width:100%;border-collapse:collapse;font-size:15px">
              <tr><td style="padding:8px 0;color:#888;width:130px">Client</td><td style="padding:8px 0;font-weight:bold">${clientName}</td></tr>
              <tr><td style="padding:8px 0;color:#888">Phone</td><td style="padding:8px 0"><a href="tel:+91${clientPhone}" style="color:#D4AF37">📞 +91 ${clientPhone}</a></td></tr>
              ${clientAddress ? `<tr><td style="padding:8px 0;color:#888">Address</td><td style="padding:8px 0">${clientAddress}</td></tr>` : ''}
              <tr><td style="padding:8px 0;color:#888">Date</td><td style="padding:8px 0;font-weight:bold">${new Date(date + 'T00:00:00').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</td></tr>
              <tr><td style="padding:8px 0;color:#888">Time Slot</td><td style="padding:8px 0">${slotLabel}</td></tr>
              <tr><td style="padding:8px 0;color:#888">Event Type</td><td style="padding:8px 0;color:#D4AF37;font-weight:bold">${eventLabel}</td></tr>
              ${notes ? `<tr><td style="padding:8px 0;color:#888">Notes</td><td style="padding:8px 0;font-style:italic">"${notes}"</td></tr>` : ''}
            </table>
            <div style="margin-top:20px;padding:14px;background:rgba(212,175,55,0.1);border-radius:8px;border:1px solid rgba(212,175,55,0.3)">
              <p style="margin:0;font-size:14px;color:#D4AF37">⚡ Action required — go to your calendar to Accept or Decline this request.</p>
            </div>
          </div>
          <div style="padding:14px 28px;background:#111;font-size:12px;color:#555;text-align:center">
            Usha Photo Studio — ClickQueue Booking System
          </div>
        </div>
      `,
    });
    console.log(`✅ Owner notified about booking from ${clientName}`);
  } catch (err) {
    console.error('❌ Owner notification email failed:', err.message);
  }
};

// ── Routes ────────────────────────────────────────────────────

// GET /api/bookings?month=2026-03
router.get('/', async (req, res) => {
  try {
    const filter = req.query.month ? { date: { $regex: `^${req.query.month}` } } : {};
    const bookings = await Booking.find(filter).sort({ date: 1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/bookings — client books → PENDING + notify owner
router.post('/', async (req, res) => {
  try {
    const { date, slot, clientName, clientPhone, clientAddress, eventType, notes } = req.body;

    if (!date || !slot || !clientName || !clientPhone || !eventType)
      return res.status(400).json({ message: 'Date, slot, name, phone and event type are required' });
    if (!['morning','afternoon','evening'].includes(slot))
      return res.status(400).json({ message: 'Invalid time slot' });

    const existing = await Booking.findOne({ date });
    const slotStatus = existing?.[slot]?.status;

    if (slotStatus === 'booked')
      return res.status(400).json({ message: `The ${slot} slot is already booked. Please choose another.` });
    if (slotStatus === 'blocked')
      return res.status(400).json({ message: `The ${slot} slot is not available.` });
    if (slotStatus === 'pending')
      return res.status(400).json({ message: `The ${slot} slot already has a pending request. Please choose another.` });

    const slotData = {
      status: 'pending',
      clientName, clientPhone,
      clientAddress: clientAddress || '',
      eventType,
      notes: notes || '',
    };

    const booking = await Booking.findOneAndUpdate(
      { date },
      { $set: { [slot]: slotData } },
      { upsert: true, new: true }
    );

    // Notify owner async (don't block response)
    notifyOwner({ clientName, clientPhone, clientAddress, eventType, notes, date, slot })
      .catch(err => console.error('Notify error:', err.message));

    res.json({ success: true, booking });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/bookings/:date/:slot — owner accepts/blocks/frees
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

// DELETE /api/bookings/:date/:slot — owner clears slot
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