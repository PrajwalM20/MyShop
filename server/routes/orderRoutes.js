const express = require('express');
const router = express.Router();
const { createOrder, trackOrder, getPrice, getServices } = require('../controllers/orderController');
const { upload } = require('../config/cloudinary');

router.get('/services', getServices);
router.get('/price/:serviceType', getPrice);
router.post('/create', upload.array('photos', 20), createOrder);
router.get('/track/:orderId', trackOrder);

module.exports = router;
