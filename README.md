# 📸 ClickQueue — Smart Photo Studio Order Management System

> Skip the queue. Not the photos.

A full-stack digital order management system for photo studios. Customers scan a QR code, upload photos, pay via UPI/GPay/PhonePe, and receive WhatsApp + SMS + Email notifications when their order is ready.

---

## 🏗️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React.js + React Router |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose) |
| File Storage | Cloudinary |
| Payments | Razorpay (UPI, GPay, PhonePe) |
| Email | Nodemailer (Gmail) |
| SMS | Twilio |
| WhatsApp | Twilio WhatsApp API |
| Auth | JWT + bcrypt |

---

## 📂 Project Structure

```
clickqueue/
├── server/                    # Node.js + Express Backend
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   ├── cloudinary.js      # Cloudinary + Multer setup
│   │   └── notifications.js   # Email + SMS + WhatsApp
│   ├── controllers/
│   │   ├── authController.js  # Register, Login, GetMe
│   │   ├── orderController.js # Create, Track orders
│   │   ├── ownerController.js # Dashboard, Update status
│   │   ├── paymentController.js # Razorpay integration
│   │   └── qrController.js   # QR code generation
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT + Owner auth
│   ├── models/
│   │   ├── User.js            # User schema
│   │   └── Order.js           # Order schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── ownerRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── qrRoutes.js
│   ├── .env.example           # Copy to .env and fill values
│   └── index.js               # Server entry point
│
└── client/                    # React Frontend
    ├── public/
    │   └── index.html         # HTML template (Razorpay script included)
    └── src/
        ├── components/
        │   └── Navbar.jsx
        ├── context/
        │   └── AuthContext.jsx
        ├── pages/
        │   ├── HomePage.jsx        # Landing page with services
        │   ├── OrderPage.jsx       # 3-step order form + payment
        │   ├── ConfirmationPage.jsx
        │   ├── TrackPage.jsx       # Order tracking
        │   ├── OwnerDashboard.jsx  # Full dashboard + analytics
        │   ├── LoginPage.jsx
        │   └── RegisterPage.jsx
        ├── styles/
        │   └── global.css          # Black/Gold design system
        ├── utils/
        │   └── api.js             # Axios with JWT interceptor
        └── App.jsx                # Router setup
```

---

## 🚀 Setup Instructions

### Step 1: Clone & Install

```bash
# Install all dependencies (root + server + client)
npm run install:all
```

### Step 2: Configure Environment Variables

```bash
cd server
cp .env.example .env
```

Open `.env` and fill in your keys:

#### MongoDB
1. Create free cluster at [mongodb.com](https://www.mongodb.com)
2. Get connection string → paste as `MONGO_URI`

#### Cloudinary
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get Cloud Name, API Key, API Secret from dashboard

#### Razorpay (UPI/GPay/PhonePe)
1. Sign up at [razorpay.com](https://razorpay.com)
2. Go to Settings → API Keys → Generate Key
3. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`

#### Gmail (Nodemailer)
1. Enable 2FA on your Gmail
2. Go to Google Account → Security → App Passwords
3. Generate password for "Mail" → use as `EMAIL_PASS`

#### Twilio (SMS + WhatsApp)
1. Sign up at [twilio.com](https://www.twilio.com)
2. Get Account SID and Auth Token
3. For WhatsApp: join Twilio Sandbox → [twilio.com/console/sms/whatsapp/sandbox](https://www.twilio.com/console/sms/whatsapp/sandbox)

### Step 3: Run the App

```bash
# Run both server and client together (from root)
npm run dev

# Or run separately:
npm run server    # Backend on :5000
npm run client    # Frontend on :3000
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register user |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/auth/me` | ✅ | Get current user |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/orders/services` | ❌ | Get all services + prices |
| POST | `/api/orders/create` | ❌ | Create order (multipart) |
| GET | `/api/orders/track/:orderId` | ❌ | Track order by ID |

### Payment
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payment/create-order` | ❌ | Create Razorpay order |
| POST | `/api/payment/verify` | ❌ | Verify payment |
| POST | `/api/payment/webhook` | ❌ | Razorpay webhook |

### Owner (Protected)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/owner/dashboard` | 👑 | Stats + chart data |
| GET | `/api/owner/orders` | 👑 | All orders (filterable) |
| GET | `/api/owner/orders/export` | 👑 | Export CSV |
| GET | `/api/owner/orders/:id` | 👑 | Order detail |
| PUT | `/api/owner/orders/:id/status` | 👑 | Update status |

### QR
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/qr/generate` | 👑 | Generate QR (base64) |
| GET | `/api/qr/download` | 👑 | Download QR as PNG |

---

## 💰 Service Pricing

| Service | Price |
|---------|-------|
| Passport Size Photo | ₹40/pc |
| Photo Print 4×6 | ₹15/pc |
| Photo Print A4 | ₹30/pc |
| Lamination | ₹50/pc |
| School ID Card Photo | ₹60/pc |

> To change prices, edit `SERVICE_PRICES` in `server/controllers/orderController.js`

---

## 🔄 Customer Workflow

1. **Scan QR** outside shop → opens `yoursite.com/order`
2. **Fill contact info** (name, email, phone)
3. **Upload photos** (drag & drop, up to 20 files)
4. **Select service** + quantity
5. **Pay via UPI** (GPay, PhonePe, Paytm)
6. **Receive** Order ID + Queue Number
7. **Get notified** via WhatsApp + SMS + Email when ready
8. **Pickup** photos at counter with Order ID

---

## 👑 Owner Workflow

1. **Register** at `/register` with role = "Owner"
2. **Login** at `/login`
3. **Dashboard** at `/owner/dashboard`:
   - View stats (today's orders, pending, revenue)
   - Bar chart of last 7 days revenue
   - Filter orders by status
   - Update order status (Pending → Processing → Ready → Completed)
   - When marked "Ready" → customer auto-notified via all channels
4. **Generate QR** code → print & paste outside shop
5. **Export CSV** for accounting

---

## 🔒 Security

- JWT authentication with 30-day expiry
- bcrypt password hashing (12 rounds)
- Razorpay payment signature verification (HMAC SHA256)
- File type + size validation (JPG/PNG only, max 10MB)
- Role-based access control (owner vs customer)

---

## 📱 Pages

| URL | Page | Access |
|-----|------|--------|
| `/` | Home / Landing | Public |
| `/order` | Place Order | Public |
| `/confirmation/:orderId` | Order Confirmation | Public |
| `/track` | Track Order | Public |
| `/track/:orderId` | Track Specific Order | Public |
| `/owner/dashboard` | Owner Dashboard | Owner only |
| `/login` | Login | Public |
| `/register` | Register | Public |

---

## 🎨 Design

- **Theme**: Luxury Black + Gold (photo studio aesthetic)
- **Fonts**: Playfair Display (headings) + DM Sans (body)
- **Mobile**: Fully responsive
- **Animations**: Smooth fade-in transitions

---

## 📊 Resume Description

> **ClickQueue** — Built a full-stack QR-based Digital Order Management System for Photography Studios using React.js, Node.js, Express, MongoDB, and Cloudinary. Integrated Razorpay UPI payment gateway (GPay, PhonePe) with HMAC signature verification. Implemented multi-channel customer notifications via Nodemailer (Email), Twilio (SMS), and WhatsApp API. Features real-time order tracking, queue management, owner analytics dashboard with revenue charts, CSV export, and JWT-based role authentication.

---

Built with ❤️ | ClickQueue — Smart Photo Queue System
