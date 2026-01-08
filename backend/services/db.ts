
import { db } from '../config/firebase.ts';
import type { Order } from './store.ts';
import type { Product, User } from '../../types.ts'; 

// --- COLLECTIONS (Lazy Access Pattern) ---
const getOrdersCol = () => db.collection('orders');
const getProductsCol = () => db.collection('products');
const getRefundsCol = () => db.collection('refunds');
const getAnalyticsCol = () => db.collection('analytics');
const getUsersCol = () => db.collection('users');
const getSystemCol = () => db.collection('system');
const getAuditCol = () => db.collection('audit_logs');
const getApprovalsCol = () => db.collection('approvals');

// --- TYPES ---
export interface ApprovalRequest {
  id: string;
  type: 'MAINTENANCE_TOGGLE' | 'REFUND_LARGE' | 'SENSITIVE_UPDATE';
  data: any;
  requesterId: string;
  requesterName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  approverId?: string;
  approverName?: string;
  rejectionReason?: string;
}

// --- ORDERS ---

export const createOrderInDB = async (order: Order) => {
  try {
    // Create main order document
    await getOrdersCol().doc(order.id).set({
      ...order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("DB Create Order Error:", error);
    throw new Error("Database Write Failed");
  }
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const doc = await getOrdersCol().doc(orderId).get();
  if (!doc.exists) return null;
  return doc.data() as Order;
};

export const getOrderByRazorpayId = async (razorpayOrderId: string): Promise<Order | null> => {
  const snapshot = await getOrdersCol().where('razorpayOrderId', '==', razorpayOrderId).limit(1).get();
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as Order;
};

export const updateOrderInDB = async (orderId: string, updates: Partial<Order>) => {
  await getOrdersCol().doc(orderId).update({
    ...updates,
    updatedAt: new Date().toISOString()
  });
};

export const getAllOrders = async (): Promise<Order[]> => {
  const snapshot = await getOrdersCol().orderBy('date', 'desc').get();
  return snapshot.docs.map(doc => doc.data() as Order);
};

// --- PRODUCTS ---

export const getAllProducts = async (): Promise<any[]> => {
  const snapshot = await getProductsCol().get();
  if (snapshot.empty) return [];
  return snapshot.docs.map(doc => doc.data());
};

export const addProductToDB = async (product: any) => {
  await getProductsCol().doc(product.id).set(product);
};

export const updateProductInDB = async (id: string, updates: any) => {
  await getProductsCol().doc(id).update(updates);
};

export const deleteProductFromDB = async (id: string) => {
  await getProductsCol().doc(id).delete();
};

// --- USERS ---

export const getAllUsers = async (): Promise<User[]> => {
  const snapshot = await getUsersCol().get();
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || 'Unknown',
      email: data.email || '',
      role: data.role || 'user',
      isDisabled: data.isDisabled || false,
      lastLogin: data.lastLogin
    } as User & { isDisabled: boolean, lastLogin?: string };
  });
};

export const updateUserStatus = async (uid: string, updates: { isDisabled?: boolean, role?: 'user' | 'admin' }) => {
  await getUsersCol().doc(uid).update(updates);
};

// --- SYSTEM & GOVERNANCE ---

export interface SystemConfig {
  maintenanceMode: boolean;
  allowCheckout: boolean;
  aiEnabled: boolean;
  bannerMessage: string;
  gstEnabled: boolean;
}

export const getSystemSettings = async (): Promise<SystemConfig> => {
  const doc = await getSystemCol().doc('config').get();
  if (!doc.exists) {
    return {
      maintenanceMode: false,
      allowCheckout: true,
      aiEnabled: true,
      bannerMessage: '',
      gstEnabled: true
    };
  }
  return doc.data() as SystemConfig;
};

export const updateSystemSettings = async (settings: Partial<SystemConfig>) => {
  await getSystemCol().doc('config').set(settings, { merge: true });
};

// --- APPROVALS ---

export const createApprovalRequest = async (req: Omit<ApprovalRequest, 'id' | 'status' | 'createdAt'>) => {
  const newReq = {
    ...req,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };
  const ref = await getApprovalsCol().add(newReq);
  return { id: ref.id, ...newReq };
};

export const getPendingApprovals = async () => {
  const snapshot = await getApprovalsCol().where('status', '==', 'PENDING').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ApprovalRequest));
};

export const updateApprovalStatus = async (
  id: string, 
  status: 'APPROVED' | 'REJECTED', 
  approver: { id: string, name: string },
  reason?: string
) => {
  await getApprovalsCol().doc(id).update({
    status,
    approverId: approver.id,
    approverName: approver.name,
    rejectionReason: reason || null,
    updatedAt: new Date().toISOString()
  });
};

export const getApprovalById = async (id: string) => {
  const doc = await getApprovalsCol().doc(id).get();
  return doc.exists ? ({ id: doc.id, ...doc.data() } as ApprovalRequest) : null;
};

// --- AUDIT ---

export const logAdminAction = async (adminId: string, action: string, details: string) => {
  await getAuditCol().add({
    adminId,
    action,
    details,
    timestamp: new Date().toISOString()
  });
};

export const getAuditLogs = async () => {
  const snapshot = await getAuditCol().orderBy('timestamp', 'desc').limit(100).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- ANALYTICS ---

export const createRefundRecord = async (refundData: any) => {
  await getRefundsCol().doc(refundData.refundId).set({
    ...refundData,
    createdAt: new Date().toISOString()
  });
};

export const updateAnalytics = async (amount: number, method: 'ONLINE' | 'COD') => {
  const today = new Date().toISOString().split('T')[0];
  const analyticsRef = getAnalyticsCol().doc(today);
  
  try {
    await db.runTransaction(async (t) => {
      const doc = await t.get(analyticsRef);
      if (!doc.exists) {
        t.set(analyticsRef, {
          date: today,
          totalRevenue: amount,
          totalOrders: 1,
          codOrders: method === 'COD' ? 1 : 0,
          onlinePayments: method === 'ONLINE' ? 1 : 0,
          refundsCount: 0
        });
      } else {
        const data = doc.data();
        t.update(analyticsRef, {
          totalRevenue: (data?.totalRevenue || 0) + amount,
          totalOrders: (data?.totalOrders || 0) + 1,
          codOrders: (data?.codOrders || 0) + (method === 'COD' ? 1 : 0),
          onlinePayments: (data?.onlinePayments || 0) + (method === 'ONLINE' ? 1 : 0)
        });
      }
    });
  } catch (e) {
    console.error("Analytics Update Failed", e);
  }
};

export const getAnalyticsData = async () => {
    const snapshot = await getAnalyticsCol().get();
    let totalRevenue = 0;
    let totalOrders = 0;
    let codOrders = 0;
    let onlinePayments = 0;

    snapshot.forEach(doc => {
        const d = doc.data();
        totalRevenue += d.totalRevenue;
        totalOrders += d.totalOrders;
        codOrders += d.codOrders;
        onlinePayments += d.onlinePayments;
    });

    return {
        totalRevenue,
        totalOrders,
        paymentSplit: {
            cod: codOrders,
            online: onlinePayments
        }
    };
};
