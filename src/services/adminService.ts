import { Product, Order, User } from '../types';
import { api, endpoints } from './api';

// --- PRODUCT SERVICES ---
export const getAdminProducts = async () => {
  try {
    const response = await api.get(endpoints.products);
    return response.data as Product[];
  } catch (error) {
    console.error("Failed to fetch products", error);
    return [];
  }
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  const response = await api.post(endpoints.admin.products, product);
  return response.data.product;
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  const response = await api.put(`${endpoints.admin.products}/${id}`, updates);
  return response.data;
};

export const deleteProduct = async (id: string) => {
  await api.delete(`${endpoints.admin.products}/${id}`);
  return true;
};

// --- ORDER SERVICES ---
export const getAdminOrders = async () => {
  try {
    const response = await api.get(endpoints.orders);
    return response.data as Order[];
  } catch (error) {
    console.error("Failed to fetch orders", error);
    return [];
  }
};

export const updateOrderStatus = async (id: string, status: Order['status']) => {
  const response = await api.post(endpoints.admin.status, { orderId: id, status });
  return response.data;
};

// --- USER SERVICES ---
export const getAdminUsers = async () => {
  try {
    const response = await api.get(endpoints.admin.users);
    return response.data as User[];
  } catch (error) {
    console.error("Failed to fetch users", error);
    return [];
  }
};

export const toggleUserStatus = async (id: string) => {
  // TODO: Implement user toggle logic in backend
  console.log("Toggle user status not yet implemented on backend for:", id);
  return true; 
};

// --- STATS SERVICE ---
export const getDashboardStats = async () => {
  try {
    const [statsRes, ordersRes] = await Promise.all([
      api.get(endpoints.admin.stats),
      api.get(endpoints.orders)
    ]);

    const stats = statsRes.data;
    const orders = ordersRes.data as Order[];
    
    return {
      totalRevenue: stats.totalRevenue || 0,
      totalOrders: stats.totalOrders || 0,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      totalUsers: stats.totalUsers || 0,
      lowStock: 0
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats", error);
    return {
      totalRevenue: 0,
      totalOrders: 0,
      pendingOrders: 0,
      totalUsers: 0,
      lowStock: 0
    };
  }
};
