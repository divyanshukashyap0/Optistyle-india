import express from 'express';
import { createOrder, verifyPayment, requestRefund, downloadInvoice } from '../controllers/payment.controller.ts';

const router = express.Router();

// Checkout
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);

// User Actions
router.post('/refund-request', requestRefund);
router.get('/invoice/:orderId', downloadInvoice);

export default router;
