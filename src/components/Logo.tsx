
import React from 'react';
import { motion } from 'framer-motion';
import { brandLogo, brandName } from '../config/brand';

interface LogoProps {
  variant?: 'full' | 'icon';
  color?: 'dark' | 'light' | 'brand';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  variant = 'full', 
  color = 'dark', 
  size = 'md',
  animated = false 
}) => {
  
  // Size controlled via CSS classes for the image
  const sizeConfig = {
    sm: { img: 'w-6 h-6', text: 'text-lg', gap: 'gap-1.5' },
    md: { img: 'w-8 h-8', text: 'text-xl', gap: 'gap-2' },
    lg: { img: 'w-10 h-10', text: 'text-2xl', gap: 'gap-3' },
    xl: { img: 'w-16 h-16', text: 'text-4xl', gap: 'gap-4' }
  }[size];

  const textColorClass = {
    dark: 'text-slate-900',
    light: 'text-white',
    brand: 'text-brand-600'
  }[color];

  return (
    <div className={`flex items-center ${sizeConfig.gap} select-none font-heading`}>
      {animated ? (
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          className="flex items-center justify-center transition-transform"
        >
          <img 
            src={brandLogo} 
            alt={`${brandName} Logo`} 
            className={`${sizeConfig.img} object-contain`}
          />
        </motion.div>
      ) : (
        <div className="flex items-center justify-center transition-transform">
          <img 
            src={brandLogo} 
            alt={`${brandName} Logo`} 
            className={`${sizeConfig.img} object-contain`}
          />
        </div>
      )}
      
      {variant === 'full' && (
        <span className={`font-bold tracking-tight leading-none ${textColorClass} ${sizeConfig.text}`}>
          {brandName}
        </span>
      )}
    </div>
  );
};
