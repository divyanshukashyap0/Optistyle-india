import axios from 'axios';

// In production, this would come from import.meta.env.VITE_API_URL
const API_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock API delays to simulate real world latency
api.interceptors.response.use(
  async (response) => {
    // Keep delay small for chat to feel responsive
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
    // Create blob link to download
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
