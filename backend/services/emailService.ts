
import nodemailer from 'nodemailer';
import { Buffer } from 'buffer';
import { ENV } from '../config/env.ts';
import type { Order } from '../../types.ts'; // Import from shared types

/**
 * Creates a Nodemailer transporter using Gmail OAuth2.
 */
const createTransporter = () => {
  if (!ENV.EMAIL.CLIENT_ID || !ENV.EMAIL.CLIENT_SECRET || !ENV.EMAIL.REFRESH_TOKEN || !ENV.EMAIL.SENDER) {
    console.warn("⚠️ [Email Service] Missing OAuth credentials in .env. Emailing will be disabled.");
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: ENV.EMAIL.SENDER,
      clientId: ENV.EMAIL.CLIENT_ID,
      clientSecret: ENV.EMAIL.CLIENT_SECRET,
      refreshToken: ENV.EMAIL.REFRESH_TOKEN,
    },
  } as nodemailer.TransportOptions);
};

const transporter = createTransporter();

// --- TEMPLATES ---

const getAdminEmailTemplate = (order: Order) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
  <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #1e293b; color: #fff; padding: 20px; text-align: center;">
      <h2 style="margin: 0;">🛒 New Order Received</h2>
    </div>
    <div style="padding: 20px;">
      <p><strong>Invoice ID:</strong> ${order.id}</p>
      <p><strong>Customer:</strong> ${order.user.name} (${order.user.email})</p>
      <p><strong>Date:</strong> ${new Date(order.date).toLocaleString('en-IN')}</p>
      
      <h3 style="border-bottom: 2px solid #2563eb; padding-bottom: 5px;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <tr style="background-color: #f8fafc;">
          <th style="text-align: left; padding: 8px;">Item</th>
          <th style="text-align: center; padding: 8px;">Qty</th>
          <th style="text-align: right; padding: 8px;">Price</th>
        </tr>
        ${order.items.map((item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="text-align: center; padding: 8px; border-bottom: 1px solid #eee;">${item.quantity}</td>
          <td style="text-align: right; padding: 8px; border-bottom: 1px solid #eee;">₹${item.price}</td>
        </tr>
        `).join('')}
      </table>
      
      <h3 style="text-align: right; color: #2563eb;">Total: ₹${order.total}</h3>
      <p style="font-size: 12px; color: #64748b;">The official tax invoice is attached to this email.</p>
    </div>
  </div>
</body>
</html>
`;

const getUserEmailTemplate = (order: Order) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
  <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #2563eb; color: #fff; padding: 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">Order Confirmed! 🎉</h1>
    </div>
    <div style="padding: 20px;">
      <p>Hi <strong>${order.user.name}</strong>,</p>
      <p>Thank you for choosing OptiStyle! We've received your order and are getting your frames ready.</p>
      
      <div style="background-color: #eff6ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Order ID:</strong> ${order.id}</p>
        <p style="margin: 0;"><strong>Total Amount:</strong> ₹${order.total}</p>
      </div>

      <p>Your official tax invoice is attached to this email.</p>
      
      <h3 style="color: #2563eb;">What's Next?</h3>
      <p>We will notify you once your order is shipped (usually within 2-3 business days).</p>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://optistyle.com/orders" style="background-color: #1e293b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Track Your Order</a>
      </div>
    </div>
    <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
      <p>OptiStyle India - Premium Eyewear<br/>Hyderabad, India | support@optistyle.in</p>
    </div>
  </div>
</body>
</html>
`;

// --- MAIN FUNCTION ---

export const sendOrderEmails = async (orderData: Order, pdfBuffer: Buffer) => {
  if (!transporter) return;

  const attachments = [
    {
      filename: `Invoice_${orderData.id}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    },
  ];

  try {
    // 1. Send Admin Email
    console.log(`[Email] Sending Admin notification to ${ENV.EMAIL.ADMIN}...`);
    await transporter.sendMail({
      from: `"OptiStyle System" <${ENV.EMAIL.SENDER}>`,
      to: ENV.EMAIL.ADMIN,
      subject: `🛒 New Order: ${orderData.id} - ₹${orderData.total}`,
      html: getAdminEmailTemplate(orderData),
      attachments,
    });
    console.log(`[Email] Admin notification sent.`);

    // 2. Send Customer Email
    console.log(`[Email] Sending Customer confirmation to ${orderData.user.email}...`);
    await transporter.sendMail({
      from: `"OptiStyle India" <${ENV.EMAIL.SENDER}>`,
      to: orderData.user.email,
      subject: `Order Confirmed! 👓 (#${orderData.id})`,
      html: getUserEmailTemplate(orderData),
      attachments,
    });
    console.log(`[Email] Customer confirmation sent.`);

  } catch (error) {
    console.error("❌ [Email Error] Failed to send transactional emails:", error);
  }
};
