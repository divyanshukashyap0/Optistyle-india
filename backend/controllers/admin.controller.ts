
import type { Request, Response } from 'express';
import { getRazorpayClient } from '../clients/razorpayClient.ts';
import { generateOrdersCSV, generateRefundsCSV } from '../utils/exportUtils.ts';
import { 
    getAllOrders, 
    getOrderById, 
    updateOrderInDB, 
    createRefundRecord,
    getAllUsers,
    updateUserStatus,
    getSystemSettings,
    updateSystemSettings,
    logAdminAction,
    getAuditLogs,
    createApprovalRequest,
    getPendingApprovals,
    updateApprovalStatus,
    getApprovalById,
    addProductToDB,
    updateProductInDB,
    deleteProductFromDB,
    getAnalyticsData
} from '../services/db.ts';
import type { AuthRequest } from '../middleware/authMiddleware.ts';

// --- DASHBOARD STATS ---
export const getDashboardStatistics = async (req: Request, res: Response) => {
    try {
        const stats = await getAnalyticsData();
        const users = await getAllUsers();
        
        res.json({
            ...stats,
            totalUsers: users.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch statistics' });
    }
};

// --- PRODUCT MANAGEMENT ---
export const addProduct = async (req: Request, res: Response) => {
    try {
        const product = req.body;
        const adminId = (req as AuthRequest).user?.uid || 'system';
        
        // Ensure ID
        if (!product.id) product.id = Math.random().toString(36).substr(2, 9);
        
        await addProductToDB(product);
        await logAdminAction(adminId, 'ADD_PRODUCT', `ID: ${product.id}`);
        
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add product' });
    }
};

export const editProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const adminId = (req as AuthRequest).user?.uid || 'system';
        
        await updateProductInDB(id, updates);
        await logAdminAction(adminId, 'UPDATE_PRODUCT', `ID: ${id}`);
        
        res.json({ success: true, message: 'Product updated' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update product' });
    }
};

export const removeProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const adminId = (req as AuthRequest).user?.uid || 'system';
        
        await deleteProductFromDB(id);
        await logAdminAction(adminId, 'DELETE_PRODUCT', `ID: ${id}`);
        
        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete product' });
    }
};

// --- ORDER MANAGEMENT ---
export const manageOrderStatus = async (req: Request, res: Response) => {
    try {
        const { orderId, status } = req.body;
        const adminId = (req as AuthRequest).user?.uid || 'system';
        
        await updateOrderInDB(orderId, { status });
        await logAdminAction(adminId, 'UPDATE_ORDER_STATUS', `Order: ${orderId} -> ${status}`);
        
        res.json({ success: true, message: 'Order status updated' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update order status' });
    }
};

// --- APPROVAL WORKFLOW ---

export const createSensitiveRequest = async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;
    const admin = (req as AuthRequest).user;
    
    if (!admin) return res.status(401).json({ message: 'Unauthorized' });

    await createApprovalRequest({
      type,
      data,
      requesterId: admin.uid,
      requesterName: admin.email || 'Admin'
    });

    await logAdminAction(admin.uid, 'CREATE_REQUEST', `Type: ${type}`);
    res.json({ success: true, message: 'Request submitted for peer approval.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create request' });
  }
};

export const getApprovals = async (req: Request, res: Response) => {
  const list = await getPendingApprovals();
  res.json(list);
};

export const decideApproval = async (req: Request, res: Response) => {
  try {
    const { requestId, decision, reason } = req.body; // 'APPROVED' | 'REJECTED'
    const admin = (req as AuthRequest).user;
    if (!admin) return res.status(401).json({ message: 'Unauthorized' });

    const request = await getApprovalById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Enforce Multi-Admin Rule: Cannot approve own request
    if (request.requesterId === admin.uid && decision === 'APPROVED') {
      return res.status(403).json({ success: false, message: 'You cannot approve your own request.' });
    }

    await updateApprovalStatus(requestId, decision, { id: admin.uid, name: admin.email || 'Admin' }, reason);
    await logAdminAction(admin.uid, decision === 'APPROVED' ? 'APPROVE_REQUEST' : 'REJECT_REQUEST', `ID: ${requestId}`);

    // EXECUTE LOGIC IF APPROVED
    if (decision === 'APPROVED') {
      if (request.type === 'MAINTENANCE_TOGGLE') {
        await updateSystemSettings(request.data); // data contains partial SystemConfig
      }
      // Add other types here (e.g., REFUND_LARGE)
    }

    res.json({ success: true, message: `Request ${decision.toLowerCase()}.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Decision processing failed' });
  }
};

// --- REFUNDS ---
export const processRefundDecision = async (req: Request, res: Response) => {
  try {
    const { orderId, decision, adminNote } = req.body;
    const adminId = (req as AuthRequest).user?.uid || 'system';
    
    const order = await getOrderById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (decision === 'REJECT') {
        await updateOrderInDB(orderId, {
            refundStatus: 'REJECTED',
            failureReason: adminNote || 'Rejected by Admin'
        });
        await logAdminAction(adminId, 'REFUND_REJECT', `Order: ${orderId}`);
        return res.json({ success: true, message: 'Refund Request Rejected' });
    }

    if (decision === 'APPROVE') {
        const refundData = {
            refundId: `REF-${Date.now()}`,
            orderId: order.id,
            paymentId: order.paymentId || 'COD',
            amount: order.total,
            status: 'APPROVED'
        };

        if (order.paymentMethod === 'COD') {
             await updateOrderInDB(orderId, {
                 refundStatus: 'REFUNDED',
                 status: 'refunded',
                 refundDate: new Date().toISOString()
             });
             await createRefundRecord({ ...refundData, status: 'REFUNDED', type: 'COD_MANUAL' });
             await logAdminAction(adminId, 'REFUND_APPROVE_COD', `Order: ${orderId}`);
             return res.json({ success: true, message: 'Marked as Refunded (COD - Manual Payout)' });
        }

        if (!order.paymentId) {
             return res.status(400).json({ success: false, message: 'No Payment ID found for Online Order' });
        }

        const paymentId = order.paymentId;
        const isLikelyRazorpayPayment = typeof paymentId === 'string' && paymentId.startsWith('pay_');

        if (!isLikelyRazorpayPayment) {
             await updateOrderInDB(orderId, {
                 refundStatus: 'FAILED',
                 failureReason: 'Invalid payment reference for online refund'
             });
             await createRefundRecord({ ...refundData, status: 'FAILED', type: 'ONLINE_AUTO' });
             await logAdminAction(adminId, 'REFUND_FAIL_ONLINE_INVALID_ID', `Order: ${orderId}`);
             return res.status(400).json({ success: false, message: 'Invalid payment reference for online refund' });
        }

        try {
             const instance = getRazorpayClient();
             await instance.payments.refund(paymentId, {
                 speed: 'normal',
                 notes: { reason: order.refundReason || 'Admin Approved Return' }
             });
        } catch (gatewayError: any) {
             console.error("Refund Processing Error", gatewayError);
             const description = gatewayError?.error?.description || gatewayError?.description || 'Refund processing failed at payment gateway';
             const statusCode = typeof gatewayError?.statusCode === 'number' ? gatewayError.statusCode : 502;

             await updateOrderInDB(orderId, {
                 refundStatus: 'FAILED',
                 failureReason: description
             });

             await createRefundRecord({ ...refundData, status: 'FAILED', type: 'ONLINE_AUTO' });
             await logAdminAction(adminId, 'REFUND_APPROVE_ONLINE_FAILED', `Order: ${orderId} - ${description}`);

             return res.status(statusCode).json({ success: false, message: description });
        }

        await updateOrderInDB(orderId, {
             refundStatus: 'REFUNDED',
             status: 'refunded',
             refundDate: new Date().toISOString()
        });

        await createRefundRecord({ ...refundData, status: 'REFUNDED', type: 'ONLINE_AUTO' });
        await logAdminAction(adminId, 'REFUND_APPROVE_ONLINE', `Order: ${orderId}`);

        return res.json({ success: true, message: 'Refund Processed via Razorpay' });
    }

    res.status(400).json({ success: false, message: 'Invalid Decision' });
  } catch (error: any) {
    console.error("Refund Processing Error", error);
    res.status(500).json({ success: false, message: error.message || 'Refund processing failed' });
  }
};

// --- EXPORT ---
export const exportData = async (req: Request, res: Response) => {
    try {
        const { type } = req.query; // 'orders' | 'refunds'
        const orders = await getAllOrders();
        const adminId = (req as AuthRequest).user?.uid || 'system';
        
        await logAdminAction(adminId, 'EXPORT_DATA', `Type: ${type}`);

        let csvData = '';
        let filename = 'export.csv';

        if (type === 'orders') {
            csvData = generateOrdersCSV(orders);
            filename = `Sales_Export_${new Date().toISOString().split('T')[0]}.csv`;
        } else if (type === 'refunds') {
            csvData = generateRefundsCSV(orders);
            filename = `Refunds_Export_${new Date().toISOString().split('T')[0]}.csv`;
        } else {
            return res.status(400).send('Invalid export type');
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(csvData);

    } catch (error: any) {
        console.error("Export Error", error);
        res.status(500).send("Export failed");
    }
};

export const getRefundRequests = async (req: Request, res: Response) => {
    const orders = await getAllOrders();
    const requests = orders.filter(o => o.refundStatus === 'REQUESTED');
    res.json(requests);
};

// --- USER MANAGEMENT ---
export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

export const modifyUser = async (req: Request, res: Response) => {
    try {
        const { uid, action } = req.body; 
        const adminId = (req as AuthRequest).user?.uid || 'system';

        if (uid === adminId) {
            return res.status(400).json({ message: "Cannot modify your own account" });
        }

        let updates = {};
        if (action === 'ban') updates = { isDisabled: true };
        else if (action === 'unban') updates = { isDisabled: false };
        else if (action === 'promote') updates = { role: 'admin' };
        else if (action === 'demote') updates = { role: 'user' };

        await updateUserStatus(uid, updates);
        await logAdminAction(adminId, 'USER_MODIFICATION', `User: ${uid}, Action: ${action}`);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Failed to update user" });
    }
};

// --- SYSTEM SETTINGS ---
export const getSettings = async (req: Request, res: Response) => {
    const settings = await getSystemSettings();
    res.json(settings);
};

export const updateSettings = async (req: Request, res: Response) => {
    const adminId = (req as AuthRequest).user?.uid || 'system';
    
    // For non-critical updates, allow direct save
    await updateSystemSettings(req.body);
    await logAdminAction(adminId, 'UPDATE_SETTINGS', JSON.stringify(req.body));
    res.json({ success: true });
};

// --- AUDIT LOGS ---
export const getLogs = async (req: Request, res: Response) => {
    const logs = await getAuditLogs();
    res.json(logs);
};
