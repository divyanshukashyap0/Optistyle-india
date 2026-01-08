
import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rounded' }) => {
  const baseStyles = "animate-pulse bg-slate-200";
  const radiusStyles = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-lg"
  };

  return (
    <div className={`${baseStyles} ${radiusStyles[variant]} ${className}`} />
  );
};
