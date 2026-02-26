const express = require('express');
const router = express.Router();
const { generateQR, downloadQR } = require('../controllers/qrController');
const { protect, ownerOnly } = require('../middleware/authMiddleware');

router.get('/generate', protect, ownerOnly, generateQR);
router.get('/download', protect, ownerOnly, downloadQR);

module.exports = router;
