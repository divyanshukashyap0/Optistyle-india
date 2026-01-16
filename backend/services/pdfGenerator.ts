
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
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
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

      const PAGE_MARGIN_X = 60;
      const PAGE_LEFT = PAGE_MARGIN_X;
      const PAGE_RIGHT = doc.page.width - PAGE_MARGIN_X;

      const rightText = (text: string, x: number, y: number) => {
        const w = doc.widthOfString(text);
        doc.text(text, x - w, y);
      };

      // --- HEADER WITH VECTOR LOGO ---
      const logoX = PAGE_LEFT;
      const logoY = 40;
      const logoSize = 40;
      const logoRadius = 10;

      doc.roundedRect(logoX, logoY, logoSize, logoSize, logoRadius).fill(PRIMARY);

      doc.save();
      const iconScale = 0.6;
      const iconCenterX = logoX + logoSize / 2;
      const iconCenterY = logoY + logoSize / 2;
      doc.translate(iconCenterX, iconCenterY);
      doc.scale(iconScale);
      doc.lineWidth(2 / iconScale);
      doc.strokeColor('white');
      doc.path(LOGO_ASSET.path).stroke();
      doc.restore();

      // Brand Name
      doc.fillColor(TEXT_DARK).fontSize(24).font('Helvetica-Bold').text(BRAND.name, 90, 45);
      doc.fontSize(9).font('Helvetica').fillColor(TEXT_LIGHT);
      doc.text(BRAND.tagline, 90, 70);

      const invoiceLabel = 'TAX INVOICE';
      doc.fillColor(TEXT_DARK).fontSize(16).font('Helvetica-Bold');
      const invoiceLabelWidth = doc.widthOfString(invoiceLabel);
      doc.text(invoiceLabel, PAGE_RIGHT - invoiceLabelWidth, 45);
      
      const invoiceType = order.paymentMethod === 'COD' ? 'Bill of Supply (COD)' : 'Original for Recipient';
      doc.fontSize(9).font('Helvetica');
      const invoiceTypeWidth = doc.widthOfString(invoiceType);
      doc.text(invoiceType, PAGE_RIGHT - invoiceTypeWidth, 65);

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
      const invoiceNumberText = `Invoice No: ${order.invoiceNumber || order.id}`;
      const invoiceNumberWidth = doc.widthOfString(invoiceNumberText);
      doc.text(invoiceNumberText, PAGE_RIGHT - invoiceNumberWidth, infoY + 80);
      const dateText = `Date: ${new Date(order.date).toLocaleDateString('en-IN')}`;
      const dateWidth = doc.widthOfString(dateText);
      doc.font('Helvetica').text(dateText, PAGE_RIGHT - dateWidth, infoY + 94);

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
      rightText('Amount', colX.total, tableTop + 8);

      let y = tableTop + 35;
      doc.font('Helvetica').fontSize(9).fillColor(TEXT_LIGHT);

      const maxY = doc.page.height - 220;

      for (let index = 0; index < order.items.length; index++) {
        if (y > maxY) {
          const remaining = order.items.length - index;
          if (remaining > 0) {
            doc.font('Helvetica-Oblique').fontSize(9).fillColor(TEXT_LIGHT);
            doc.text(`+ ${remaining} more item(s)`, colX.item, y);
          }
          break;
        }

        const item = order.items[index];
        const itemTotal = (item.price + (item.selectedLens?.price || 0)) * item.quantity;
        const itemTaxable = itemTotal / (1 + GST_CONFIG.GST_RATE);

        const name = item.name.length > 40 ? `${item.name.substring(0, 37)}...` : item.name;
        doc.font('Helvetica').fontSize(9).fillColor(TEXT_LIGHT);
        doc.text(name, colX.item, y, { width: 190 });
        doc.text(GST_CONFIG.HSN_CODE, colX.hsn, y);
        doc.text(item.quantity.toString(), colX.qty, y, { align: 'center' });
        rightText(formatCurrency(itemTaxable / item.quantity), colX.price, y);
        rightText(formatCurrency(itemTaxable), colX.total, y);

        if (item.selectedLens) {
          y += 12;
          doc.font('Helvetica').fontSize(8).fillColor(TEXT_DARK);
          doc.text(`+ ${item.selectedLens.name}`, colX.item, y, { width: 190 });
          doc.font('Helvetica').fontSize(9).fillColor(TEXT_LIGHT);
        }

        y += 18;
        if (index < order.items.length - 1 && y <= maxY) {
          doc.moveTo(PAGE_LEFT, y - 6).lineTo(PAGE_RIGHT, y - 6).strokeColor(BORDER).lineWidth(0.5).stroke();
        }
      }

      // --- TOTALS ---
      y = doc.page.height - 170;
      const t = order.taxBreakdown;
      if (t) {
        const drawRow = (label: string, value: string, bold = false) => {
          const labelX = PAGE_RIGHT - 200;
          const valueX = PAGE_RIGHT - 10;

          doc.font(bold ? 'Helvetica-Bold' : 'Helvetica')
            .fontSize(9)
            .fillColor(bold ? TEXT_DARK : TEXT_LIGHT);

          doc.text(label, labelX, y);
          const valueWidth = doc.widthOfString(value);
          doc.text(value, valueX - valueWidth, y);
          y += 14;
        };

        drawRow('Taxable Amount', formatCurrency(t.taxableAmount));

        if (t.isInterState) {
          drawRow(`IGST (${GST_CONFIG.GST_RATE * 100}%)`, formatCurrency(t.igst));
        } else {
          const half = (GST_CONFIG.GST_RATE * 100) / 2;
          drawRow(`CGST (${half}%)`, formatCurrency(t.cgst));
          drawRow(`SGST (${half}%)`, formatCurrency(t.sgst));
        }

        y += 12;
        const boxTop = y;
        const boxHeight = 36;
        const boxLeft = PAGE_RIGHT - 200;

        doc.roundedRect(boxLeft, boxTop, 200, boxHeight, 4).fill(PRIMARY);
        doc.fillColor('white').fontSize(11).font('Helvetica-Bold');
        doc.text('Total Payable', boxLeft + 12, boxTop + 13);

        const totalText = formatCurrency(t.totalAmount);
        const totalWidth = doc.widthOfString(totalText);
        doc.text(totalText, PAGE_RIGHT - 16 - totalWidth, boxTop + 13);
        y = boxTop + boxHeight + 20;
      }

      // --- FOOTER ---
      const footerBaseY = doc.page.height - 100;
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
