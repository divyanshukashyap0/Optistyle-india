
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
    decideApproval
} from '../controllers/admin.controller.ts';
import { verifyAdmin } from '../middleware/authMiddleware.ts';

const router = express.Router();

// 🔒 ALL ADMIN ROUTES ARE PROTECTED
router.use(verifyAdmin);

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
