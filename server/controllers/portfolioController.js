const Portfolio = require('../models/Portfolio');
const { uploadToCloudinary } = require('../config/cloudinary');
const fs = require('fs');

// @GET /api/portfolio  (public)
const getPortfolio = async (req, res) => {
  const { category } = req.query;
  const filter = {};
  if (category && category !== 'all') filter.category = category;
  const items = await Portfolio.find(filter).sort({ featured: -1, order: 1, createdAt: -1 });
  res.json(items);
};

// @POST /api/portfolio  (owner only)
const addPortfolioItem = async (req, res) => {
  const { title, category, description, featured } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ message: 'Image is required' });

  const result = await uploadToCloudinary(file.path);

  const item = await Portfolio.create({
    title,
    category: category || 'other',
    imageUrl: result.url,
    publicId: result.publicId,
    description,
    featured: featured === 'true',
  });

  res.status(201).json(item);
};

// @DELETE /api/portfolio/:id  (owner only)
const deletePortfolioItem = async (req, res) => {
  const item = await Portfolio.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  await item.deleteOne();
  res.json({ success: true, message: 'Deleted successfully' });
};

// @PUT /api/portfolio/:id  (owner only)
const updatePortfolioItem = async (req, res) => {
  const item = await Portfolio.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) return res.status(404).json({ message: 'Item not found' });
  res.json(item);
};

module.exports = { getPortfolio, addPortfolioItem, deletePortfolioItem, updatePortfolioItem };