import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-heading font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 shadow-sm hover:shadow-brand-600/30",
    secondary: "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900 shadow-sm hover:shadow-slate-900/30",
    outline: "border-2 border-slate-200 bg-transparent hover:bg-slate-50 text-slate-700 hover:border-slate-300 focus:ring-slate-400",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700 hover:text-brand-700",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 focus:ring-red-500"
  };

  const sizes = {
    sm: "h-9 px-4 text-xs uppercase tracking-wide",
    md: "h-11 px-6 text-sm",
    lg: "h-14 px-8 text-base font-bold"
  };

  return (
    <motion.button 
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
      )}
      {children}
    </motion.button>
  );
};