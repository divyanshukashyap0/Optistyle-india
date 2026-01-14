
import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';
import type { Order } from '../../src/types/index.ts';
import { GST_CONFIG, formatCurrency } from '../utils/gstUtils.ts';
import { BRAND, LOGO_ASSET } from '../../src/constants/branding.ts'; // Now imports from backend-safe constants

/**
 * Generates a GST-Compliant Tax Invoice
 * DESIGN: Premium, Clean, Matching Frontend Branding
 */
export const generateInvoiceBuffer = (order: Order): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // --- COLORS ---
      const PRIMARY = BRAND.colors.primary; 
      const TEXT_DARK = BRAND.colors.text;
      const TEXT_LIGHT = BRAND.colors.textLight;
      const BORDER = '#E2E8F0';
      const BG_LIGHT = BRAND.colors.bg;

      const PAGE_LEFT = 40;
      const PAGE_RIGHT = doc.page.width - 40;

      // --- HEADER WITH VECTOR LOGO ---
      doc.roundedRect(PAGE_LEFT, 40, 40, 40, 10).fill(PRIMARY);
      
      doc.save();
      doc.translate(48, 48); 
      doc.scale(1.0); 
      doc.lineWidth(2);
      doc.strokeColor('white');
      doc.path(LOGO_ASSET.path).stroke(); 
      doc.restore();

      // Brand Name
      doc.fillColor(TEXT_DARK).fontSize(24).font('Helvetica-Bold').text(BRAND.name, 90, 45);
      doc.fontSize(9).font('Helvetica').fillColor(TEXT_LIGHT);
      doc.text(BRAND.tagline, 90, 70);

      // Invoice Label
      doc.fillColor(TEXT_DARK).fontSize(16).font('Helvetica-Bold').text('TAX INVOICE', PAGE_RIGHT, 45, { align: 'right' });
      
      const invoiceType = order.paymentMethod === 'COD' ? 'Bill of Supply (COD)' : 'Original for Recipient';
      doc.fontSize(9).font('Helvetica').text(invoiceType, PAGE_RIGHT, 65, { align: 'right' });

      // Separator
      doc.moveTo(PAGE_LEFT, 95).lineTo(PAGE_RIGHT, 95).strokeColor(BORDER).lineWidth(1).stroke();

      // --- INFO SECTION ---
      const infoY = 110;
      
      // Seller Info
      doc.fontSize(8).font('Helvetica-Bold').fillColor(TEXT_LIGHT).text('SOLD BY', PAGE_LEFT, infoY);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(TEXT_DARK).text(`${BRAND.name} India Pvt Ltd.`, PAGE_LEFT, infoY + 12);
      doc.fontSize(9).font('Helvetica').fillColor(TEXT_LIGHT);
      doc.text('Eye Care Optical, Near Gahoi Vatika', PAGE_LEFT, infoY + 26);
      doc.text('Peetambra Road,Gahoi Colony', PAGE_LEFT, infoY + 38);
      doc.text(`GSTIN: ${GST_CONFIG.SELLER_GSTIN}`, PAGE_LEFT, infoY + 50);

      // Bill To
      doc.fontSize(8).font('Helvetica-Bold').fillColor(TEXT_LIGHT).text('BILL TO', 300, infoY);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(TEXT_DARK).text(order.user.name, 300, infoY + 12);
      doc.fontSize(9).font('Helvetica').fillColor(TEXT_LIGHT);
      doc.text(order.user.address || 'Address Not Provided', 300, infoY + 26, { width: 200 });
      doc.text(`${order.user.city || ''}, ${order.user.state || ''} ${order.user.zip || ''}`, 300, doc.y);
      doc.text(`Phone: ${order.user.phone || 'N/A'}`, 300, doc.y + 4);

      // Invoice Meta
      doc.fontSize(9).font('Helvetica-Bold').fillColor(TEXT_DARK);
      doc.text(`Invoice No: ${order.invoiceNumber || order.id}`, PAGE_RIGHT, infoY + 80, { align: 'right' });
      doc.font('Helvetica').text(`Date: ${new Date(order.date).toLocaleDateString('en-IN')}`, PAGE_RIGHT, infoY + 94, { align: 'right' });

      // --- TABLE ---
      const tableTop = 230;
      const colX = {
        item: PAGE_LEFT + 10,
        hsn: 260,
        qty: 330,
        price: 410,
        total: 520,
      };

      doc.rect(PAGE_LEFT, tableTop, PAGE_RIGHT - PAGE_LEFT, 25).fill(BG_LIGHT);
      doc.fillColor(TEXT_DARK).fontSize(9).font('Helvetica-Bold');
      doc.text('Item Description', colX.item, tableTop + 8);
      doc.text('HSN', colX.hsn, tableTop + 8);
      doc.text('Qty', colX.qty, tableTop + 8, { align: 'center' });
      doc.text('Amount', colX.total, tableTop + 8, { align: 'right' });

      let y = tableTop + 35;
      doc.font('Helvetica').fontSize(9).fillColor(TEXT_LIGHT);

      const maxY = doc.page.height - 220;

      order.items.forEach((item, index) => {
        if (y > maxY) {
          doc.addPage();
          doc.fillColor(TEXT_DARK).fontSize(9).font('Helvetica-Bold');
          doc.rect(PAGE_LEFT, tableTop, PAGE_RIGHT - PAGE_LEFT, 25).fill(BG_LIGHT);
          doc.text('Item Description', colX.item, tableTop + 8);
          doc.text('HSN', colX.hsn, tableTop + 8);
          doc.text('Qty', colX.qty, tableTop + 8, { align: 'center' });
          doc.text('Rate', colX.price, tableTop + 8, { align: 'right' });
          doc.text('Amount', colX.total, tableTop + 8, { align: 'right' });
          y = tableTop + 35;
          doc.font('Helvetica').fontSize(9).fillColor(TEXT_LIGHT);
        }

        const itemTotal = (item.price + (item.selectedLens?.price || 0)) * item.quantity;
        const itemTaxable = itemTotal / (1 + GST_CONFIG.GST_RATE);

        const name = item.name.length > 40 ? `${item.name.substring(0, 37)}...` : item.name;
        doc.text(name, colX.item, y, { width: 190 });
        doc.text(GST_CONFIG.HSN_CODE, colX.hsn, y);
        doc.text(item.quantity.toString(), colX.qty, y, { align: 'center' });
        doc.text(formatCurrency(itemTaxable / item.quantity), colX.price, y, { align: 'right' });
        doc.text(formatCurrency(itemTaxable), colX.total, y, { align: 'right' });

        if (item.selectedLens) {
          y += 12;
          doc.fontSize(8).fillColor(TEXT_DARK);
          doc.text(`+ ${item.selectedLens.name}`, colX.item, y, { width: 190 });
          doc.fontSize(9).font('Helvetica').fillColor(TEXT_LIGHT);
        }

        y += 18;
        if (index < order.items.length - 1) {
          doc.moveTo(PAGE_LEFT, y - 6).lineTo(PAGE_RIGHT, y - 6).strokeColor(BORDER).lineWidth(0.5).stroke();
      });

      // --- TOTALS ---
      y = doc.page.height - 160;
      const t = order.taxBreakdown;
      if (t) {
        const drawRow = (label: string, value: string, bold = false) => {
          const labelX = PAGE_RIGHT - 200;
          const valueX = PAGE_RIGHT;

          doc.font(bold ? 'Helvetica-Bold' : 'Helvetica')
            .fontSize(9)
            .fillColor(bold ? TEXT_DARK : TEXT_LIGHT);

          doc.text(label, labelX, y, { align: 'left' });
          doc.text(value, valueX, y, { align: 'right' });
          y += 14;
        };

        drawRow('Taxable Amount', ₹(t.taxableAmount));

        if (t.isInterState) {
          drawRow(`IGST (${GST_CONFIG.GST_RATE * 100}%)`, formatCurrency(t.igst));
        } else {
          const half = (GST_CONFIG.GST_RATE * 100) / 2;
          drawRow(`CGST (${half}%)`, formatCurrency(t.cgst));
          drawRow(`SGST (${half}%)`, formatCurrency(t.sgst));
        }

        y += 12;
        const boxTop = y;
        const boxHeight = 30;

        doc.roundedRect(PAGE_RIGHT - 200, boxTop, 200, boxHeight, 4).fill(PRIMARY);
        doc.fillColor('white').fontSize(11).font('Helvetica-Bold');
        doc.text('Total Payable', PAGE_RIGHT - 190, boxTop + 10, { align: 'left' });
        doc.text(formatCurrency(t.totalAmount), PAGE_RIGHT - 50, boxTop + 10, { align: 'right' });
        y = boxTop + boxHeight + 20;
      }

      // --- FOOTER ---
      const footerBaseY = doc.page.height - 80;
      doc.moveTo(PAGE_LEFT, footerBaseY).lineTo(PAGE_RIGHT, footerBaseY).strokeColor(BORDER).lineWidth(1).stroke();

      doc.fontSize(8).font('Helvetica').fillColor(TEXT_LIGHT);
      doc.text('Terms & Conditions:', PAGE_LEFT, footerBaseY + 12);
      doc.text('1. Goods once sold will not be taken back unless defective.', PAGE_LEFT, footerBaseY + 24);
      doc.text('2. Subject to Datia MP Jurisdiction only.', PAGE_LEFT, footerBaseY + 36);

      doc.text('Authorized Signatory', PAGE_RIGHT - 100, footerBaseY + 12, { align: 'center' });
      doc.font('Helvetica-Bold').text(`${BRAND.name} India`, PAGE_RIGHT - 100, footerBaseY + 40, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
