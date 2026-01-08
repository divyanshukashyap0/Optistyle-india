import type { TaxBreakdown } from '../utils/gstUtils.ts';

// Kept for type compatibility
export interface Order {
  id: string; // Internal Order ID
  userId: string;
  invoiceNumber?: string;
  razorpayOrderId?: string;
  paymentId?: string;
  paymentMethod: 'ONLINE' | 'COD';
  status: 'pending' | 'cod_pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'shipped' | 'delivered' | 'cancelled';
  
  refundStatus?: 'NONE' | 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'REFUNDED' | 'FAILED';
  refundReason?: string;
  refundDate?: string;

  total: number;
  taxBreakdown?: TaxBreakdown;
  currency: string;
  items: any[];
  user: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  date: string;
  failureReason?: string;
}

// Deprecated: Do not use this array directly anymore. Use db.ts services.
export const ORDERS: Order[] = []; 
export const PRODUCTS: any[] = [];