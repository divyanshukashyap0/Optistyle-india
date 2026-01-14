import React from 'react';
import { motion } from 'framer-motion';
import { Glasses } from 'lucide-react';

export const FullScreenLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 overflow-hidden">
      
      {/* Background Decor: Blurry blobs moving slightly */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          rotate: [0, -90, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container */}
        <div className="relative">
          {/* Pulsing Ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.5, 0], scale: [1, 1.5, 1.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 bg-brand-400 rounded-full blur-md"
          />
          
          {/* Main Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center relative z-10 border border-slate-100"
          >
            <Glasses className="w-12 h-12 text-brand-600" strokeWidth={2} />
            
            {/* Scanning Line Effect inside the icon box */}
            <motion.div
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-0 w-full h-[2px] bg-brand-400/50 shadow-[0_0_10px_rgba(96,165,250,0.8)]"
            />
          </motion.div>
        </div>

        {/* Text Animation */}
        <div className="mt-8 text-center space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-serif font-bold text-slate-900 tracking-tight"
          >
            OptiStyle
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xs font-bold text-brand-600 uppercase tracking-widest"
          >
            Finding your focus
          </motion.p>
        </div>

        {/* Loading Bar */}
        <div className="mt-8 w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full bg-brand-600 rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
