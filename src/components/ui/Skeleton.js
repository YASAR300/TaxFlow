import React from 'react';

export function Skeleton({ className = '', ...props }) {
  return (
    <div 
      className={`animate-pulse bg-[#1e1e1e] rounded-lg border border-[#2a2a2a]/30 ${className}`} 
      {...props} 
    />
  );
}

export default Skeleton;
