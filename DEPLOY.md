#  ClickQueue Deployment Guide

## Deploy Backend → Railway (Free)

1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. Click **New Project → Deploy from GitHub Repo**
3. Select your `clickqueue` repo
4. Railway auto-detects Node.js via `railway.toml`
5. Go to **Variables** tab → add all your `.env` keys:
   - `MONGO_URI`, `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `OWNER_EMAIL`
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE`, `TWILIO_WHATSAPP_FROM`
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
   - `CLIENT_URL` → (your Vercel URL, added after step below)
6. Copy your Railway URL → e.g. `https://clickqueue-backend.up.railway.app`

---

## Deploy Frontend → Vercel (Free)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **Add New Project → Import** your repo
3. Set **Root Directory** to `client`
4. Add environment variable:
   - `REACT_APP_API_URL` = your Railway backend URL
5. Deploy!
6. Copy your Vercel URL → e.g. `https://clickqueue.vercel.app`
7. Go back to Railway → update `CLIENT_URL` = your Vercel URL

---

## Update Razorpay Webhook

1. Go to [Razorpay Dashboard → Webhooks](https://dashboard.razorpay.com/app/webhooks)
2. Add webhook URL: `https://your-railway-url.up.railway.app/api/payment/webhook`
3. Select event: `payment.captured`
4. Save

---

## Update .env CLIENT_URL

After deploying both:
```env
CLIENT_URL=https://clickqueue.vercel.app
SHOP_QR_URL=https://clickqueue.vercel.app/order
```

---

## Quick Checklist

- [ ] MongoDB Atlas cluster created + IP whitelist set to `0.0.0.0/0`
- [ ] Cloudinary account set up
- [ ] Razorpay account created (test mode first)
- [ ] Gmail App Password generated
- [ ] Twilio account + WhatsApp sandbox joined
- [ ] Railway backend deployed
- [ ] Vercel frontend deployed
- [ ] Razorpay webhook configured
- [ ] Owner account created via `/register`
- [ ] QR code generated from dashboard → printed and pasted outside shop

---

## Test Flow

1. Open your Vercel URL
2. Click "Place Your Order"
3. Fill test details
4. Upload a test image
5. Pay with Razorpay test card: `4111 1111 1111 1111` / any future date / any CVV
6. Or use UPI test ID: `success@razorpay`
7. Check owner dashboard for the new order
