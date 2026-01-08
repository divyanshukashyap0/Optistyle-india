import { Product, Order, User } from '../types';
import { PRODUCTS, MOCK_USER } from '../constants';

// --- MOCK DATABASE STATE ---
// In a real app, this would be a database. Here we keep it in memory.
let productsDb: Product[] = [...PRODUCTS];

// Mocking some extra orders for the demo
let ordersDb: Order[] = [
  {
    id: 'ORD-7782-X',
    userId: 'u123',
    user: {
      name: 'Rahul Sharma',
      email: 'rahul@example.com'
    },
    currency: 'INR',
    items: [productsDb[0] as any],
    total: 1499,
    status: 'delivered',
    paymentMethod: 'ONLINE',
    date: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'ORD-9921-Y',
    userId: 'u456',
    user: {
      name: 'Amit Verma',
      email: 'amit@test.com'
    },
    currency: 'INR',
    items: [productsDb[1] as any],
    total: 1999,
    status: 'processing',
    paymentMethod: 'ONLINE',
    date: new Date().toISOString()
  },
  {
    id: 'ORD-3321-Z',
    userId: 'u789',
    user: {
      name: 'Priya Singh',
      email: 'priya@test.com'
    },
    currency: 'INR',
    items: [productsDb[2] as any],
    total: 1299,
    status: 'pending',
    paymentMethod: 'COD',
    date: new Date().toISOString()
  }
];

let usersDb: User[] = [
  MOCK_USER as User,
  { id: 'u456', name: 'Amit Verma', email: 'amit@test.com', role: 'user' },
  { id: 'u789', name: 'Priya Singh', email: 'priya@test.com', role: 'user' },
  { id: 'admin1', name: 'System Admin', email: 'admin@optistyle.com', role: 'admin' }
];

// --- PRODUCT SERVICES ---
export const getAdminProducts = async () => [...productsDb];

export const addProduct = async (product: Omit<Product, 'id'>) => {
  const newProduct = { ...product, id: Math.random().toString(36).substr(2, 9) };
  productsDb = [newProduct, ...productsDb];
  return newProduct;
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  productsDb = productsDb.map(p => p.id === id ? { ...p, ...updates } : p);
  return productsDb.find(p => p.id === id);
};

export const deleteProduct = async (id: string) => {
  productsDb = productsDb.filter(p => p.id !== id);
  return true;
};

// --- ORDER SERVICES ---
export const getAdminOrders = async () => [...ordersDb];

export const updateOrderStatus = async (id: string, status: Order['status']) => {
  ordersDb = ordersDb.map(o => o.id === id ? { ...o, status } : o);
  return ordersDb.find(o => o.id === id);
};

// --- USER SERVICES ---
export const getAdminUsers = async () => [...usersDb];

export const toggleUserStatus = async (id: string) => {
  // Mock function to toggle user active state
  return true; 
};

// --- STATS SERVICE ---
export const getDashboardStats = async () => {
  const revenue = ordersDb.reduce((acc, o) => acc + o.total, 0);
  return {
    totalRevenue: revenue,
    totalOrders: ordersDb.length,
    pendingOrders: ordersDb.filter(o => o.status === 'pending').length,
    totalUsers: usersDb.length,
    lowStock: 2 // Mocked
  };
};