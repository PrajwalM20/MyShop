const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, ownerOnly } = require('../middleware/authMiddleware');
const multer = require('multer');
const { uploadToCloudinary } = require('../config/cloudinary');
const upload = multer({ dest: 'uploads/' });

const aboutSchema = new mongoose.Schema({
  key:   { type: String, unique: true, default: 'about' },
  title: { type: String, default: 'About Usha Photo Studio' },
  description: { type: String, default: 'We are a professional photo studio located in Nanjangud, capturing your precious moments with the finest quality. With years of experience in photography and printing, we provide top-notch services at honest prices.' },
  imageUrl:  { type: String, default: '' },
  publicId:  { type: String, default: '' },
  founded:   { type: String, default: '2010' },
  location:  { type: String, default: 'Nanjangud, Karnataka' },
  tagline:   { type: String, default: 'Capturing Moments Forever' },
}, { timestamps: true });

const About = mongoose.models.About || mongoose.model('About', aboutSchema);

// GET /api/about — public
router.get('/', async (req, res) => {
  try {
    let about = await About.findOne({ key: 'about' });
    if (!about) about = await About.create({ key: 'about' });
    res.json(about);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/about — owner updates text fields
router.put('/', protect, ownerOnly, async (req, res) => {
  try {
    const { title, description, founded, location, tagline } = req.body;
    const about = await About.findOneAndUpdate(
      { key: 'about' },
      { $set: { title, description, founded, location, tagline } },
      { upsert: true, new: true }
    );
    res.json({ success: true, about });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/about/image — owner uploads about photo
router.post('/image', protect, ownerOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' });
    const result = await uploadToCloudinary(req.file.path);
    const about = await About.findOneAndUpdate(
      { key: 'about' },
      { $set: { imageUrl: result.url, publicId: result.publicId } },
      { upsert: true, new: true }
    );
    res.json({ success: true, imageUrl: result.url, about });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;