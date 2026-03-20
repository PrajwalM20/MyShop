const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key:   { type: String, unique: true },
  value: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

const DEFAULT_SERVICES = [
  { id: 'passport',          label: 'Passport Size Photo',      icon: '🪪',  price: 50,  copies: 8,  unit: 'set of 8',  desc: '8 copies per set, govt-approved',           category: 'photo' },
  { id: 'print_4x6',         label: 'Photo Print 4×6',          icon: '🖼️', price: 50,  copies: 4,  unit: 'set of 4',  desc: '4 pieces, glossy/matte finish',             category: 'photo' },
  { id: 'print_5x7',         label: 'Photo Print 5×7',          icon: '🖼️', price: 50,  copies: 1,  unit: 'piece',     desc: 'Premium 5×7 print',                         category: 'photo' },
  { id: 'print_a4',          label: 'Photo Print A4',            icon: '📄',  price: 30,  copies: 1,  unit: 'piece',     desc: 'Full-size A4 premium print',                category: 'photo' },
  { id: 'lamination_normal', label: 'Lamination (Normal)',       icon: '✨',  price: 150, copies: 1,  unit: 'piece',     desc: 'Standard lamination',                       category: 'photo' },
  { id: 'lamination_fiber',  label: 'Lamination (Fiber)',        icon: '💎',  price: 400, copies: 1,  unit: 'piece',     desc: 'Premium fiber lamination',                  category: 'photo' },
  { id: 'school_id',         label: 'School ID Photo',           icon: '🎓',  price: 50,  copies: 1,  unit: 'piece',     desc: 'ID card photos for students',               category: 'photo' },
  { id: 'flex',              label: 'Flex Banner',               icon: '🪧',  price: 0,   copies: 1,  unit: 'sq.ft',     desc: 'Price decided by size',                     category: 'print', priceTBD: true },
  { id: 'wedding',           label: 'Wedding Photography',       icon: '💍',  price: 0,   copies: 1,  unit: 'event',     desc: 'Full day wedding coverage',                 category: 'event', priceTBD: true, bookingRequired: true },
  { id: 'housewarming',      label: 'House Warming / Seremani',  icon: '🏠',  price: 0,   copies: 1,  unit: 'event',     desc: 'House warming ceremony coverage',           category: 'event', priceTBD: true, bookingRequired: true },
  { id: 'baby_shower',       label: 'Baby Shower / Simantha',    icon: '👶',  price: 0,   copies: 1,  unit: 'event',     desc: 'Baby shower & simantha ceremony',           category: 'event', priceTBD: true, bookingRequired: true },
  { id: 'outdoor',           label: 'Outdoor Shoot',             icon: '🌅',  price: 0,   copies: 1,  unit: 'session',   desc: 'Outdoor photography session',               category: 'event', priceTBD: true, bookingRequired: true },
  { id: 'prewedding',        label: 'Pre-Wedding Shoot',         icon: '💕',  price: 0,   copies: 1,  unit: 'session',   desc: 'Pre-wedding photography session',           category: 'event', priceTBD: true, bookingRequired: true },
];

const DEFAULT_SHOP = { name: 'Usha Photo Studio', phone: '', address: '', hours: '9 AM - 9 PM' };

const getServices = async (req, res) => {
  let s = await Settings.findOne({ key: 'services' });
  if (!s) s = await Settings.create({ key: 'services', value: DEFAULT_SERVICES });
  res.json(s.value);
};

const updateServices = async (req, res) => {
  const { services } = req.body;
  await Settings.findOneAndUpdate({ key: 'services' }, { value: services }, { upsert: true, new: true });
  res.json({ success: true, message: 'Services updated!', services });
};

const getPrices = async (req, res) => {
  let s = await Settings.findOne({ key: 'services' });
  if (!s) s = await Settings.create({ key: 'services', value: DEFAULT_SERVICES });
  const map = {};
  (s.value || DEFAULT_SERVICES).forEach(svc => { map[svc.id] = svc.price; });
  res.json(map);
};

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

const getShopInfo = async (req, res) => {
  let s = await Settings.findOne({ key: 'shop_info' });
  if (!s) s = await Settings.create({ key: 'shop_info', value: DEFAULT_SHOP });
  res.json(s.value);
};

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