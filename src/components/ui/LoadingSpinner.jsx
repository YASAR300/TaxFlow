import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Loading Spinner Component.
 * 
 * Props:
 * - size (string): 'sm', 'md', or 'lg'
 * - className (string): Additional CSS classes
 */
export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2
      className={`animate-spin text-[#5e6ad2] shrink-0 ${sizeClasses[size] || sizeClasses.md} ${className}`}
    />
  );
}
