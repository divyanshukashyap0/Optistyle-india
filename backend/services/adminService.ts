import type { Product, Order, User } from '../../types.ts';
import { MOCK_USER } from '../../src/constants.ts';
import { getAllOrders, getAnalyticsData, getAllProducts, addProductToDB, updateProductInDB, deleteProductFromDB } from './db.ts';

// --- PRODUCT SERVICES ---
export const getAdminProducts = async () => {
  return await getAllProducts();
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  const newProduct = { ...product, id: Math.random().toString(36).substr(2, 9) };
  await addProductToDB(newProduct);
  return newProduct;
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  await updateProductInDB(id, updates);
  // Return updated mock or refetch needed in real app
  return { id, ...updates } as Product;
};

export const deleteProduct = async (id: string) => {
  await deleteProductFromDB(id);
  return true;
};

// --- ORDER SERVICES ---
export const getAdminOrders = async () => {
    return await getAllOrders();
};

export const updateOrderStatus = async (id: string, status: Order['status']) => {
  // Logic handled in controllers usually, but for dashboard direct toggle:
  const { updateOrderInDB, getOrderById } = await import('./db.ts');
  await updateOrderInDB(id, { status });
  return await getOrderById(id);
};

// --- USER SERVICES ---
// For now, still mocking users list as it requires Auth Admin API which is heavier to set up for simple dashboard
let usersDb: User[] = [
  MOCK_USER as User,
  { id: 'u456', name: 'Amit Verma', email: 'amit@test.com', role: 'user' },
  { id: 'u789', name: 'Priya Singh', email: 'priya@test.com', role: 'user' },
  { id: 'admin1', name: 'System Admin', email: 'optistyle.india@gmail.com', role: 'admin' }
];

export const getAdminUsers = async () => [...usersDb];

// --- ANALYTICS SERVICE ---
export const getDashboardStats = async () => {
  const analytics = await getAnalyticsData();
  const allOrders = await getAllOrders();
  
  // Calculate specific dashboard metrics not stored in daily analytics
  const pendingOrders = allOrders.filter(o => o.status === 'pending' || o.status === 'cod_pending').length;
  const pendingCODValue = allOrders
    .filter(o => o.status === 'cod_pending')
    .reduce((acc, o) => acc + o.total, 0);

  return {
    totalRevenue: analytics.totalRevenue,
    pendingCODRevenue: pendingCODValue,
    totalOrders: analytics.totalOrders,
    pendingOrders: pendingOrders,
    totalUsers: usersDb.length,
    lowStock: 2, 
    paymentSplit: analytics.paymentSplit
  };
};
