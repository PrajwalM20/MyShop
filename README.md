Here is your **clean, professional, emoji-free README.md** — polished and ready for GitHub, resume, or submission:

---

# ClickQueue — Usha Photo Studio

### Smart Photo Order Management System

**Skip the Queue. Not the Photos.**

---

## Overview

ClickQueue is a full-stack digital order and booking system built for **Usha Photo Studio, Nanjangud, Karnataka**.

It replaces physical queues with a QR-based ordering system, allowing customers to upload photos, pay online, and collect orders without waiting.

---

## How It Works

1. Customer scans QR code outside the shop
2. Uploads photos from mobile
3. Selects services (prints, passport photos, etc.)
4. Pays via UPI (GPay / PhonePe / Paytm)
5. Receives WhatsApp notification
6. Picks up order without waiting

---

## Features

### Customer Side

* Online photo upload and ordering
* Real-time order tracking
* Event booking (wedding, shoots, etc.)
* Portfolio browsing
* Feedback system (ratings and comments)
* Client dashboard with QR access
* WhatsApp notifications

---

### Owner Side

* Dashboard (orders, revenue, analytics)
* Secure PIN lock for financial data
* Order management (filter, update, export CSV)
* Booking calendar with time slots
* Accept or decline booking requests
* Feedback analytics (tags and ratings)
* Portfolio manager
* About section editor
* Live pricing and settings control
* Dual QR code system

---

## Tech Stack

| Layer          | Technology                 |
| -------------- | -------------------------- |
| Frontend       | React 18 + React Router v6 |
| Backend        | Node.js + Express.js       |
| Database       | MongoDB Atlas + Mongoose   |
| Authentication | JWT + bcrypt               |
| File Storage   | Cloudinary                 |
| Payments       | Razorpay                   |
| Notifications  | Nodemailer + Twilio        |
| Charts         | Recharts                   |
| QR Codes       | qrcode                     |
| Design         | Black and Gold Theme       |

---

## Project Structure

```bash
clickqueue/
│
├── server/
│   ├── config/
│   │   ├── db.js
│   │   ├── cloudinary.js
│   │   └── notifications.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── orderController.js
│   │   ├── ownerController.js
│   │   ├── paymentController.js
│   │   ├── portfolioController.js
│   │   ├── qrController.js
│   │   └── settingsController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │   ├── Order.js
│   │   └── Portfolio.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── ownerRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── portfolioRoutes.js
│   │   ├── feedbackRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── aboutRoutes.js
│   │   ├── settingsRoutes.js
│   │   └── qrRoutes.js
│   │
│   ├── createOwner.js
│   ├── index.js
│   └── .env
│
├── client/
│   ├── public/
│   │   ├── index.html
│   │   └── logo.svg
│   │
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── OrderPage.jsx
│   │   │   ├── TrackPage.jsx
│   │   │   ├── CalendarPage.jsx
│   │   │   ├── PortfolioPage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   ├── FeedbackPage.jsx
│   │   │   ├── ClientDashboard.jsx
│   │   │   ├── OwnerDashboard.jsx
│   │   │   ├── DataManagerPage.jsx
│   │   │   ├── ManagePortfolioPage.jsx
│   │   │   ├── ManageAboutPage.jsx
│   │   │   ├── OwnerFeedbackPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── QRPosterPage.jsx
│   │   │
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   └── useBlockZoom.js
│   │   │
│   │   ├── App.jsx
│   │   └── setupProxy.js
│
├── package.json
└── README.md
```

---

## Installation

```bash
git clone https://github.com/yourusername/clickqueue.git
cd clickqueue

cd server && npm install
cd ../client && npm install
cd ..
```

---

## Environment Variables

Create `server/.env`

```env
PORT=5000
MONGO_URI=
JWT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

EMAIL_USER=
EMAIL_PASS=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

CLIENT_URL=http://localhost:3000
SHOP_NAME=Usha Photo Studio
```

---

## Running the Project

```bash
npm run dev
```

---

## API Overview

### Auth

* POST `/api/auth/login`
* POST `/api/auth/register`
* GET `/api/auth/me`

### Orders

* GET `/api/orders/services`
* POST `/api/orders/create`
* GET `/api/orders/track/:id`

### Payments

* POST `/api/payment/create-order`
* POST `/api/payment/verify`

### Bookings

* GET `/api/bookings`
* POST `/api/bookings`
* PUT `/api/bookings/:date/:slot`
* DELETE `/api/bookings/:date/:slot`

---

## Booking Flow

```
Select Date → Choose Slot → Fill Details → Submit
        ↓
      PENDING
        ↓
Owner Accept → BOOKED
Owner Decline → FREE
```

---

## Dual QR System

| QR Type   | Purpose           |
| --------- | ----------------- |
| Client QR | Customer access   |
| Owner QR  | Direct order page |

---

## Design

* Theme: Black (#0D0D1A) and Gold (#D4AF37)
* Fonts: Playfair Display and DM Sans
* Fully mobile responsive
* Zoom prevention for better user experience

---

## Deployment

| Service  | Platform      |
| -------- | ------------- |
| Frontend | Vercel        |
| Backend  | Railway       |
| Database | MongoDB Atlas |
| Storage  | Cloudinary    |

---

## .gitignore

```
node_modules/
.env
client/build/
server/uploads/
```

---

## Highlights

* Role-based authentication
* Cloudinary integration
* Razorpay payment system
* Real-time dashboard updates
* Scalable modular architecture

---

## Built For

Usha Photo Studio, Nanjangud, Karnataka, India

Capturing Moments Forever

---

If you want, I can next upgrade this with:

* GitHub badges
* Screenshots section
* Demo video section
* LinkedIn-ready project description
