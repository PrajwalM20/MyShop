const QRCode  = require('qrcode');
const { Settings } = require('./settingsController');

const QR_OPTS = { errorCorrectionLevel: 'H', margin: 2, color: { dark: '#1a1a2e', light: '#FFFFFF' }, width: 512 };

// Helper — get shop name from DB
const getShopName = async () => {
  try {
    const s = await Settings.findOne({ key: 'shop_info' });
    return s?.value?.name || process.env.SHOP_NAME || 'Usha Photo Studio';
  } catch { return process.env.SHOP_NAME || 'Usha Photo Studio'; }
};

// GET /api/qr/generate — Owner QR → points to /order (full site)
const generateQR = async (req, res) => {
  try {
    const url      = process.env.SHOP_QR_URL || `${process.env.CLIENT_URL}/order`;
    const shopName = await getShopName();
    const qrCode   = await QRCode.toDataURL(url, QR_OPTS);
    res.json({ qrCode, url, shopName, type: 'owner' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/qr/client — Client QR → points to /client-dashboard (client pages only)
const generateClientQR = async (req, res) => {
  try {
    const baseUrl  = process.env.CLIENT_URL || 'http://localhost:3000';
    const url      = `${baseUrl}/client-dashboard`;
    const shopName = await getShopName();
    const qrCode   = await QRCode.toDataURL(url, QR_OPTS);
    res.json({ qrCode, url, shopName, type: 'client' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/qr/download — download owner QR as PNG
const downloadQR = async (req, res) => {
  try {
    const url    = process.env.SHOP_QR_URL || `${process.env.CLIENT_URL}/order`;
    const buffer = await QRCode.toBuffer(url, { ...QR_OPTS, width: 800 });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename=shop-qr.png');
    res.send(buffer);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/qr/download-client — download client QR as PNG
const downloadClientQR = async (req, res) => {
  try {
    const url    = `${process.env.CLIENT_URL || 'http://localhost:3000'}/client-dashboard`;
    const buffer = await QRCode.toBuffer(url, { ...QR_OPTS, width: 800 });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename=client-qr.png');
    res.send(buffer);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { generateQR, generateClientQR, downloadQR, downloadClientQR };