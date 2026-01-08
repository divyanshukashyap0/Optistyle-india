import type { Order } from '../services/store.ts';

/**
 * Escapes CSV fields to handle commas and quotes
 */
const escapeCsv = (field: any) => {
  if (field === null || field === undefined) return '';
  const stringField = String(field);
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
};

/**
 * Generates CSV for Sales/Orders (Tally Compatible)
 */
export const generateOrdersCSV = (orders: Order[]) => {
  const headers = [
    'Voucher Date', 
    'Invoice Number', 
    'Order ID',
    'Customer Name', 
    'Customer GSTIN', 
    'State', 
    'Item Name', 
    'Quantity', 
    'Rate', 
    'Taxable Value', 
    'CGST Amount', 
    'SGST Amount', 
    'IGST Amount', 
    'Total Amount',
    'Payment Mode'
  ];

  const rows = orders.map(order => {
    // Flatten items for line-item export
    return order.items.map(item => {
        const gstRate = order.taxBreakdown?.rate || 18;
        const itemTotal = (item.price + (item.selectedLens?.price || 0)) * item.quantity;
        const taxable = Number((itemTotal / (1 + (gstRate/100))).toFixed(2));
        const taxAmount = itemTotal - taxable;
        
        let cgst = 0, sgst = 0, igst = 0;
        if (order.taxBreakdown?.isInterState) {
            igst = Number(taxAmount.toFixed(2));
        } else {
            cgst = Number((taxAmount / 2).toFixed(2));
            sgst = Number((taxAmount / 2).toFixed(2));
        }

        return [
            new Date(order.date).toLocaleDateString('en-GB'), // DD/MM/YYYY for India
            order.invoiceNumber || order.id,
            order.id,
            escapeCsv(order.user.name),
            '', // GSTIN (Consumer)
            escapeCsv(order.user.state),
            escapeCsv(item.name),
            item.quantity,
            item.price,
            taxable,
            cgst,
            sgst,
            igst,
            itemTotal,
            order.paymentMethod
        ].join(',');
    }).join('\n');
  }).join('\n');

  return `${headers.join(',')}\n${rows}`;
};

/**
 * Generates CSV for Refunds (Accounting Credit Notes)
 */
export const generateRefundsCSV = (orders: Order[]) => {
    const refundedOrders = orders.filter(o => o.refundStatus === 'REFUNDED');
    
    const headers = [
        'Refund Date',
        'Original Invoice No',
        'Order ID',
        'Customer Name',
        'Refund Amount',
        'Payment ID',
        'Reason'
    ];

    const rows = refundedOrders.map(order => {
        return [
            new Date(order.refundDate || new Date()).toLocaleDateString('en-GB'),
            order.invoiceNumber || '',
            order.id,
            escapeCsv(order.user.name),
            order.total,
            order.paymentId || 'COD',
            escapeCsv(order.refundReason || 'Return')
        ].join(',');
    }).join('\n');

    return `${headers.join(',')}\n${rows}`;
};
