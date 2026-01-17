import { jsPDF } from "jspdf";
import "jspdf-autotable";
import nodemailer from 'nodemailer';
import { ENV } from '../config/env.ts';
import type { VisionEstimation } from "../../src/services/eyeTestLogic.ts";
import type { CartItem, Order } from "../../src/types/index.ts";

/* =======================
   THEME
======================= */

const COLORS = {
  primary: [37, 99, 235],
  secondary: [15, 23, 42],
  text: [51, 65, 85],
  textLight: [100, 116, 139],
  border: [226, 232, 240],
  white: [255, 255, 255],
  accent: [241, 245, 249],
  success: [22, 163, 74],
};

const MARGIN = 20;
const CONTENT_START_Y = 60;

const setFill = (doc: jsPDF, color: number[]) => doc.setFillColor(color[0], color[1], color[2]);
const setText = (doc: jsPDF, color: number[]) => doc.setTextColor(color[0], color[1], color[2]);
const setDraw = (doc: jsPDF, color: number[]) => doc.setDrawColor(color[0], color[1], color[2]);

const splitToWidth = (doc: jsPDF, text: string, maxWidth: number) => {
  if (!text) return [""];
  const splitter = (doc as any).splitTextToSize;
  if (typeof splitter === "function") {
    return splitter.call(doc, text, maxWidth);
  }
  return [text];
};


/* =======================
   PAGE FLOW
======================= */

const ensureSpace = (
  doc: jsPDF,
  y: number,
  space: number,
  pageWidth: number,
  pageHeight: number
) => {
  if (y + space > pageHeight - 25) {
    doc.addPage();
    drawHeader(doc, pageWidth);
    return CONTENT_START_Y;
  }
  return y;
};

/* =======================
   HEADER
======================= */

const drawHeader = (doc: jsPDF, pageWidth: number) => {
  setFill(doc, COLORS.primary);
  doc.rect(0, 0, pageWidth, 6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  setText(doc, COLORS.primary);
  doc.text("OptiStyle", MARGIN, 28);

  doc.setFontSize(10);
  setText(doc, COLORS.textLight);
  doc.text("VISION CENTER", MARGIN, 34);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Eye Care Optical, Near Gahoi Vatika", pageWidth - MARGIN, 24, { align: "right" });
  doc.text("Datia-475661, Madhya Pradesh", pageWidth - MARGIN, 29, { align: "right" });
  doc.text("Support: +91 80053 43226", pageWidth - MARGIN, 34, { align: "right" });

  setDraw(doc, COLORS.border);
  doc.line(MARGIN, 42, pageWidth - MARGIN, 42);
};

/* =======================
   FOOTER (ALL PAGES)
======================= */

const drawFooters = (doc: jsPDF, pageWidth: number, pageHeight: number) => {
  const total = doc.getNumberOfPages();

  for (let i = 1; i <= total; i++) {
    doc.setPage(i);

    setDraw(doc, COLORS.border);
    doc.line(MARGIN, pageHeight - 15, pageWidth - MARGIN, pageHeight - 15);

    doc.setFontSize(8);
    setText(doc, COLORS.textLight);
    doc.text(
      `Generated electronically by OptiStyle AI Engine on ${new Date().toLocaleString("en-IN")}`,
      MARGIN,
      pageHeight - 8
    );
    doc.text(`Page ${i} of ${total}`, pageWidth - MARGIN, pageHeight - 8, { align: "right" });
  }
};

/* =======================
   EYE TEST CERTIFICATE
======================= */

export const generateEyeTestCertificate = async (
  name: string,
  age: string,
  gender: string,
  leftEye: VisionEstimation,
  rightEye: VisionEstimation,
  certId: string,
  overallConfidence: number,
  extras?: any
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  drawHeader(doc, pageWidth);
  let y = CONTENT_START_Y;

  /* TITLE */
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  setText(doc, COLORS.secondary);
  doc.text("Vision Screening Report", MARGIN, y);

  setFill(doc, COLORS.accent);
  doc.roundedRect(pageWidth - 60, y - 6, 40, 8, 3, 3, "F");
  doc.setFontSize(9);
  setText(doc, COLORS.success);
  doc.text("COMPLETED", pageWidth - 40, y - 1, { align: "center" });

  /* PATIENT CARD */
  y += 20;
  y = ensureSpace(doc, y, 45, pageWidth, pageHeight);

  setDraw(doc, COLORS.border);
  doc.setFillColor(252, 252, 253);
  doc.roundedRect(MARGIN, y, pageWidth - 40, 40, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  setText(doc, COLORS.textLight);
  doc.text("PATIENT NAME", 30, y + 10);
  doc.text("AGE / GENDER", 100, y + 10);
  doc.text("REFERENCE ID", 150, y + 10);

  doc.setFontSize(11);
  setText(doc, COLORS.secondary);
  doc.text(name.toUpperCase(), 30, y + 18);
  doc.text(`${age} Yrs / ${gender}`, 100, y + 18);
  doc.text(certId, 150, y + 18);

  if (extras?.email) {
    doc.setFontSize(8);
    setText(doc, COLORS.textLight);
    doc.text(extras.email, 30, y + 23);
  }

  doc.line(30, y + 26, pageWidth - 30, y + 26);
  doc.setFontSize(8);
  doc.text(`Date of Test: ${new Date().toLocaleDateString("en-IN")}`, 30, y + 34);
  doc.text(`AI Confidence Score: ${overallConfidence}%`, 100, y + 34);

  /* TABLE */
  y += 55;
  y = ensureSpace(doc, y, 80, pageWidth, pageHeight);

  doc.setFontSize(12);
  setText(doc, COLORS.secondary);
  doc.text("Estimated Refraction Details", MARGIN, y);

  (doc as any).autoTable({
    startY: y + 6,
    margin: { left: 20, right: 20 },
    pageBreak: "auto",
    head: [["Eye", "Visual Acuity", "Sphere (SPH)", "Cylinder (CYL)", "Axis"]],
    body: [
      ["Right Eye (OD)", rightEye.acuity, rightEye.sph, rightEye.cyl, rightEye.axis],
      ["Left Eye (OS)", leftEye.acuity, leftEye.sph, leftEye.cyl, leftEye.axis],
    ],
    styles: { fontSize: 10, cellPadding: 10, valign: "middle", textColor: COLORS.text },
    headStyles: { fillColor: COLORS.secondary, textColor: COLORS.white },
    alternateRowStyles: { fillColor: COLORS.accent },
    didDrawPage: () => drawHeader(doc, pageWidth),
  });

  y = (doc as any).lastAutoTable.finalY + 20;
  y = ensureSpace(doc, y, 70, pageWidth, pageHeight);

  /* VERIFY */
  doc.rect(MARGIN, y, pageWidth - 40, 50);
  doc.setFontSize(10);
  setText(doc, COLORS.secondary);
  doc.text("Scan to Verify", 30, y + 15);

  doc.setFontSize(8);
  setText(doc, COLORS.textLight);
  doc.text("This QR code contains the digital signature", 30, y + 22);
  doc.text("of this test result. Scan with any QR reader", 30, y + 27);
  doc.text("to validate patient details and scores.", 30, y + 32);

  const disclaimerStartY = y + 70;
  const text1 =
    "This certificate represents the results of an AI-assisted vision screening. It is NOT a medical prescription.";
  const text2 =
    "Please consult a certified optometrist or ophthalmologist for a comprehensive eye exam before purchasing prescription lenses.";

  const maxWidth = pageWidth - 50;
  const lines1 = splitToWidth(doc, text1, maxWidth);
  const lines2 = splitToWidth(doc, text2, maxWidth);
  const lineHeight = 4;
  const boxHeight = Math.max(20, 8 + 5 + (lines1.length + lines2.length) * lineHeight + 4);
  const disclaimerY = Math.min(disclaimerStartY, pageHeight - (boxHeight + 20));

  doc.setDrawColor(252, 165, 165);
  doc.setFillColor(254, 242, 242);
  doc.setTextColor(185, 28, 28);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.roundedRect(MARGIN, disclaimerY, pageWidth - 40, boxHeight, 2, 2, "FD");
  doc.text("MEDICAL DISCLAIMER:", 25, disclaimerY + 8);

  doc.setFont("helvetica", "normal");
  setText(doc, COLORS.text);
  const textStartY = disclaimerY + 13;
  doc.text(lines1, 25, textStartY);
  doc.text(lines2, 25, textStartY + lines1.length * lineHeight);

  drawFooters(doc, pageWidth, pageHeight);
  doc.save(`OptiStyle_Report_${certId}.pdf`);
};

/* =======================
   INVOICE (UNCHANGED CONTENT)
======================= */

export const generateInvoice = (
  orderId: string,
  customer: { name: string; email: string; address: string; city: string; zip: string },
  items: CartItem[],
  total: number
) => {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  drawHeader(doc, w);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("TAX INVOICE", w - MARGIN, 50, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Order #: ${orderId}`, w - MARGIN, 56, { align: "right" });
  doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, w - MARGIN, 61, { align: "right" });

  doc.text("Bill To:", MARGIN, 70);
  doc.setFont("helvetica", "bold");
  doc.text(customer.name, MARGIN, 75);
  doc.setFont("helvetica", "normal");
  doc.text(customer.address, MARGIN, 80);
  doc.text(`${customer.city} - ${customer.zip}`, MARGIN, 85);
  doc.text(`Email: ${customer.email}`, MARGIN, 90);

  const maxRows = 8;
  const visibleItems = items.slice(0, maxRows);
  const remainingCount = items.length - visibleItems.length;

  const bodyRows = visibleItems.map(i => [
    i.name,
    i.selectedLens?.name || "Frame",
    i.quantity,
    `Rs. ${i.price}`,
    `Rs. ${i.price * i.quantity}`,
  ]);

  if (remainingCount > 0) {
    bodyRows.push([
      `+ ${remainingCount} more item(s)`,
      "",
      "",
      "",
      "",
    ]);
  }

  (doc as any).autoTable({
    startY: 100,
    margin: { left: 20, right: 20 },
    head: [["Item Name", "Type", "Qty", "Price", "Total"]],
    body: bodyRows,
    didDrawPage: () => drawHeader(doc, w),
    headStyles: { fillColor: COLORS.secondary },
  });

  drawFooters(doc, w, h);
  doc.save(`OptiStyle_Invoice_${orderId}.pdf`);
};

const emailConfig = ENV.EMAIL;

const hasSendGridApiKey = !!emailConfig.SENDGRID_API_KEY;

const hasSmtpConfig =
  !!emailConfig.SMTP_HOST &&
  !!emailConfig.SMTP_USER &&
  !!emailConfig.SMTP_PASS;

const hasOAuthCredentials =
  !!emailConfig.CLIENT_ID &&
  !!emailConfig.CLIENT_SECRET &&
  !!emailConfig.REFRESH_TOKEN &&
  !!emailConfig.SENDER;

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: emailConfig.SMTP_HOST,
      port: Number(emailConfig.SMTP_PORT) || 587,
      secure:
        emailConfig.SMTP_SECURE === 'true' ||
        emailConfig.SMTP_PORT === '465',
      auth: {
        user: emailConfig.SMTP_USER,
        pass: emailConfig.SMTP_PASS,
      },
    })
  : hasOAuthCredentials
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: emailConfig.SENDER,
        clientId: emailConfig.CLIENT_ID,
        clientSecret: emailConfig.CLIENT_SECRET,
        refreshToken: emailConfig.REFRESH_TOKEN,
      },
    })
  : nodemailer.createTransport({
      jsonTransport: true,
    });

const sendMail = async (mailOptions: { from: string; to: string; subject: string; html: string }) => {
  if (hasSendGridApiKey && emailConfig.SENDGRID_API_KEY) {
    const fromEmail = emailConfig.SENDER || 'optistyle.india@gmail.com';

    const payload = {
      personalizations: [
        {
          to: [{ email: mailOptions.to }],
          subject: mailOptions.subject,
        },
      ],
      from: {
        email: fromEmail,
        name: 'OptiStyle',
      },
      content: [
        {
          type: 'text/html',
          value: mailOptions.html,
        },
      ],
    };

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${emailConfig.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('SendGrid error:', response.status, errorText);
      } else {
        console.log(`Email sent via SendGrid to ${mailOptions.to}`);
      }
    } catch (error) {
      console.error('Error sending email via SendGrid:', error);
    }
    return;
  }

  try {
    await transporter.sendMail(mailOptions as any);
    console.log(`Email sent via SMTP/OAuth to ${mailOptions.to}`);
  } catch (error) {
    console.error('Error sending email via SMTP/OAuth:', error);
  }
};

export const sendOrderEmails = async (order: Order) => {
  if (!order.user.email) return;

  const textColor = '#0f172a';
  const mutedText = '#64748b';
  const borderColor = '#e2e8f0';
  const accentColor = '#2563EB';

  const rowsHtml = order.items
    .map(item => {
      const lensPrice = item.selectedLens?.price || 0;
      const unitPrice = item.price + lensPrice;
      const lineTotal = unitPrice * item.quantity;
      const name = item.selectedLens
        ? `${item.name} + ${item.selectedLens.name}`
        : item.name;
      return `
        <tr>
          <td style="padding:8px 10px;border:1px solid ${borderColor};font-size:12px;">${name}</td>
          <td style="padding:8px 10px;border:1px solid ${borderColor};font-size:12px;text-align:right;">₹${unitPrice.toFixed(2)}</td>
          <td style="padding:8px 10px;border:1px solid ${borderColor};font-size:12px;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 10px;border:1px solid ${borderColor};font-size:12px;text-align:right;">₹${lineTotal.toFixed(2)}</td>
        </tr>
      `;
    })
    .join('');

  const amount = order.total.toFixed(2);

  const itemsPreview = order.items
    .slice(0, 3)
    .map(i => `${i.name}${i.selectedLens ? ` + ${i.selectedLens.name}` : ''} × ${i.quantity}`)
    .join(' • ');

  const hasMoreItems = order.items.length > 3;

  const mailOptions = {
    from: `"OptiStyle" <${emailConfig.SENDER || 'optistyle.india@gmail.com'}>`,
    to: order.user.email,
    subject: `Order Confirmation - ${order.id}`,
    html: `
      <div style="background:#f8fafc;padding:24px 0;">
        <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:4px;border:1px solid ${borderColor};font-family:Arial,Helvetica,sans-serif;color:${textColor};">
          <div style="padding:16px 18px;border-bottom:2px solid ${accentColor};display:flex;align-items:center;justify-content:space-between;">
            <div style="font-size:22px;font-weight:bold;letter-spacing:0.03em;">OptiStyle</div>
            <div style="font-size:11px;color:${mutedText};text-align:right;line-height:1.4;">
              <div>Order ID: <span style="font-weight:600;color:${textColor};">${order.id}</span></div>
              <div>Placed on ${new Date(order.date).toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div style="padding:18px 20px 10px 20px;font-size:13px;line-height:1.6;">
            <p style="margin:0 0 4px 0;">
              Your OptiStyle order for amount <strong>₹${amount}</strong> has been placed successfully.
            </p>
            <p style="margin:0;color:${mutedText};">
              Thank you for shopping with us at OptiStyle.
            </p>
          </div>

          <div style="padding:6px 20px 4px 20px;font-size:13px;font-weight:bold;">
            Order details
          </div>

          <div style="padding:0 20px 10px 20px;">
            <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid ${borderColor};font-size:12px;">
              <thead>
                <tr style="background:#f9fafb;">
                  <th align="left" style="padding:8px 10px;border:1px solid ${borderColor};font-weight:bold;">Product Name</th>
                  <th align="right" style="padding:8px 10px;border:1px solid ${borderColor};font-weight:bold;">Price</th>
                  <th align="center" style="padding:8px 10px;border:1px solid ${borderColor};font-weight:bold;">Quantity</th>
                  <th align="right" style="padding:8px 10px;border:1px solid ${borderColor};font-weight:bold;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml || `
                  <tr>
                    <td colspan="4" style="padding:10px;border:1px solid ${borderColor};color:${mutedText};text-align:center;">
                      Items will appear here once added.
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>

          <div style="padding:4px 20px 16px 20px;font-size:12px;line-height:1.6;">
            <div>Order total: <span style="font-weight:bold;">₹${amount}</span></div>
            <div style="color:#b91c1c;font-weight:bold;margin-top:2px;">Grand Total: ₹${amount}</div>
          </div>

          <div style="padding:10px 20px 4px 20px;font-size:13px;font-weight:bold;border-top:1px solid ${borderColor};">
            Delivery Information
          </div>
          <div style="padding:2px 20px 18px 20px;font-size:12px;line-height:1.7;color:${mutedText};">
            <div><span style="font-weight:bold;color:${textColor};">Name:</span> ${order.user.name}</div>
            <div><span style="font-weight:bold;color:${textColor};">Address:</span> ${order.user.address || 'Address not provided'}, ${order.user.city || ''} ${order.user.state || ''} ${order.user.zip || ''}</div>
            ${order.user.phone ? `<div><span style="font-weight:bold;color:${textColor};">Mobile no.:</span> ${order.user.phone}</div>` : ''}
            <div><span style="font-weight:bold;color:${textColor};">Email:</span> ${order.user.email}</div>
          </div>

          <div style="padding:12px 20px;border-top:1px solid ${borderColor};display:flex;align-items:center;justify-content:space-between;font-size:11px;color:${mutedText};">
            <div>
              Customer Support: <span style="color:${accentColor};">optistyle.india@gmail.com</span><br/>
              Customer Hotline: +91-80053 43226
            </div>
            <div style="text-align:right;">
              <div style="font-weight:bold;color:${textColor};margin-bottom:4px;">OptiStyle</div>
              <div>Eyewear • Eye Care • Everyday Comfort</div>
            </div>
          </div>

          <div style="padding:10px 20px 16px 20px;border-top:1px solid ${borderColor};text-align:center;font-size:11px;color:${mutedText};">
            You can also access this invoice anytime from the Orders section in your OptiStyle account.
          </div>
        </div>
      </div>
    `,
  };

  await sendMail(mailOptions);
};

