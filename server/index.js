const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Simple request debug logger
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`);
  next();
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/orders',    require('./routes/orderRoutes'));
app.use('/api/payment',   require('./routes/paymentRoutes'));
app.use('/api/owner',     require('./routes/ownerRoutes'));
app.use('/api/qr',        require('./routes/qrRoutes'));
app.use('/api/settings',  require('./routes/settingsRoutes'));
app.use('/api/portfolio', require('./routes/portfolioRoutes'));
app.use('/api/feedback',  require('./routes/feedbackRoutes'));
app.use('/api/bookings',  require('./routes/bookingRoutes'));
app.use('/api/about',     require('./routes/aboutRoutes'));

app.get('/', (req, res) => res.json({ message: 'ClickQueue API Running 🚀' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Server Error' });
});

const startServer = (port) => {
  const server = app.listen(port, () => console.log(`✅ Server running on port ${port}`));
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} in use. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });
};

const PORT = parseInt(process.env.PORT, 10) || 5000;
startServer(PORT);