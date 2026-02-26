const nodemailer = require('nodemailer');
const twilio = require('twilio');

// ─── Email ────────────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOrderConfirmationEmail = async (order) => {
  const serviceLabels = {
    passport: 'Passport Size Photo',
    print_4x6: 'Print 4x6',
    print_a4: 'Print A4',
    lamination: 'Lamination',
    school_id: 'School ID Card Photo',
    custom: 'Custom Order',
  };

  await transporter.sendMail({
    from: `"ClickQueue 📸" <${process.env.EMAIL_USER}>`,
    to: order.customer.email,
    subject: `Order Confirmed - ${order.orderId} | ClickQueue`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background: #1a1a2e; color: #FFD700; padding: 24px; text-align: center;">
          <h1 style="margin: 0;">📸 ClickQueue</h1>
          <p style="margin: 4px 0; color: #ccc;">Smart Photo Order System</p>
        </div>
        <div style="padding: 24px;">
          <h2 style="color: #1a1a2e;">Order Confirmed! ✅</h2>
          <p>Hi <strong>${order.customer.name}</strong>, your order has been received.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr style="background: #f9f9f9;"><td style="padding: 10px; font-weight: bold;">Order ID</td><td style="padding: 10px;">${order.orderId}</td></tr>
            <tr><td style="padding: 10px; font-weight: bold;">Queue Number</td><td style="padding: 10px;">#${order.queueNumber}</td></tr>
            <tr style="background: #f9f9f9;"><td style="padding: 10px; font-weight: bold;">Service</td><td style="padding: 10px;">${serviceLabels[order.serviceType]}</td></tr>
            <tr><td style="padding: 10px; font-weight: bold;">Quantity</td><td style="padding: 10px;">${order.quantity}</td></tr>
            <tr style="background: #f9f9f9;"><td style="padding: 10px; font-weight: bold;">Total Paid</td><td style="padding: 10px;">₹${order.totalAmount}</td></tr>
            <tr><td style="padding: 10px; font-weight: bold;">Photos Uploaded</td><td style="padding: 10px;">${order.photos.length} file(s)</td></tr>
          </table>
          <p style="color: #666;">You'll be notified when your order is ready. Track your order at:</p>
          <a href="${process.env.CLIENT_URL}/track/${order.orderId}" style="display: inline-block; background: #FFD700; color: #1a1a2e; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Track My Order</a>
        </div>
        <div style="background: #f5f5f5; padding: 16px; text-align: center; color: #999; font-size: 12px;">
          © ClickQueue | Powered by Smart Queue Technology
        </div>
      </div>
    `,
  });
};

const sendOwnerNotificationEmail = async (order) => {
  await transporter.sendMail({
    from: `"ClickQueue System" <${process.env.EMAIL_USER}>`,
    to: process.env.OWNER_EMAIL,
    subject: `🆕 New Order #${order.queueNumber} - ${order.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <div style="background: #1a1a2e; color: #FFD700; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">📸 New Order Received!</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd;">
          <h3>Queue #${order.queueNumber} | ${order.orderId}</h3>
          <p><strong>Customer:</strong> ${order.customer.name}</p>
          <p><strong>Phone:</strong> ${order.customer.phone}</p>
          <p><strong>Email:</strong> ${order.customer.email}</p>
          <p><strong>Service:</strong> ${order.serviceType}</p>
          <p><strong>Quantity:</strong> ${order.quantity}</p>
          <p><strong>Amount:</strong> ₹${order.totalAmount}</p>
          <p><strong>Photos:</strong> ${order.photos.length} uploaded</p>
          <a href="${process.env.CLIENT_URL}/owner/orders/${order._id}" style="display: inline-block; background: #1a1a2e; color: #FFD700; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px;">View Order Dashboard</a>
        </div>
      </div>
    `,
  });
};

const sendOrderReadyEmail = async (order) => {
  await transporter.sendMail({
    from: `"ClickQueue 📸" <${process.env.EMAIL_USER}>`,
    to: order.customer.email,
    subject: `✅ Your Order is Ready! - ${order.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <div style="background: #1a1a2e; color: #FFD700; padding: 24px; text-align: center;">
          <h1 style="margin: 0;">📸 ClickQueue</h1>
        </div>
        <div style="padding: 24px;">
          <h2>🎉 Your Order is Ready for Pickup!</h2>
          <p>Hi <strong>${order.customer.name}</strong>,</p>
          <p>Your order <strong>${order.orderId}</strong> (Queue #${order.queueNumber}) is ready. Please visit the shop to collect your photos.</p>
          <p style="background: #fff8dc; padding: 12px; border-left: 4px solid #FFD700; border-radius: 4px;">Please show your Order ID <strong>${order.orderId}</strong> at the counter.</p>
        </div>
      </div>
    `,
  });
};

// ─── SMS (Twilio) ─────────────────────────────────────────────────────────────
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async (to, message) => {
  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: `+91${to}`, // India prefix
    });
  } catch (err) {
    console.error('SMS Error:', err.message);
  }
};

const sendOrderConfirmationSMS = async (order) => {
  await sendSMS(
    order.customer.phone,
    `ClickQueue: Order ${order.orderId} confirmed! Queue #${order.queueNumber}. Amount paid: Rs.${order.totalAmount}. You'll be notified when ready.`
  );
};

const sendOrderReadySMS = async (order) => {
  await sendSMS(
    order.customer.phone,
    `ClickQueue: Your order ${order.orderId} is READY for pickup! Please visit the shop. Show your Order ID at the counter.`
  );
};

// ─── WhatsApp (Twilio) ────────────────────────────────────────────────────────
const sendWhatsApp = async (to, message) => {
  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:+91${to}`,
    });
  } catch (err) {
    console.error('WhatsApp Error:', err.message);
  }
};

const sendOrderConfirmationWhatsApp = async (order) => {
  await sendWhatsApp(
    order.customer.phone,
    `📸 *ClickQueue Order Confirmed!*\n\nHi ${order.customer.name}!\n\n✅ *Order ID:* ${order.orderId}\n🔢 *Queue Number:* #${order.queueNumber}\n🛎 *Service:* ${order.serviceType}\n📦 *Qty:* ${order.quantity}\n💰 *Paid:* ₹${order.totalAmount}\n\nWe'll notify you when your order is ready! 🙏`
  );
};

const sendOrderReadyWhatsApp = async (order) => {
  await sendWhatsApp(
    order.customer.phone,
    `📸 *ClickQueue - Order Ready!* 🎉\n\nHi ${order.customer.name}!\n\nYour order *${order.orderId}* is READY for pickup!\n\nPlease visit the shop and show your Order ID.\n\nThank you for choosing us! 🙏`
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
