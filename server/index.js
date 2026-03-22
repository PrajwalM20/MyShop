const express  = require('express');
const cors     = require('cors');
const dotenv   = require('dotenv');
const path     = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// ── Request logger ─────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`️  ${req.method} ${req.originalUrl}`);
  next();
});

// ── CORS ───────────────────────────────────────────────────────
app.use(cors({
  origin: '*',       // allow all in development
  credentials: true,
}));

// ── Body parsers ───────────────────────────────────────────────
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes (each wrapped so one bad file won't crash all) ──────
const routes = [
  ['/api/auth',      './routes/authRoutes'],
  ['/api/orders',    './routes/orderRoutes'],
  ['/api/payment',   './routes/paymentRoutes'],
  ['/api/owner',     './routes/ownerRoutes'],
  ['/api/qr',        './routes/qrRoutes'],
  ['/api/settings',  './routes/settingsRoutes'],
  ['/api/portfolio', './routes/portfolioRoutes'],
  ['/api/feedback',  './routes/feedbackRoutes'],
  ['/api/bookings',  './routes/bookingRoutes'],
  ['/api/about',     './routes/aboutRoutes'],
];

for (const [routePath, file] of routes) {
  try {
    app.use(routePath, require(file));
    console.log(` Route loaded: ${routePath}`);
  } catch (err) {
    console.error(` Route FAILED: ${routePath} — ${err.message}`);
  }
}

// ── Health checks ──────────────────────────────────────────────
app.get('/',    (req, res) => res.json({ message: 'ClickQueue API Running ', status: 'ok' }));
app.get('/api', (req, res) => res.json({ message: 'API OK ', status: 'ok' }));

// ── Global error handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(' Error:', err.message);
  res.status(500).json({ message: err.message || 'Server Error' });
});

// ── Start — always port 5000 ───────────────────────────────────
const PORT = 5000;   // fixed — never reads from .env so it can't jump

const server = app.listen(PORT, () => {
  console.log('');
  console.log(' ══════════════════════════════════════');
  console.log(`  Server  →  http://localhost:${PORT}`);
  console.log(`  API     →  http://localhost:${PORT}/api`);
  console.log(' ══════════════════════════════════════');
  console.log('');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('');
    console.error(' ══════════════════════════════════════');
    console.error(`  Port ${PORT} is already in use!`);
    console.error(' ══════════════════════════════════════');
    console.error('');
    console.error('  Open a NEW terminal and run:');
    console.error('');
    console.error(`    npx kill-port ${PORT}`);
    console.error('');
    console.error('  Then come back and run:  npm run dev');
    console.error('');
  } else {
    console.error(' Server error:', err.message);
  }
  process.exit(1);
});