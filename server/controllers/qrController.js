const QRCode = require('qrcode');

// @GET /api/qr/generate
const generateQR = async (req, res) => {
  const shopUrl = process.env.SHOP_QR_URL || `${process.env.CLIENT_URL}/order`;

  const qrDataURL = await QRCode.toDataURL(shopUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    color: { dark: '#1a1a2e', light: '#FFFFFF' },
    width: 512,
  });

  res.json({ qrCode: qrDataURL, url: shopUrl });
};

// @GET /api/qr/download
const downloadQR = async (req, res) => {
  const shopUrl = process.env.SHOP_QR_URL || `${process.env.CLIENT_URL}/order`;

  const qrBuffer = await QRCode.toBuffer(shopUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    color: { dark: '#1a1a2e', light: '#FFFFFF' },
    width: 800,
  });

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', 'attachment; filename=clickqueue-qr.png');
  res.send(qrBuffer);
};

module.exports = { generateQR, downloadQR };
