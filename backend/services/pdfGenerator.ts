
import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';
import type { Order } from '../../types.ts';
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

      // --- HEADER WITH VECTOR LOGO ---
      doc.roundedRect(40, 40, 40, 40, 10).fill(PRIMARY);
      
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
      doc.fillColor(TEXT_DARK).fontSize(16).font('Helvetica-Bold').text('TAX INVOICE', 400, 45, { align: 'right' });
      
      const invoiceType = order.paymentMethod === 'COD' ? 'Bill of Supply (COD)' : 'Original for Recipient';
      doc.fontSize(9).font('Helvetica').text(invoiceType, 400, 65, { align: 'right' });

      // Separator
      doc.moveTo(40, 95).lineTo(555, 95).strokeColor(BORDER).lineWidth(1).stroke();

      // --- INFO SECTION ---
      const infoY = 110;
      
      // Seller Info
      doc.fontSize(8).font('Helvetica-Bold').fillColor(TEXT_LIGHT).text('SOLD BY', 40, infoY);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(TEXT_DARK).text(`${BRAND.name} India Pvt Ltd.`, 40, infoY + 12);
      doc.fontSize(9).font('Helvetica').fillColor(TEXT_LIGHT);
      doc.text('Plot 42, Hitech City', 40, infoY + 26);
      doc.text('Hyderabad, Telangana - 500081', 40, infoY + 38);
      doc.text(`GSTIN: ${GST_CONFIG.SELLER_GSTIN}`, 40, infoY + 50);

      // Bill To
      doc.fontSize(8).font('Helvetica-Bold').fillColor(TEXT_LIGHT).text('BILL TO', 300, infoY);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(TEXT_DARK).text(order.user.name, 300, infoY + 12);
      doc.fontSize(9).font('Helvetica').fillColor(TEXT_LIGHT);
      doc.text(order.user.address || 'Address Not Provided', 300, infoY + 26, { width: 200 });
      doc.text(`${order.user.city || ''}, ${order.user.state || ''} ${order.user.zip || ''}`, 300, doc.y);
      doc.text(`Phone: ${order.user.phone || 'N/A'}`, 300, doc.y + 4);

      // Invoice Meta
      doc.fontSize(9).font('Helvetica-Bold').fillColor(TEXT_DARK);
      doc.text(`Invoice No: ${order.invoiceNumber || order.id}`, 400, infoY + 80, { align: 'right' });
      doc.font('Helvetica').text(`Date: ${new Date(order.date).toLocaleDateString('en-IN')}`, 400, infoY + 94, { align: 'right' });

      // --- TABLE ---
      const tableTop = 230;
      const colX = { item: 50, hsn: 280, qty: 340, price: 400, total: 490 };
      
      doc.rect(40, tableTop, 515, 25).fill(BG_LIGHT);
      doc.fillColor(TEXT_DARK).fontSize(9).font('Helvetica-Bold');
      doc.text('Item Description', colX.item, tableTop + 8);
      doc.text('HSN', colX.hsn, tableTop + 8);
      doc.text('Qty', colX.qty, tableTop + 8, { align: 'center' });
      doc.text('Rate', colX.price, tableTop + 8, { align: 'right' });
      doc.text('Amount', colX.total, tableTop + 8, { align: 'right' });

      let y = tableTop + 35;
      doc.font('Helvetica').fontSize(9).fillColor(TEXT_LIGHT);
      
      order.items.forEach((item) => {
        const itemTotal = (item.price + (item.selectedLens?.price || 0)) * item.quantity;
        const itemTaxable = itemTotal / (1 + GST_CONFIG.GST_RATE);
        
        doc.text(item.name.substring(0, 35), colX.item, y);
        doc.text(GST_CONFIG.HSN_CODE, colX.hsn, y);
        doc.text(item.quantity.toString(), colX.qty, y, { align: 'center' });
        doc.text(formatCurrency(itemTaxable / item.quantity), colX.price, y, { align: 'right' });
        doc.text(formatCurrency(itemTaxable), colX.total, y, { align: 'right' });
        
        if (item.selectedLens) {
            y += 12;
            doc.fontSize(8).text(`+ ${item.selectedLens.name}`, colX.item, y, { oblique: true });
            doc.fontSize(9).font('Helvetica');
        }
        
        y += 20;
        doc.moveTo(40, y - 8).lineTo(555, y - 8).strokeColor(BORDER).lineWidth(0.5).stroke();
      });

      // --- TOTALS ---
      y += 10;
      const t = order.taxBreakdown;
      if (t) {
        const rightAlign = 490;
        const labelAlign = 380; 

        const drawRow = (label: string, value: string, bold = false) => {
            doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9).fillColor(bold ? TEXT_DARK : TEXT_LIGHT);
            doc.text(label, labelAlign, y, { align: 'right' });
            doc.text(value, rightAlign, y, { align: 'right' });
            y += 16;
        };

        drawRow('Taxable Amount:', formatCurrency(t.taxableAmount));
        
        if (t.isInterState) {
          drawRow(`IGST (${GST_CONFIG.GST_RATE * 100}%):`, formatCurrency(t.igst));
        } else {
          drawRow(`CGST (${(GST_CONFIG.GST_RATE * 100) / 2}%):`, formatCurrency(t.cgst));
          drawRow(`SGST (${(GST_CONFIG.GST_RATE * 100) / 2}%):`, formatCurrency(t.sgst));
        }

        y += 5;
        doc.roundedRect(360, y, 195, 30, 4).fill(PRIMARY);
        doc.fillColor('white').fontSize(11).font('Helvetica-Bold');
        doc.text('Total Payable:', 380, y + 10, { align: 'right' });
        doc.text(formatCurrency(t.totalAmount), 540, y + 10, { align: 'right' });
      }

      // --- FOOTER ---
      const footerY = 730;
      doc.moveTo(40, footerY).lineTo(555, footerY).strokeColor(BORDER).lineWidth(1).stroke();
      
      doc.fontSize(8).font('Helvetica').fillColor(TEXT_LIGHT);
      doc.text('Terms & Conditions:', 40, footerY + 15);
      doc.text('1. Goods once sold will not be taken back unless defective.', 40, footerY + 27);
      doc.text('2. Subject to Hyderabad Jurisdiction only.', 40, footerY + 39);
      
      doc.text('Authorized Signatory', 450, footerY + 15, { align: 'center' });
      doc.font('Helvetica-Bold').text(`${BRAND.name} India`, 450, footerY + 45, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
