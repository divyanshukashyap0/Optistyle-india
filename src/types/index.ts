
// Shared Types

export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'men' | 'women' | 'kids' | 'unisex';
  type: 'eyeglasses' | 'sunglasses';
  shape: 'round' | 'square' | 'aviator' | 'cat-eye' | 'rectangle';
  rating: number;
  image: string;
  description: string;
  colors: string[];
}

export interface LensOption {
  id: string;
  name: string;
  price: number;
  description: string;
}

// Separate CartItem (Frontend state) vs OrderItem (Backend persistence)
export interface CartItem extends Product {
  quantity: number;
  selectedLens?: LensOption;
  // File object cannot be sent to backend directly via JSON, so we handle it separately in upload logic
  prescriptionFile?: File | null; 
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isDisabled?: boolean;
  lastLogin?: string;
  isAnonymous?: boolean;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault?: boolean;
}

export interface TaxBreakdown {
  taxableAmount: number;
  gstAmount: number;
  totalAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  isInterState: boolean;
  rate: number;
}

export interface Order {
  id: string;
  invoiceNumber?: string;
  razorpayOrderId?: string;
  paymentId?: string;
  userId: string;
  // Basic user info snapshot for the order
  user: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  items: CartItem[]; // In DB this might be strict object, but for now we share structure
  total: number;
  taxBreakdown?: TaxBreakdown;
  currency: string;
  paymentMethod: 'ONLINE' | 'COD';
  status: 'pending' | 'cod_pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'shipped' | 'delivered' | 'cancelled';
  
  refundStatus?: 'NONE' | 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'REFUNDED' | 'FAILED';
  refundReason?: string;
  refundDate?: string;
  failureReason?: string;
  
  date: string;
}

export interface FilterState {
  category: string;
  priceRange: [number, number];
  shape: string;
}
