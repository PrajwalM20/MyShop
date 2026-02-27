const nodemailer = require('nodemailer');

// ─── Email ─────────────────────────────────────────────────────────────────
const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
    console.log('Email skipped - EMAIL_USER not configured');
    return;
  }
  try {
    await getTransporter().sendMail({
      from: `"ClickQueue" <${process.env.EMAIL_USER}>`,
      to, subject, html,
    });
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

const sendOrderConfirmationEmail = async (order) => {
  await sendEmail(
    order.customer.email,
    `Order Confirmed - ${order.orderId}`,
    `<h2>Order Confirmed!</h2>
     <p>Hi ${order.customer.name},</p>
     <p><strong>Order ID:</strong> ${order.orderId}</p>
     <p><strong>Queue Number:</strong> #${order.queueNumber}</p>
     <p><strong>Service:</strong> ${order.serviceType}</p>
     <p><strong>Amount:</strong> Rs.${order.totalAmount}</p>
     <p>You will be notified when your order is ready!</p>`
  );
};

const sendOwnerNotificationEmail = async (order) => {
  await sendEmail(
    process.env.OWNER_EMAIL,
    `New Order #${order.queueNumber} - ${order.orderId}`,
    `<h2>New Order Received!</h2>
     <p><strong>Customer:</strong> ${order.customer.name}</p>
     <p><strong>Phone:</strong> ${order.customer.phone}</p>
     <p><strong>Service:</strong> ${order.serviceType}</p>
     <p><strong>Quantity:</strong> ${order.quantity}</p>
     <p><strong>Amount:</strong> Rs.${order.totalAmount}</p>`
  );
};

const sendOrderReadyEmail = async (order) => {
  await sendEmail(
    order.customer.email,
    `Your Order is Ready! - ${order.orderId}`,
    `<h2>Your order is ready for pickup!</h2>
     <p>Hi ${order.customer.name},</p>
     <p>Order <strong>${order.orderId}</strong> (Queue #${order.queueNumber}) is ready.</p>
     <p>Please visit the shop and show your Order ID.</p>`
  );
};

// ─── SMS (Twilio) ──────────────────────────────────────────────────────────
const sendSMS = async (to, message) => {
  if (!process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID === 'your_twilio_account_sid') {
    console.log('SMS skipped - Twilio not configured');
    return;
  }
  try {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: `+91${to}`,
    });
  } catch (err) {
    console.error('SMS error:', err.message);
  }
};

const sendOrderConfirmationSMS = async (order) => {
  await sendSMS(
    order.customer.phone,
    `ClickQueue: Order ${order.orderId} confirmed! Queue #${order.queueNumber}. Amount: Rs.${order.totalAmount}. You will be notified when ready.`
  );
};

const sendOrderReadySMS = async (order) => {
  await sendSMS(
    order.customer.phone,
    `ClickQueue: Your order ${order.orderId} is READY for pickup! Please visit the shop.`
  );
};

// ─── WhatsApp (Twilio) ────────────────────────────────────────────────────
const sendWhatsApp = async (to, message) => {
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
      to: `whatsapp:+91${to}`,
    });
  } catch (err) {
    console.error('WhatsApp error:', err.message);
  }
};

const sendOrderConfirmationWhatsApp = async (order) => {
  await sendWhatsApp(
    order.customer.phone,
    `ClickQueue Order Confirmed!\n\nHi ${order.customer.name}!\nOrder ID: ${order.orderId}\nQueue: #${order.queueNumber}\nService: ${order.serviceType}\nAmount: Rs.${order.totalAmount}\n\nWe will notify you when ready!`
  );
};

const sendOrderReadyWhatsApp = async (order) => {
  await sendWhatsApp(
    order.customer.phone,
    `ClickQueue - Order Ready!\n\nHi ${order.customer.name}!\nYour order ${order.orderId} is READY for pickup!\nPlease visit the shop and show your Order ID.`
  );
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOwnerNotificationEmail,
  sendOrderReadyEmail,
  sendOrderConfirmationSMS,
  sendOrderReadySMS,
  sendOrderConfirmationWhatsApp,
  sendOrderReadyWhatsApp,
};