const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key:   { type: String, unique: true },
  value: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

// ── Service catalogue ─────────────────────────────────────────
// price = what the customer pays per "unit"
// copies = how many physical prints per unit (for display)
// priceTBD = owner hasn't set price yet
const DEFAULT_SERVICES = [
  { id: 'passport',          label: 'Passport Size Photo',   icon: '🪪',  price: 50,  copies: 8,  unit: 'set of 8',  desc: '8 copies per set, govt-approved' },
  { id: 'print_4x6',         label: 'Photo Print 4×6',       icon: '🖼️', price: 50,  copies: 4,  unit: 'set of 4',  desc: '4 pieces, glossy/matte finish' },
  { id: 'print_5x7',         label: 'Photo Print 5×7',       icon: '🖼️', price: 50,  copies: 1,  unit: 'piece',     desc: 'Premium 5×7 print' },
  { id: 'print_a4',          label: 'Photo Print A4',         icon: '📄',  price: 30,  copies: 1,  unit: 'piece',     desc: 'Full-size A4 premium print' },
  { id: 'lamination_normal', label: 'Lamination (Normal)',    icon: '✨',  price: 150, copies: 1,  unit: 'piece',     desc: 'Standard lamination' },
  { id: 'lamination_fiber',  label: 'Lamination (Fiber)',     icon: '💎',  price: 400, copies: 1,  unit: 'piece',     desc: 'Premium fiber lamination' },
  { id: 'school_id',         label: 'School ID Photo',        icon: '🎓',  price: 50,  copies: 1,  unit: 'piece',     desc: 'ID card photos for students' },
  { id: 'flex',              label: 'Flex Banner',            icon: '🪧',  price: 0,   copies: 1,  unit: 'sq.ft',     desc: 'Price decided by size', priceTBD: true },
];

const DEFAULT_SHOP = {
  name: 'Usha Photo Studio', phone: '', address: '', hours: '9 AM - 9 PM',
};

// ── GET /api/settings/services  (public) ─────────────────────
const getServices = async (req, res) => {
  let s = await Settings.findOne({ key: 'services' });
  if (!s) s = await Settings.create({ key: 'services', value: DEFAULT_SERVICES });
  res.json(s.value);
};

// ── PUT /api/settings/services  (owner) ──────────────────────
const updateServices = async (req, res) => {
  const { services } = req.body;
  await Settings.findOneAndUpdate({ key: 'services' }, { value: services }, { upsert: true, new: true });
  res.json({ success: true, message: 'Services updated!', services });
};

// ── GET /api/settings/prices  (legacy, still used) ───────────
const getPrices = async (req, res) => {
  let s = await Settings.findOne({ key: 'services' });
  if (!s) s = await Settings.create({ key: 'services', value: DEFAULT_SERVICES });
  // Return as flat key→price map for backward compat
  const map = {};
  (s.value || DEFAULT_SERVICES).forEach(svc => { map[svc.id] = svc.price; });
  res.json(map);
};

// ── PUT /api/settings/prices  (legacy) ───────────────────────
const updatePrices = async (req, res) => {
  const { prices } = req.body;
  let s = await Settings.findOne({ key: 'services' });
  const current = s ? [...s.value] : [...DEFAULT_SERVICES];
  const updated = current.map(svc => ({
    ...svc,
    price: prices[svc.id] !== undefined ? Number(prices[svc.id]) : svc.price,
  }));
  await Settings.findOneAndUpdate({ key: 'services' }, { value: updated }, { upsert: true, new: true });
  res.json({ success: true, message: 'Prices updated!' });
};

// ── GET /api/settings/shop-info  (public) ────────────────────
const getShopInfo = async (req, res) => {
  let s = await Settings.findOne({ key: 'shop_info' });
  if (!s) s = await Settings.create({ key: 'shop_info', value: DEFAULT_SHOP });
  res.json(s.value);
};

// ── PUT /api/settings/shop-info  (owner) ─────────────────────
const updateShopInfo = async (req, res) => {
  const { name, phone, address, hours } = req.body;
  await Settings.findOneAndUpdate(
    { key: 'shop_info' },
    { value: { name: name || DEFAULT_SHOP.name, phone, address, hours } },
    { upsert: true, new: true }
  );
  res.json({ success: true, message: 'Shop info updated!' });
};

module.exports = { getServices, updateServices, getPrices, updatePrices, getShopInfo, updateShopInfo, Settings, DEFAULT_SERVICES };