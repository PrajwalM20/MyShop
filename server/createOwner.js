/**
 * createOwner.js
 * Run this ONCE from the server folder to create/fix the owner account:
 *   cd server
 *   node createOwner.js
 *
 * It will:
 *   1. Create owner account if it doesn't exist
 *   2. Fix existing account's role to 'owner' if it was set to 'customer'
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const OWNER_EMAIL    = 'pm464582@gmail.com';   // ← change if needed
const OWNER_PASSWORD = 'Usha@2025';            // ← change to your preferred password
const OWNER_NAME     = 'Prajwal';              // ← change to your name

async function main() {
  console.log('\n🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected\n');

  // Inline User schema — avoids import issues
  const userSchema = new mongoose.Schema({
    name:     String,
    email:    { type: String, unique: true },
    phone:    String,
    password: String,
    role:     { type: String, enum: ['owner','customer'], default: 'customer' },
  });
  userSchema.methods.matchPassword = async function(p) {
    return bcrypt.compare(p, this.password);
  };
  const User = mongoose.models.User || mongoose.model('User', userSchema);

  const existing = await User.findOne({ email: OWNER_EMAIL });

  if (existing) {
    if (existing.role === 'owner') {
      console.log(`✅ Owner account already exists: ${existing.email} (role: owner)`);
      console.log('   No changes needed.\n');
    } else {
      // Fix role
      existing.role = 'owner';
      await existing.save();
      console.log(`✅ Fixed! Updated role to "owner" for: ${existing.email}\n`);
    }
  } else {
    // Create fresh
    const hashed = await bcrypt.hash(OWNER_PASSWORD, 12);
    await User.create({
      name:     OWNER_NAME,
      email:    OWNER_EMAIL,
      phone:    '9353588862',
      password: hashed,
      role:     'owner',
    });
    console.log(`✅ Owner account created!`);
    console.log(`   Email:    ${OWNER_EMAIL}`);
    console.log(`   Password: ${OWNER_PASSWORD}`);
    console.log(`   Role:     owner\n`);
  }

  // Verify final state
  const verify = await User.findOne({ email: OWNER_EMAIL });
  console.log('📋 Final account state:');
  console.log(`   Name:  ${verify.name}`);
  console.log(`   Email: ${verify.email}`);
  console.log(`   Role:  ${verify.role}`);
  console.log('\n🔑 Now login at http://localhost:3000/login');
  console.log('   Use the email and password above.\n');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});