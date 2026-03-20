const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, ownerOnly } = require('../middleware/authMiddleware');
const multer = require('multer');
const { uploadToCloudinary } = require('../config/cloudinary');
const upload = multer({ dest: 'uploads/' });

const aboutSchema = new mongoose.Schema({
  key:          { type: String, unique: true, default: 'about' },
  title:        { type: String, default: 'About Usha Photo Studio' },
  description:  { type: String, default: 'We are a professional photo studio in Nanjangud, capturing your precious moments.' },
  ownerName:    { type: String, default: '' },
  ownerRole:    { type: String, default: 'Founder & Photographer' },
  ownerBio:     { type: String, default: '' },
  ownerImageUrl:{ type: String, default: '' },
  ownerPublicId:{ type: String, default: '' },
  logoUrl:      { type: String, default: '' },
  logoPublicId: { type: String, default: '' },
  imageUrl:     { type: String, default: '' },
  publicId:     { type: String, default: '' },
  founded:      { type: String, default: '2010' },
  location:     { type: String, default: 'Nanjangud, Karnataka' },
  tagline:      { type: String, default: 'Capturing Moments Forever' },
  phone:        { type: String, default: '' },
  whatsapp:     { type: String, default: '' },
  email:        { type: String, default: '' },
  instagram:    { type: String, default: '' },
  facebook:     { type: String, default: '' },
}, { timestamps: true });

const About = mongoose.models.About || mongoose.model('About', aboutSchema);

// GET /api/about — public
router.get('/', async (req, res) => {
  try {
    let a = await About.findOne({ key: 'about' });
    if (!a) a = await About.create({ key: 'about' });
    res.json(a);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/about — owner text fields
router.put('/', protect, ownerOnly, async (req, res) => {
  try {
    const fields = ['title','description','ownerName','ownerRole','ownerBio',
                    'founded','location','tagline','phone','whatsapp','email','instagram','facebook'];
    const update = {};
    fields.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
    const a = await About.findOneAndUpdate({ key: 'about' }, { $set: update }, { upsert: true, new: true });
    res.json({ success: true, about: a });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/about/image — studio photo
router.post('/image', protect, ownerOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' });
    const result = await uploadToCloudinary(req.file.path);
    const a = await About.findOneAndUpdate(
      { key: 'about' },
      { $set: { imageUrl: result.url, publicId: result.publicId } },
      { upsert: true, new: true }
    );
    res.json({ success: true, imageUrl: result.url, about: a });
  } catch (err) {
    console.error('Studio photo upload error:', err.message);
    res.status(500).json({ message: 'Upload failed: ' + err.message });
  }
});

// POST /api/about/owner-image — owner photo
router.post('/owner-image', protect, ownerOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' });
    const result = await uploadToCloudinary(req.file.path);
    const a = await About.findOneAndUpdate(
      { key: 'about' },
      { $set: { ownerImageUrl: result.url, ownerPublicId: result.publicId } },
      { upsert: true, new: true }
    );
    res.json({ success: true, imageUrl: result.url, about: a });
  } catch (err) {
    console.error('Owner photo upload error:', err.message);
    res.status(500).json({ message: 'Upload failed: ' + err.message });
  }
});

// POST /api/about/logo — shop logo
router.post('/logo', protect, ownerOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' });
    const result = await uploadToCloudinary(req.file.path);
    const a = await About.findOneAndUpdate(
      { key: 'about' },
      { $set: { logoUrl: result.url, logoPublicId: result.publicId } },
      { upsert: true, new: true }
    );
    res.json({ success: true, logoUrl: result.url, about: a });
  } catch (err) {
    console.error('Logo upload error:', err.message);
    res.status(500).json({ message: 'Upload failed: ' + err.message });
  }
});

module.exports = router;