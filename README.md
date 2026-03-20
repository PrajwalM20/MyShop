<div align="center">

# ClickQueue — Usha Photo Studio

### Smart Photo Order Management System

**Skip the Queue. Not the Photos.**
---

##  What is ClickQueue?

ClickQueue is a **full-stack digital order management system** built for **Usha Photo Studio, Nanjangud, Karnataka**. It eliminates physical queues by letting customers order online via QR code.

**How it works:**
1. Customer scans QR code outside the shop
2. Uploads photos from their phone
3. Selects services (passport photos, prints, lamination, etc.)
4. Pays via UPI (GPay / PhonePe / Paytm)
5. Gets WhatsApp notification when order is ready
6. Picks up without waiting in queue

---

##  Features

###  Customer Side
-  **Online Orders** — Upload photos, select services, pay via UPI
-  **Order Tracking** — Real-time status with timeline
-  **Event Booking** — Book sessions for weddings, ceremonies, outdoor shoots
-  **Portfolio Gallery** — Browse studio work by category
-  **Feedback System** — Star ratings, tags, comments
-  **Client Dashboard** — All services in one place with shareable QR
-  **WhatsApp Alerts** — Instant notification when order is ready

###  Owner Side
-  **Dashboard** — Today's orders, pending count, revenue chart
-  **PIN Lock** — Revenue and amount columns locked by default
-  **Order Management** — View, update, filter, bulk delete, export CSV
-  **Booking Calendar** — Morning / Afternoon / Evening time slots
-  **Accept / Decline** — Approve pending booking requests
-  **Feedback Viewer** — Rating breakdown, tag cloud, individual reviews
-  **Portfolio Manager** — Upload, feature, delete portfolio photos
-  **About Us Editor** — Studio info, owner profile, logo, contact details
-  **Settings** — Live service pricing, shop info
-  **Dual QR Codes** — Separate QR for clients and owners

---

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + React Router v6 |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| Authentication | JWT + bcrypt |
| File Storage | Cloudinary |
| Payments | Razorpay (UPI / GPay / PhonePe / Paytm) |
| Notifications | Nodemailer (Email) + Twilio (SMS + WhatsApp) |
| Charts | Recharts |
| QR Codes | qrcode npm package |
| Design | Custom Black & Gold — Playfair Display + DM Sans |

---

##  Project Structure

```
MyShop/
├── package.json              ← Root — run npm run dev from here
├── server/
│   ├── index.js              ← Express server (port 5000)
│   ├── .env                  ← Environment variables (never commit)
│   ├── createOwner.js        ← One-time owner account setup
│   ├── config/
│   │   ├── db.js             ← MongoDB connection
│   │   ├── cloudinary.js     ← File upload config
│   │   └── notifications.js  ← Email + SMS + WhatsApp
│   ├── middleware/
│   │   └── authMiddleware.js ← JWT + role-based access
│   ├── models/
│   │   ├── Order.js
│   │   └── Portfolio.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── orderController.js
│   │   ├── ownerController.js
│   │   ├── paymentController.js
│   │   ├── portfolioController.js
│   │   ├── qrController.js
│   │   └── settingsController.js
│   └── routes/
│       ├── authRoutes.js
│       ├── orderRoutes.js
│       ├── ownerRoutes.js
│       ├── paymentRoutes.js
│       ├── portfolioRoutes.js
│       ├── feedbackRoutes.js
│       ├── bookingRoutes.js
│       ├── aboutRoutes.js
│       ├── settingsRoutes.js
│       └── qrRoutes.js
└── client/
    ├── package.json
    ├── public/
    │   ├── index.html
    │   └── logo.svg
    └── src/
        ├── App.jsx
        ├── setupProxy.js
        ├── context/
        │   └── AuthContext.jsx
        ├── utils/
        │   ├── api.js
        │   └── useBlockZoom.js
        ├── components/
        │   └── Navbar.jsx
        ├── styles/
        │   └── global.css
        └── pages/
            ├── HomePage.jsx
            ├── OrderPage.jsx
            ├── ConfirmationPage.jsx
            ├── TrackPage.jsx
            ├── CalendarPage.jsx
            ├── PortfolioPage.jsx
            ├── AboutPage.jsx
            ├── FeedbackPage.jsx
            ├── ClientDashboard.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── OwnerDashboard.jsx
            ├── DataManagerPage.jsx
            ├── ManagePortfolioPage.jsx
            ├── ManageAboutPage.jsx
            ├── OwnerFeedbackPage.jsx
            ├── SettingsPage.jsx
            └── QRPosterPage.jsx
```

---

##  Getting Started

### Prerequisites
- Node.js v16+
- MongoDB Atlas account
- Cloudinary account
- Razorpay account

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/clickqueue.git
cd clickqueue

# 2. Install dependencies
cd server && npm install
cd ../client && npm install
cd ..

# 3. Set up environment variables
cp server/.env.example server/.env
# Fill in your keys in server/.env

# 4. Create owner account
cd server && node createOwner.js
# Edit createOwner.js with your details first

# 5. Start the app
npm run dev
```

### Available Scripts

```bash
npm run dev      # Kill ports + start server & client together
npm run kill     # Kill ports 3000 and 5000
```

---

##  All Routes

### Public Pages
| Route | Page |
|-------|------|
| `/` | Homepage |
| `/order` | Place Order |
| `/track` | Track Order |
| `/calendar` | Booking Calendar |
| `/portfolio` | Our Work |
| `/about` | About Us |
| `/feedback` | Give Feedback |
| `/client-dashboard` | Client Dashboard |

### Owner Pages (authentication required)
| Route | Page |
|-------|------|
| `/owner/dashboard` | Dashboard & Analytics |
| `/owner/data` | Data Manager |
| `/owner/portfolio` | Portfolio Manager |
| `/owner/about` | About Us Editor |
| `/owner/calendar` | Manage Bookings |
| `/owner/feedback` | Feedback Viewer |
| `/owner/settings` | Settings & Pricing |
| `/owner/qr-poster` | QR Code Posters |

---

## 🔌 API Reference

### Auth
```
POST   /api/auth/login          Login
POST   /api/auth/register       Register
GET    /api/auth/me             Current user
```

### Orders
```
GET    /api/orders/services     Get services & prices
POST   /api/orders/create       Create order (multipart)
GET    /api/orders/track/:id    Track order
```

### Payments
```
POST   /api/payment/create-order   Create Razorpay order
POST   /api/payment/verify         Verify payment
```

### Bookings
```
GET    /api/bookings               Get month bookings
POST   /api/bookings               Book a slot (→ pending)
PUT    /api/bookings/:date/:slot   Owner: accept / block
DELETE /api/bookings/:date/:slot   Owner: clear slot
```

### Owner (protected)
```
GET    /api/owner/dashboard          Stats + chart
GET    /api/owner/orders             All orders
GET    /api/owner/orders/export      Export CSV
PUT    /api/owner/orders/:id/status  Update status
```

### Settings & Content
```
GET    /api/settings/services     Live services & prices
GET    /api/settings/shop-info    Shop name, hours, phone
GET    /api/about                 Studio + owner + contact
GET    /api/portfolio             Portfolio items
POST   /api/feedback              Submit feedback
GET    /api/qr/client             Client QR code
GET    /api/qr/generate           Owner QR code
```

---

##  Booking Flow

```
Client selects date
    ↓
Picks time slot → Morning (8AM–12PM) / Afternoon (12–4PM) / Evening (4–8PM)
    ↓
Fills details → Name · Phone · Address · Event Type · Notes
    ↓
Reviews & submits → Status: PENDING 
    ↓
Owner sees pending request on calendar
Owner clicks  Accept → Status: BOOKED
         or   Decline → Slot: FREE 
```

---

##  Services Offered

### Photo Services (Order Online)
| Service | Unit |
|---------|------|
| Passport Size Photo | Set of 8 |
| Photo Print 4×6 | Set of 4 |
| Photo Print 5×7 | Per piece |
| Photo Print A4 | Per piece |
| Lamination (Normal) | Per piece |
| Lamination (Fiber) | Per piece |
| School ID Photo | Per piece |
| Flex Banner | Per sq.ft |

### Event Photography (Booking Required)
| Event |
|-------|
|  Wedding Photography |
|  House Warming / Seremani |
|  Baby Shower / Simantha |
|  Outdoor Shoot |
|  Pre-Wedding Shoot |
|  Birthday Party |
|  Graduation |
|  Portrait Session |

> All prices are managed live from Owner Tools → Settings

---

##  Dual QR Code System

| QR Type | Destination | Purpose |
|---------|-------------|---------|
|  Client QR | `/client-dashboard` | Print outside shop — customers scan |
|  Owner QR | `/order` | Direct order page link |

---

##  Design System

- **Theme:** Luxury Black (`#0D0D1A`) + Gold (`#D4AF37`)
- **Headings:** Playfair Display
- **Body:** DM Sans
- **Fully responsive** — optimized for mobile (primary device for customers)
- **Zoom locked** — prevents accidental pinch zoom on touch devices
- **Font size minimum 16px** on inputs (prevents iOS auto-zoom)

---

##  Architecture Highlights

- **Role-based access** — `protect` + `ownerOnly` middleware on all owner routes
- **Dynamic logo** — loaded from Cloudinary via `/api/about`, inline SVG fallback
- **Per-route error handling** — one broken route doesn't crash the server
- **Port 5000 hardcoded** — prevents silent port jumping that breaks the proxy
- **Proxy setup** — `setupProxy.js` forwards all `/api` calls to port 5000
- **Auto-refresh dashboard** — polls every 30 seconds, shows last refresh time
- **Pending booking state** — client requests go pending, owner must accept

---

##  Environment Variables

Create `server/.env` from `server/.env.example`:

```env
PORT=5000
MONGO_URI=             # MongoDB Atlas connection string
JWT_SECRET=            # Any long random string
CLOUDINARY_CLOUD_NAME= # From cloudinary.com
CLOUDINARY_API_KEY=    # From cloudinary.com
CLOUDINARY_API_SECRET= # From cloudinary.com
EMAIL_USER=            # Gmail address
EMAIL_PASS=            # Gmail App Password
RAZORPAY_KEY_ID=       # From razorpay.com
RAZORPAY_KEY_SECRET=   # From razorpay.com
CLIENT_URL=http://localhost:3000
SHOP_NAME=Usha Photo Studio
```

---

##  Deployment

| Service | Platform |
|---------|----------|
| Backend | Railway |
| Frontend | Vercel |
| Database | MongoDB Atlas |
| Images | Cloudinary |

> Update `CLIENT_URL` and `SHOP_QR_URL` in `.env` to your production URLs before deploying.

---

##  .gitignore

Make sure these are never committed:
```
.env
node_modules/
client/build/
server/uploads/
```

---

<div align="center">

Built with  for **Usha Photo Studio**, Nanjangud, Karnataka 🇮🇳

*Capturing Moments Forever*

</div>