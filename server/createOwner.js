/**
 * CREATE OWNER — Quick script to create your owner account
 * Run: node createOwner.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── YOUR DETAILS — CHANGE THESE ───────────────────────────────────────────────
const OWNER_NAME     = 'Prajwal';
const OWNER_EMAIL    = 'pm464582@gmail.com';
const OWNER_PHONE    = '9353588862';
const OWNER_PASSWORD = 'KING123';
// ─────────────────────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  role: String,
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model('User', userSchema);

const run = async () => {
  if (!process.env.MONGO_URI) {
    console.error('\nMONGO_URI not set in .env file!\n');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected!\n');

  // Delete existing owner with same email if any
  await User.deleteOne({ email: OWNER_EMAIL });

  // Create fresh owner
  const owner = new User({
    name: OWNER_NAME,
    email: OWNER_EMAIL,
    phone: OWNER_PHONE,
    password: OWNER_PASSWORD,
    role: 'owner',
  });

  await owner.save();

  console.log('===================================');
  console.log('  Owner account created!');
  console.log('===================================');
  console.log('  Name:     ' + OWNER_NAME);
  console.log('  Email:    ' + OWNER_EMAIL);
  console.log('  Password: ' + OWNER_PASSWORD);
  console.log('  Role:     owner');
  console.log('===================================');
  console.log('\n  Go to: http://localhost:3000/login');
  console.log('  Use the email and password above\n');

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Failed: ' + err.message);
  process.exit(1);
});