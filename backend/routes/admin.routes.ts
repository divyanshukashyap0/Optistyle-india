
import express from 'express';
import { 
    processRefundDecision, 
    exportData, 
    getRefundRequests,
    getUsers,
    modifyUser,
    getSettings,
    updateSettings,
    getLogs,
    createSensitiveRequest,
    getApprovals,
    decideApproval,
    addProduct,
    editProduct,
    removeProduct,
    manageOrderStatus,
    getDashboardStatistics
} from '../controllers/admin.controller.ts';
import { verifyAdmin } from '../middleware/authMiddleware.ts';

const router = express.Router();

// 🔒 ALL ADMIN ROUTES ARE PROTECTED
router.use(verifyAdmin);

// Dashboard
router.get('/stats', getDashboardStatistics);

// Product Management
router.post('/products', addProduct);
router.put('/products/:id', editProduct);
router.delete('/products/:id', removeProduct);

// Order Management
router.post('/orders/status', manageOrderStatus);

// Approval Workflow (Governance)
router.get('/approvals', getApprovals);
router.post('/approvals/create', createSensitiveRequest);
router.post('/approvals/decide', decideApproval);

// Refund Management
router.get('/refunds', getRefundRequests);
router.post('/refund-decision', processRefundDecision);

// Data Export
router.get('/export', exportData);

// User Management
router.get('/users', getUsers);
router.post('/users/modify', modifyUser);

// System Configuration
router.get('/system', getSettings);
router.post('/system', updateSettings);

// Audit Logs
router.get('/logs', getLogs);

export default router;
