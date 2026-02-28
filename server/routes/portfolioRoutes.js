const express = require('express');
const router = express.Router();
const { getPortfolio, addPortfolioItem, deletePortfolioItem, updatePortfolioItem } = require('../controllers/portfolioController');
const { protect, ownerOnly } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// Public
router.get('/', getPortfolio);

// Owner only
router.post('/', protect, ownerOnly, upload.single('image'), addPortfolioItem);
router.put('/:id', protect, ownerOnly, updatePortfolioItem);
router.delete('/:id', protect, ownerOnly, deletePortfolioItem);

module.exports = router;