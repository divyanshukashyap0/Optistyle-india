
import type { Request, Response } from 'express';
import { getRazorpayClient, RAZORPAY_CONFIG } from '../clients/razorpayClient.ts';
import { verifyRazorpaySignature } from '../utils/paymentVerify.ts';
import { sendOrderEmails } from '../services/emailService.ts';
import { generateInvoiceBuffer } from '../services/pdfGenerator.ts';
import { calculateGST } from '../utils/gstUtils.ts';
import { 
  createOrderInDB, 
  getOrderByRazorpayId, 
  updateOrderInDB, 
  getOrderById, 
  updateAnalytics 
} from '../services/db.ts';
import type { Order } from '../../src/types/index.ts';

interface CreateOrderBody {
  items: Order['items'];
  total: number;
  user: Order['user'];
  currency?: string;
  paymentMethod?: 'ONLINE' | 'COD';
}

export const createOrder = async (req: Request<{}, {}, CreateOrderBody>, res: Response) => {
  try {
    console.log('Create Order Request Body:', JSON.stringify(req.body, null, 2));
    const { items, total, user, currency = 'INR', paymentMethod = 'ONLINE' } = req.body;

    if (!total || total <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const taxBreakdown = calculateGST(total, user.state || 'Telangana');
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const internalOrderId = `ORD-${Date.now()}`;

    const baseOrder: Order = {
      id: internalOrderId,
      invoiceNumber,
      paymentMethod,
      refundStatus: 'NONE',
      total,
      taxBreakdown,
      currency,
      items,
      user,
      date: new Date().toISOString(),
      userId: user.email, // Using email as user ID fallback if not provided context
      status: paymentMethod === 'COD' ? 'cod_pending' : 'pending'
    };

    // Handle COD
    if (paymentMethod === 'COD') {
      await createOrderInDB(baseOrder);

      generateInvoiceBuffer(baseOrder)
        .then((pdfBuffer) => sendOrderEmails(baseOrder, pdfBuffer))
        .catch((err) => console.error("COD Email Error:", err));

      return res.status(200).json({
        success: true,
        paymentMethod: 'COD',
        internal_order_id: baseOrder.id,
        invoice_number: invoiceNumber,
        message: 'COD Order placed successfully'
      });
    }

    // Handle Online (Razorpay)
    const instance = getRazorpayClient();
    const options = {
      amount: Math.round(total * 100), 
      currency,
      receipt: invoiceNumber,
      notes: {
        customer_name: user.name,
        customer_email: user.email
      }
    };

    const razorpayOrder = await instance.orders.create(options);

    const newOrder: Order = {
      ...baseOrder,
      razorpayOrderId: razorpayOrder.id,
    };

    await createOrderInDB(newOrder);

    res.status(200).json({
      success: true,
      paymentMethod: 'ONLINE',
      order_id: razorpayOrder.id,
      internal_order_id: newOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: RAZORPAY_CONFIG.key_id,
      user_details: user
    });

  } catch (error: any) {
    console.error('Create Order Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment order',
    });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    const order = await getOrderByRazorpayId(razorpay_order_id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order record not found' });
    }

    if (isValid) {
      await updateOrderInDB(order.id, {
        status: 'processing',
        paymentId: razorpay_payment_id
      });
      
      updateAnalytics(order.total, 'ONLINE');

      const updatedOrder = { ...order, status: 'processing', paymentId: razorpay_payment_id } as Order;

      console.log(`✅ Order ${order.id} verified.`);

      generateInvoiceBuffer(updatedOrder)
        .then((pdfBuffer) => sendOrderEmails(updatedOrder, pdfBuffer))
        .catch((err) => console.error("Workflow Error:", err));

      return res.status(200).json({
        success: true,
        message: 'Payment verified',
        orderId: order.id
      });

    } else {
      await updateOrderInDB(order.id, {
        status: 'failed',
        failureReason: 'Signature Mismatch'
      });
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

  } catch (error: any) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const requestRefund = async (req: Request, res: Response) => {
  try {
    const { orderId, reason } = req.body;
    const order = await getOrderById(orderId);
    
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    if (order.status === 'pending' || order.status === 'failed') {
        return res.status(400).json({ success: false, message: 'Cannot refund unpaid order' });
    }
    if (order.refundStatus === 'REFUNDED' || order.refundStatus === 'REQUESTED') {
        return res.status(400).json({ success: false, message: 'Refund already in progress or completed' });
    }

    await updateOrderInDB(orderId, {
        refundStatus: 'REQUESTED',
        refundReason: reason || 'Customer Request',
        refundDate: new Date().toISOString()
    });

    res.status(200).json({ success: true, message: 'Refund request submitted for approval' });

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadInvoice = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const order = await getOrderById(orderId);

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        const pdfBuffer = await generateInvoiceBuffer(order);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice_${order.invoiceNumber || order.id}.pdf`);
        res.send(pdfBuffer);
    } catch (error: any) {
        console.error("Invoice Download Error", error);
        res.status(500).json({ success: false, message: "Could not generate invoice" });
    }
};
