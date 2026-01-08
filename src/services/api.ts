
import axios from 'axios';
import { auth } from '../firebase'; // Import client auth
import { ENV } from '../config/env';

const API_URL = ENV.API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach ID Token for Admin Routes
api.interceptors.request.use(async (config) => {
    // If request is for admin or secured endpoints, attach token
    if (config.url?.includes('/admin') || config.url?.includes('/payment')) {
        const user = auth?.currentUser;
        if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response Interceptor
api.interceptors.response.use(
  async (response) => {
    const delay = response.config.url?.includes('chat') ? 300 : 500;
    await new Promise(resolve => setTimeout(resolve, delay));
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const endpoints = {
  products: '/products',
  product: (id: string) => `/products/${id}`,
  orders: '/orders',
  createOrder: '/create-order',
  generateCertificate: '/certificate',
  chat: '/chat',
};

// --- API HELPER METHODS ---

export const downloadOrderInvoice = async (orderId: string) => {
  try {
    const response = await api.get(`/payment/invoice/${orderId}`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Invoice_${orderId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Download failed", error);
    alert("Could not download invoice.");
  }
};

export const requestOrderRefund = async (orderId: string, reason: string) => {
  return api.post('/payment/refund-request', { orderId, reason });
};

// Admin Methods
export const getAdminRefundRequests = async () => {
    const res = await api.get('/admin/refunds');
    return res.data;
};

export const processAdminRefund = async (orderId: string, decision: 'APPROVE' | 'REJECT') => {
    return api.post('/admin/refund-decision', { orderId, decision });
};

export const exportAdminData = async (type: 'orders' | 'refunds') => {
    const response = await api.get(`/admin/export?type=${type}`, {
        responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `OptiStyle_${type}_Export.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
};

export const getAdminUsers = async () => {
    const res = await api.get('/admin/users');
    return res.data;
};

export const modifyAdminUser = async (uid: string, action: string) => {
    return api.post('/admin/users/modify', { uid, action });
};

export const getSystemSettings = async () => {
    const res = await api.get('/admin/system');
    return res.data;
};

export const updateSystemSettings = async (settings: any) => {
    return api.post('/admin/system', settings);
};

export const createApprovalRequest = async (type: string, data: any) => {
    return api.post('/admin/approvals/create', { type, data });
};

export const getPendingApprovals = async () => {
    const res = await api.get('/admin/approvals');
    return res.data;
};

export const decideApproval = async (requestId: string, decision: 'APPROVED' | 'REJECTED') => {
    return api.post('/admin/approvals/decide', { requestId, decision });
};

export const getAuditLogs = async () => {
    const res = await api.get('/admin/logs');
    return res.data;
};
