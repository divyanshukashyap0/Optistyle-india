
import React from 'react';
import { motion } from 'framer-motion';
import { Logo } from './Logo';

export const FullScreenLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 overflow-hidden">
      
      {/* Background Decor */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-100 rounded-full blur-[100px] pointer-events-none"
      />
      
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50"
        >
          <Logo variant="icon" size="xl" animated color="brand" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden mx-auto">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full bg-brand-600 rounded-full"
            />
          </div>
          <p className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
            Loading Experience
          </p>
        </motion.div>
      </div>
    </div>
  );
};
