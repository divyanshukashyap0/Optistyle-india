import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, User, Glasses, ScanFace, Phone, MessageSquare } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { state, dispatch } = useCart();
  const location = useLocation();

  const navLinks = [
    { name: 'All Frames', path: '/shop' },
    { name: 'Men', path: '/shop?category=men' },
    { name: 'Women', path: '/shop?category=women' },
    { name: 'Eye Test', path: '/eye-test' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 py-3">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="bg-brand-600 text-white p-1.5 rounded-lg"
            >
              <Glasses className="w-6 h-6" strokeWidth={2.5} />
            </motion.div>
            <div className="flex flex-col justify-center">
              <span className="text-xl font-bold text-slate-900 tracking-tight leading-none group-hover:text-brand-600 transition-colors">OptiStyle</span>
              <span className="text-[10px] text-slate-500 font-medium">India's Trusted Eyewear</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                className="relative text-sm font-medium transition-colors hover:text-brand-600 py-2 group"
              >
                <span className={location.pathname === link.path ? 'text-brand-600 font-bold' : 'text-slate-600'}>
                   {link.name}
                </span>
                {/* Hover Underline Animation */}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-brand-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ${location.pathname === link.path ? 'scale-x-100' : ''}`}></span>
              </Link>
            ))}
          </div>

          {/* Icons & Actions */}
          <div className="flex items-center space-x-4">
            {/* Help Button (Desktop) */}
            <div className="hidden md:flex items-center gap-2 mr-2">
                <div className="flex flex-col items-end leading-tight">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Need Help?</span>
                    <span className="text-xs font-bold text-slate-800">+91 80053 43226</span>
                </div>
            </div>

            <Link to="/profile" className="text-slate-500 hover:text-brand-600 transition-colors p-2 hover:bg-slate-50 rounded-full">
              <User className="w-5 h-5" />
            </Link>
            
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => dispatch({ type: 'TOGGLE_CART' })}
              className="relative text-slate-700 hover:text-brand-600 transition-colors bg-slate-100 p-2 rounded-full hover:bg-brand-50"
            >
              <ShoppingBag className="w-5 h-5" />
              <AnimatePresence>
                {state.items.length > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-sm"
                  >
                    {state.items.reduce((acc, i) => acc + i.quantity, 0)}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            
            <button 
              className="md:hidden text-slate-700 p-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Simplified & Big Buttons */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-4 text-base font-medium text-slate-800 border-b border-slate-50 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
               
               <div className="grid grid-cols-2 gap-3 mt-4">
                 <Link
                    to="/eye-test"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-brand-600 rounded-lg shadow-sm"
                  >
                    <ScanFace className="w-4 h-4" /> Free Eye Test
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-slate-700 bg-slate-100 rounded-lg"
                  >
                    <MessageSquare className="w-4 h-4" /> Support
                  </Link>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};