import React from 'react';

export const Input = React.forwardRef(({
  label,
  error,
  required,
  className = '',
  id,
  type = 'text',
  icon,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  
  const baseInputClass = `w-full px-3 py-2 rounded-lg bg-[#1a1a1a] text-[13px] text-[#e2e8f0] placeholder-[#444] focus:outline-none transition-all ${
    error
      ? 'border border-rose-500/50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
      : 'border border-[#2a2a2a] hover:border-[#333] focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]'
  }`;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-[11px] font-semibold text-[#888] uppercase tracking-wider flex items-center gap-1">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-lg">
        {type === 'textarea' ? (
          <textarea
            ref={ref}
            id={inputId}
            className={`${baseInputClass} resize-none`}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            type={type}
            id={inputId}
            className={baseInputClass}
            {...props}
          />
        )}
        {icon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#555]">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <span className="text-[11px] font-medium text-rose-500 mt-0.5">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
