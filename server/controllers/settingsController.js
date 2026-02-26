const mongoose = require('mongoose');

// Dynamic pricing stored in DB
const settingsSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  value: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

const DEFAULT_PRICES = {
  passport: 40,
  print_4x6: 15,
  print_a4: 30,
  lamination: 50,
  school_id: 60,
};

// Get current prices (owner or public)
const getPrices = async (req, res) => {
  let settings = await Settings.findOne({ key: 'service_prices' });
  if (!settings) {
    settings = await Settings.create({ key: 'service_prices', value: DEFAULT_PRICES });
  }
  res.json(settings.value);
};

// Update prices (owner only)
const updatePrices = async (req, res) => {
  const { prices } = req.body;
  const allowed = ['passport', 'print_4x6', 'print_a4', 'lamination', 'school_id'];

  // Validate
  for (const key of Object.keys(prices)) {
    if (!allowed.includes(key)) return res.status(400).json({ message: `Invalid service: ${key}` });
    if (typeof prices[key] !== 'number' || prices[key] < 0) {
      return res.status(400).json({ message: `Invalid price for ${key}` });
    }
  }

  await Settings.findOneAndUpdate(
    { key: 'service_prices' },
    { value: { ...DEFAULT_PRICES, ...prices } },
    { upsert: true, new: true }
  );

  res.json({ success: true, message: 'Prices updated!', prices: { ...DEFAULT_PRICES, ...prices } });
};

// Get shop info
const getShopInfo = async (req, res) => {
  let settings = await Settings.findOne({ key: 'shop_info' });
  if (!settings) {
    settings = await Settings.create({
      key: 'shop_info',
      value: { name: 'ClickQueue Photo Studio', phone: '', address: '', hours: '9 AM - 9 PM' },
    });
  }
  res.json(settings.value);
};

// Update shop info
const updateShopInfo = async (req, res) => {
  const { name, phone, address, hours } = req.body;
  await Settings.findOneAndUpdate(
    { key: 'shop_info' },
    { value: { name, phone, address, hours } },
    { upsert: true, new: true }
  );
  res.json({ success: true, message: 'Shop info updated!' });
};

module.exports = { getPrices, updatePrices, getShopInfo, updateShopInfo, Settings };
