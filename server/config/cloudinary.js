const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'placeholder',
  api_key: process.env.CLOUDINARY_API_KEY || 'placeholder',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'placeholder',
});

// Use local disk storage instead of CloudinaryStorage
// (avoids multer-storage-cloudinary version conflict)
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG/PNG images are allowed'), false);
  },
});

// Upload file to Cloudinary (called manually after multer saves to disk)
const uploadToCloudinary = async (filePath) => {
  const isConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

  if (!isConfigured) {
    // Return local path as URL if Cloudinary not configured
    return {
      url: `http://localhost:5000/uploads/${path.basename(filePath)}`,
      publicId: path.basename(filePath),
    };
  }

  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'clickqueue/orders',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  });

  // Delete local file after uploading to Cloudinary
  fs.unlink(filePath, () => {});

  return { url: result.secure_url, publicId: result.public_id };
};

module.exports = { cloudinary, upload, uploadToCloudinary };