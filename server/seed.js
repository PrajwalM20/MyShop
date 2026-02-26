/**
 * SEED SCRIPT — Run once to set up your ClickQueue database
 * Run from inside server/ folder: npm run seed
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('\n❌ MONGO_URI is not set!\n');
    console.error('Fix steps:');
    console.error('  1. Make sure server/.env file exists');
    console.error('  2. Open it with: notepad .env');
    console.error('  3. Set MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/clickqueue');
    console.error('  4. Save and run: npm run seed\n');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('MongoDB Connected');
};

const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, phone: String,
  password: String, role: String,
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  orderId: String, customer: { name: String, email: String, phone: String },
  photos: [{ url: String, publicId: String, originalName: String }],
  serviceType: String, quantity: Number, totalAmount: Number,
  paymentStatus: { type: String, default: 'paid' },
  paymentId: String, razorpayOrderId: String,
  orderStatus: { type: String, default: 'pending' },
  queueNumber: Number, notes: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);

const SAMPLE_ORDERS = [
  { name: 'Rahul Sharma',  email: 'rahul@gmail.com',  phone: '9876543210', service: 'passport',   qty: 4,  amount: 160, status: 'completed'  },
  { name: 'Priya Patel',   email: 'priya@gmail.com',  phone: '9876543211', service: 'school_id',  qty: 2,  amount: 120, status: 'ready'       },
  { name: 'Amit Kumar',    email: 'amit@gmail.com',   phone: '9876543212', service: 'print_4x6',  qty: 10, amount: 150, status: 'processing'  },
  { name: 'Sneha Reddy',   email: 'sneha@gmail.com',  phone: '9876543213', service: 'lamination', qty: 3,  amount: 150, status: 'pending'     },
  { name: 'Vikram Singh',  email: 'vikram@gmail.com', phone: '9876543214', service: 'print_a4',   qty: 2,  amount: 60,  status: 'pending'     },
  { name: 'Divya Nair',    email: 'divya@gmail.com',  phone: '9876543215', service: 'passport',   qty: 6,  amount: 240, status: 'completed'   },
  { name: 'Suresh Iyer',   email: 'suresh@gmail.com', phone: '9876543216', service: 'school_id',  qty: 1,  amount: 60,  status: 'completed'   },
  { name: 'Anjali Gupta',  email: 'anjali@gmail.com', phone: '9876543217', service: 'print_4x6',  qty: 5,  amount: 75,  status: 'processing'  },
];

const seed = async () => {
  await connectDB();
  console.log('\nStarting seed...\n');

  await User.deleteMany({});
  await Order.deleteMany({});
  console.log('Cleared existing data');

  const hashedPassword = await bcrypt.hash('KING123', 12);
  await User.create({
    name: 'UshaStudio',
    email: 'pm464582@gmail.com',
    phone: '9353588862',
    password: hashedPassword,
    role: 'owner',
  });
  console.log('Owner account created:');
  console.log('  Email:    pm464582@gmail.com');
  console.log('  Password: KING123\n');

  const orders = await Promise.all(
    SAMPLE_ORDERS.map((o, i) => {
      const daysAgo = Math.floor(Math.random() * 7);
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      return Order.create({
        orderId: 'CQ-SEED00' + (i + 1),
        customer: { name: o.name, email: o.email, phone: o.phone },
        photos: [{ url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', publicId: 'sample', originalName: 'sample.jpg' }],
        serviceType: o.service,
        quantity: o.qty,
        totalAmount: o.amount,
        paymentStatus: 'paid',
        paymentId: 'pay_seed_' + i,
        orderStatus: o.status,
        queueNumber: i + 1,
        createdAt,
      });
    })
  );

  const total = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  console.log('\nCreated ' + orders.length + ' sample orders');
  console.log('Total seeded revenue: Rs.' + total);
  console.log('\nSeed complete!');
  console.log('  1. Go back to root: cd ..');
  console.log('  2. Run: npm run dev');
  console.log('  3. Open: http://localhost:3000/login');
  console.log('  4. Login: owner@clickqueue.com / owner123\n');

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('Seed failed: ' + err.message);
  process.exit(1);
});