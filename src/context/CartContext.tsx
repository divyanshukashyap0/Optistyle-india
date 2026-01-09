
import React, { createContext, useContext, useReducer } from 'react';
import { CartItem, Product, LensOption } from '../types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  total: number;
}

type Action = 
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'TOGGLE_CART' }
  | { type: 'CLEAR_CART' };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<Action>;
  addToCart: (product: Product, lens: LensOption, prescriptionFile?: File | null) => void;
} | undefined>(undefined);

const cartReducer = (state: CartState, action: Action): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Find item with same ID AND same lens type
      const existing = state.items.find(item => 
        item.id === action.payload.id && 
        item.selectedLens?.id === action.payload.selectedLens?.id
      );
      
      let newItems;
      if (existing) {
        newItems = state.items.map(item => 
          (item.id === action.payload.id && item.selectedLens?.id === action.payload.selectedLens?.id)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...state.items, action.payload];
      }
      return { ...state, items: newItems, isOpen: true, total: calculateTotal(newItems) };
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      return { ...state, items: newItems, total: calculateTotal(newItems) };
    }
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item => 
        item.id === action.payload.id ? { ...item, quantity: Math.max(0, action.payload.quantity) } : item
      ).filter(item => item.quantity > 0);
      return { ...state, items: newItems, total: calculateTotal(newItems) };
    }
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    case 'CLEAR_CART':
      return { ...state, items: [], total: 0 };
    default:
      return state;
  }
};

const calculateTotal = (items: CartItem[]) => {
  return items.reduce((acc, item) => acc + ((item.price + (item.selectedLens?.price || 0)) * item.quantity), 0);
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false, total: 0 });

  const addToCart = (product: Product, lens: LensOption, prescriptionFile?: File | null) => {
    dispatch({ 
      type: 'ADD_ITEM', 
      payload: { 
        ...product, 
        quantity: 1, 
        selectedLens: lens,
        prescriptionFile 
      } 
    });
  };

  return (
    <CartContext.Provider value={{ state, dispatch, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
