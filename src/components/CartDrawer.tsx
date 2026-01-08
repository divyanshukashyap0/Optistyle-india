import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from './Button';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

export const CartDrawer: React.FC = () => {
  const { state, dispatch } = useCart();

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch({ type: 'TOGGLE_CART' })}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-serif font-bold text-slate-900">Your Bag</h2>
              <button 
                onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                className="text-slate-400 hover:text-slate-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {state.items.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-slate-500 mb-4">Your bag is empty.</p>
                  <Button variant="outline" onClick={() => dispatch({ type: 'TOGGLE_CART' })}>
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                state.items.map((item) => (
                  <div key={`${item.id}-${item.selectedLens?.id}`} className="flex gap-4">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-24 h-24 object-cover rounded-lg bg-slate-50"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-slate-900">{item.name}</h3>
                        <button 
                          onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">{item.selectedLens?.name}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-slate-200 rounded-lg">
                          <button 
                            className="p-1 hover:bg-slate-50"
                            onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity - 1 } })}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button 
                            className="p-1 hover:bg-slate-50"
                            onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity + 1 } })}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="font-medium text-slate-900">${(item.price + (item.selectedLens?.price || 0)) * item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {state.items.length > 0 && (
              <div className="p-6 border-t border-slate-100 bg-slate-50">
                <div className="flex justify-between mb-4">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="text-xl font-bold font-serif">${state.total}</span>
                </div>
                <Link to="/checkout" onClick={() => dispatch({ type: 'TOGGLE_CART' })}>
                  <Button className="w-full" size="lg">
                    Checkout
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};