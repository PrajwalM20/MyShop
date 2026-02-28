const nodemailer = require('nodemailer');

const getTransporter = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendEmail = async (to, subject, html) => {
  // Skip if no email address provided by customer
  if (!to || to.trim() === '') {
    console.log('Email skipped - customer has no email');
    return;
  }
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
    console.log('Email skipped - EMAIL_USER not configured');
    return;
  }
  try {
    await getTransporter().sendMail({
      from: `"ClickQueue" <${process.env.EMAIL_USER}>`, to, subject, html,
    });
    console.log('Email sent to', to);
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

const sendSMS = async (phone, message) => {
  if (!phone) return;
  if (!process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID === 'your_twilio_account_sid') {
    console.log('SMS skipped - Twilio not configured');
    return;
  }
  try {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: message, from: process.env.TWILIO_PHONE, to: `+91${phone}`,
    });
    console.log('SMS sent to', phone);
  } catch (err) {
    console.error('SMS error:', err.message);
  }
};

const sendWhatsApp = async (phone, message) => {
  if (!phone) return;
  if (!process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID === 'your_twilio_account_sid') {
    console.log('WhatsApp skipped - Twilio not configured');
    return;
  }
  try {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:+91${phone}`,
    });
    console.log('WhatsApp sent to', phone);
  } catch (err) {
    console.error('WhatsApp error:', err.message);
  }
};

// ── Order Confirmation (sent to customer) ──────────────────────────────────
const sendOrderConfirmationEmail = async (order) => {
  if (!order.customer.email) return; // skip if no email
  await sendEmail(
    order.customer.email,
    `Order Confirmed - ${order.orderId}`,
    `<div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#D4AF37">Order Confirmed! 📸</h2>
      <p>Hi <strong>${order.customer.name}</strong>,</p>
      <p>Your order has been placed successfully.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px;color:#888">Order ID</td><td style="padding:8px;font-weight:bold">${order.orderId}</td></tr>
        <tr><td style="padding:8px;color:#888">Queue Number</td><td style="padding:8px;font-weight:bold;color:#D4AF37">#${order.queueNumber}</td></tr>
        <tr><td style="padding:8px;color:#888">Service</td><td style="padding:8px">${order.serviceType}</td></tr>
        <tr><td style="padding:8px;color:#888">Amount Paid</td><td style="padding:8px;font-weight:bold">Rs.${order.totalAmount}</td></tr>
      </table>
      <p>We will notify you when your order is ready for pickup!</p>
    </div>`
  );
};

const sendOrderConfirmationSMS = async (order) => {
  await sendSMS(
    order.customer.phone,
    `ClickQueue: Order ${order.orderId} confirmed! Queue #${order.queueNumber}. Amount: Rs.${order.totalAmount}. We will WhatsApp you when ready.`
  );
};

const sendOrderConfirmationWhatsApp = async (order) => {
  await sendWhatsApp(
    order.customer.phone,
    `Hi ${order.customer.name}! 👋\n\nYour order is confirmed!\n\n📋 Order ID: ${order.orderId}\n🔢 Queue No: #${order.queueNumber}\n📸 Service: ${order.serviceType}\n💰 Amount: Rs.${order.totalAmount}\n\nWe will message you here when your order is ready! ✅`
  );
};

// ── Owner Notification ─────────────────────────────────────────────────────
const sendOwnerNotificationEmail = async (order) => {
  await sendEmail(
    process.env.OWNER_EMAIL,
    `New Order #${order.queueNumber} - ${order.orderId}`,
    `<div style="font-family:sans-serif">
      <h2>New Order Received! 📦</h2>
      <p><strong>Customer:</strong> ${order.customer.name}</p>
      <p><strong>Phone:</strong> ${order.customer.phone}</p>
      <p><strong>Email:</strong> ${order.customer.email || 'Not provided'}</p>
      <p><strong>Service:</strong> ${order.serviceType}</p>
      <p><strong>Quantity:</strong> ${order.quantity}</p>
      <p><strong>Amount:</strong> Rs.${order.totalAmount}</p>
    </div>`
  );
};

// ── Order Ready (sent to customer) ────────────────────────────────────────
const sendOrderReadyEmail = async (order) => {
  if (!order.customer.email) return; // skip if no email
  await sendEmail(
    order.customer.email,
    `Your Order is Ready! - ${order.orderId}`,
    `<div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#D4AF37">Your Order is Ready! ✅</h2>
      <p>Hi <strong>${order.customer.name}</strong>,</p>
      <p>Your order <strong>${order.orderId}</strong> (Queue #${order.queueNumber}) is ready for pickup!</p>
      <p>Please visit the shop and show your Order ID.</p>
    </div>`
  );
};

const sendOrderReadySMS = async (order) => {
  await sendSMS(
    order.customer.phone,
    `ClickQueue: Your order ${order.orderId} is READY for pickup! Please visit the shop and show your Order ID.`
  );
};

const sendOrderReadyWhatsApp = async (order) => {
  await sendWhatsApp(
    order.customer.phone,
    `Hi ${order.customer.name}! 🎉\n\nYour order is READY for pickup!\n\n📋 Order ID: ${order.orderId}\n🔢 Queue: #${order.queueNumber}\n\nPlease visit the shop and show your Order ID. Thank you! 🙏`
  );
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderConfirmationSMS,
  sendOrderConfirmationWhatsApp,
  sendOwnerNotificationEmail,
  sendOrderReadyEmail,
  sendOrderReadySMS,
  sendOrderReadyWhatsApp,
};