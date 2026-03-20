const express = require('express');
const router  = express.Router();
const { generateQR, generateClientQR, downloadQR, downloadClientQR } = require('../controllers/qrController');
const { protect, ownerOnly } = require('../middleware/authMiddleware');

// Owner QR — protected
router.get('/generate',        protect, ownerOnly, generateQR);
router.get('/download',        protect, ownerOnly, downloadQR);

// Client QR — public (used in ClientDashboard)
router.get('/client',          generateClientQR);
router.get('/download-client', downloadClientQR);

module.exports = router;