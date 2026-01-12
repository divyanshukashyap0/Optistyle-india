import { jsPDF } from "jspdf";
import "jspdf-autotable";
import nodemailer from 'nodemailer';
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

// Helpers for colors
const setFill = (doc: jsPDF, color: number[]) => doc.setFillColor(color[0], color[1], color[2]);
const setText = (doc: jsPDF, color: number[]) => doc.setTextColor(color[0], color[1], color[2]);
const setDraw = (doc: jsPDF, color: number[]) => doc.setDrawColor(color[0], color[1], color[2]);


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

  (doc as any).autoTable({
    startY: 100,
    pageBreak: "auto",
    margin: { left: 20, right: 20 },
    head: [["Item Name", "Type", "Qty", "Price", "Total"]],
    body: items.map(i => [
      i.name,
      i.selectedLens?.name || "Frame",
      i.quantity,
      `Rs. ${i.price}`,
      `Rs. ${i.price * i.quantity}`,
    ]),
    didDrawPage: () => drawHeader(doc, w),
    headStyles: { fillColor: COLORS.secondary },
  });

  drawFooters(doc, w, h);
  doc.save(`OptiStyle_Invoice_${orderId}.pdf`);
};

/* =======================
   EMAIL SERVICE
======================= */

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'optistyle.india@gmail.com',
    pass: process.env.EMAIL_PASS || 'mock_password'
  }
});

export const sendOrderEmails = async (order: Order, pdfBuffer: Buffer) => {
  if (!order.user.email) return;

  const mailOptions = {
    from: '"OptiStyle" <optistyle.india@gmail.com>',
    to: order.user.email,
    subject: `Order Confirmation - ${order.id}`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Hi ${order.user.name},</p>
      <p>Your order <strong>${order.id}</strong> has been confirmed.</p>
      <p>Total Amount: ₹${order.total}</p>
      <p>Please find the invoice attached.</p>
    `,
    attachments: [
      {
        filename: `Invoice_${order.id}.pdf`,
        content: pdfBuffer
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${order.user.email}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

