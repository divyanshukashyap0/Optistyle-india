import express from 'express';
import { verifyUser } from '../middleware/authMiddleware.ts';
import { getMyOrders } from '../controllers/order.controller.ts';

const router = express.Router();

// Protected route: Ensure that a logged-in user can view ONLY their own order history
// Middleware 'verifyUser' ensures Firebase token is valid and attaches 'uid' to request
router.get('/my-orders', verifyUser, getMyOrders);

export default router;
