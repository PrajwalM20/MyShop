const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key:   { type: String, unique: true },
  value: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

const DEFAULT_SERVICES = [
  // ── Photo Services ───────────────────────────────────────────
  {
    id: 'passport', label: 'Passport Size Photo', icon: '',
    price: 50, copies: 8, unit: 'set of 8',
    desc: '8 copies per set, govt-approved size',
    category: 'photo',
  },
  {
    id: 'print_4x6', label: 'Photo Print 4×6', icon: '',
    price: 30, copies: 1, unit: 'piece',
    desc: 'Glossy or matte finish, per piece',
    category: 'photo',
  },
  {
    id: 'print_5x7', label: 'Photo Print 5×7', icon: '',
    price: 50, copies: 1, unit: 'piece',
    desc: 'Premium 5×7 print, per piece',
    category: 'photo',
  },
  {
    id: 'print_a4', label: 'Photo Print A4', icon: '',
    price: 30, copies: 1, unit: 'piece',
    desc: 'Full-size A4 premium print, per piece',
    category: 'photo',
  },
  {
    id: 'lamination_normal', label: 'Lamination (Normal)', icon: '',
    price: 150, copies: 1, unit: 'piece',
    desc: 'Standard lamination, per piece',
    category: 'photo',
  },
  {
    id: 'lamination_fiber', label: 'Lamination (Fiber)', icon: '',
    price: 400, copies: 1, unit: 'piece',
    desc: 'Premium fiber lamination, per piece',
    category: 'photo',
  },
  {
    id: 'school_id', label: 'School ID Photo', icon: '',
    price: 50, copies: 1, unit: 'piece',
    desc: 'ID card photos for students, per piece',
    category: 'photo',
  },
  {
    id: 'flex', label: 'Flex Banner', icon: '',
    price: 0, copies: 1, unit: 'sq.ft',
    desc: 'Custom flex banner printing — price by size',
    category: 'print', priceTBD: true,
  },
  // ── Event Photography ─────────────────────────────────────────
  {
    id: 'wedding', label: 'Wedding Photography', icon: '',
    price: 0, copies: 1, unit: 'event',
    desc: 'Full day wedding photography & coverage',
    category: 'event', priceTBD: true, bookingRequired: true,
  },
  {
    id: 'housewarming', label: 'House Warming / Seremani', icon: '',
    price: 0, copies: 1, unit: 'event',
    desc: 'House warming & seremani ceremony coverage',
    category: 'event', priceTBD: true, bookingRequired: true,
  },
  {
    id: 'baby_shower', label: 'Baby Shower / Simantha', icon: '',
    price: 0, copies: 1, unit: 'event',
    desc: 'Baby shower & simantha ceremony photography',
    category: 'event', priceTBD: true, bookingRequired: true,
  },
  {
    id: 'outdoor', label: 'Outdoor Shoot', icon: '',
    price: 0, copies: 1, unit: 'session',
    desc: 'Outdoor photography session at your location',
    category: 'event', priceTBD: true, bookingRequired: true,
  },
  {
    id: 'prewedding', label: 'Pre-Wedding Shoot', icon: '',
    price: 0, copies: 1, unit: 'session',
    desc: 'Pre-wedding couple photography session',
    category: 'event', priceTBD: true, bookingRequired: true,
  },
  {
    id: 'birthday', label: 'Birthday Party', icon: '',
    price: 0, copies: 1, unit: 'event',
    desc: 'Birthday party photography & coverage',
    category: 'event', priceTBD: true, bookingRequired: true,
  },
  {
    id: 'graduation', label: 'Graduation Ceremony', icon: '',
    price: 0, copies: 1, unit: 'event',
    desc: 'Graduation ceremony photography',
    category: 'event', priceTBD: true, bookingRequired: true,
  },
  {
    id: 'portrait', label: 'Portrait Session', icon: '',
    price: 0, copies: 1, unit: 'session',
    desc: 'Professional studio portrait session',
    category: 'event', priceTBD: true, bookingRequired: true,
  },
];

const DEFAULT_SHOP = {
  name: 'Usha Photo Studio', phone: '', address: '', hours: '9 AM - 9 PM',
};

const normalizeService = (svc) => {
  const normalized = { ...svc };
  if (normalized.id === 'print_4x6') {
    normalized.price = 30;
    normalized.copies = 1;
    normalized.unit = 'piece';
    normalized.desc = 'Glossy or matte finish, per piece';
    normalized.category = 'photo';
  }
  if (normalized.id === 'school_id') {
    normalized.price = 50;
    normalized.copies = 8;
    normalized.unit = 'set of 8';
    normalized.desc = '8 copies per set for student ID cards';
    normalized.category = 'photo';
  }
  return normalized;
};

const getServices = async (req, res) => {
  try {
    let s = await Settings.findOne({ key: 'services' });
    if (!s) s = await Settings.create({ key: 'services', value: DEFAULT_SERVICES });
    const normalizedValue = (s.value || DEFAULT_SERVICES).map(normalizeService);
    if (JSON.stringify(normalizedValue) !== JSON.stringify(s.value)) {
      await Settings.findOneAndUpdate({ key: 'services' }, { value: normalizedValue }, { upsert: true, new: true });
    }
    res.json(normalizedValue);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateServices = async (req, res) => {
  try {
    let { services } = req.body;
    services = services.map(normalizeService);
    await Settings.findOneAndUpdate({ key: 'services' }, { value: services }, { upsert: true, new: true });
    res.json({ success: true, message: 'Services updated!', services });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getPrices = async (req, res) => {
  try {
    let s = await Settings.findOne({ key: 'services' });
    if (!s) s = await Settings.create({ key: 'services', value: DEFAULT_SERVICES });
    const normalizedValue = (s.value || DEFAULT_SERVICES).map(normalizeService);
    const map = {};
    normalizedValue.forEach(svc => { map[svc.id] = svc.price; });
    res.json(map);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updatePrices = async (req, res) => {
  try {
    const { prices } = req.body;
    let s = await Settings.findOne({ key: 'services' });
    const current = s ? [...s.value] : [...DEFAULT_SERVICES];
    const updated = current.map(svc => ({
      ...svc,
      price: prices[svc.id] !== undefined ? Number(prices[svc.id]) : svc.price,
    }));
    await Settings.findOneAndUpdate({ key: 'services' }, { value: updated }, { upsert: true, new: true });
    res.json({ success: true, message: 'Prices updated!' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getShopInfo = async (req, res) => {
  try {
    let s = await Settings.findOne({ key: 'shop_info' });
    if (!s) s = await Settings.create({ key: 'shop_info', value: DEFAULT_SHOP });
    res.json(s.value);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateShopInfo = async (req, res) => {
  try {
    const { name, phone, address, hours } = req.body;
    await Settings.findOneAndUpdate(
      { key: 'shop_info' },
      { value: { name: name || DEFAULT_SHOP.name, phone, address, hours } },
      { upsert: true, new: true }
    );
    res.json({ success: true, message: 'Shop info updated!' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = {
  getServices, updateServices, getPrices, updatePrices,
  getShopInfo, updateShopInfo, Settings, DEFAULT_SERVICES,
};