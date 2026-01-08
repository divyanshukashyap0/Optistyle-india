
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, ScanFace, MessageSquare } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { state, dispatch } = useCart();
  const location = useLocation();

  const navLinks = [
    { name: 'All Frames', path: '/shop' },
    { name: 'Men', path: '/shop?category=men' },
    { name: 'Women', path: '/shop?category=women' },
    { name: 'Eye Test', path: '/eye-test' },
    { name: 'Contact', path: '/contact' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 font-sans ${
      scrolled 
        ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/50 shadow-sm py-2' 
        : 'bg-white border-b border-slate-100 py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          
          {/* SINGLE LOGO SOURCE */}
          <Link to="/" className="group">
            <Logo animated size="md" variant="full" />
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
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-brand-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ${location.pathname === link.path ? 'scale-x-100' : ''}`}></span>
              </Link>
            ))}
          </div>

          {/* Icons & Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="hidden lg:flex items-center gap-2 mr-2 pr-4 border-r border-slate-200">
                <div className="flex flex-col items-end leading-none">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Need Help?</span>
                    <span className="text-xs font-bold text-slate-800 mt-1">+91 80053 43226</span>
                </div>
            </div>

            <Link to="/profile" className="text-slate-500 hover:text-brand-600 transition-colors p-2 hover:bg-slate-50 rounded-full">
              <User className="w-5 h-5" />
            </Link>
            
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => dispatch({ type: 'TOGGLE_CART' })}
              className="relative text-slate-700 hover:text-brand-600 transition-colors bg-slate-50 p-2.5 rounded-full hover:bg-brand-50"
            >
              <ShoppingBag className="w-5 h-5" />
              <AnimatePresence>
                {state.items.length > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-brand-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full ring-2 ring-white"
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

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden shadow-lg absolute top-full left-0 right-0"
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
               
               <div className="grid grid-cols-2 gap-3 mt-4 px-2">
                 <Link
                    to="/eye-test"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-brand-600 rounded-lg shadow-sm"
                  >
                    <ScanFace className="w-4 h-4" /> Eye Test
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
