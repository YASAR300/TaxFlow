import React from 'react';

export const Button = React.forwardRef(({
  children,
  variant = 'primary', // primary, secondary, outline, ghost, danger
  size = 'md', // sm, md
  className = '',
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-1 focus:ring-[#5e6ad2]/50 disabled:opacity-50 disabled:cursor-not-allowed select-none';
  
  const variants = {
    primary: 'bg-[#5e6ad2] hover:bg-[#4f5abf] active:bg-[#4a55b0] text-white',
    secondary: 'bg-[#252525] hover:bg-[#2d2d2d] active:bg-[#333] text-[#ccc] border border-[#2a2a2a]',
    outline: 'bg-transparent border border-[#2a2a2a] hover:bg-[#1a1a1a] hover:border-[#333] text-[#ccc]',
    ghost: 'bg-transparent hover:bg-[#1a1a1a] text-[#888] hover:text-[#ccc]',
    danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white',
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-[11px] gap-1.5',
    md: 'px-3.5 py-2 text-[12px] gap-2',
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!loading && Icon && iconPosition === 'left' && <Icon size={14} className="shrink-0" />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon size={14} className="shrink-0" />}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
