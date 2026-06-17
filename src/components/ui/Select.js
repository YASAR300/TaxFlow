import React from 'react';

export const Select = React.forwardRef(({
  label,
  error,
  required,
  className = '',
  id,
  options = [],
  placeholder = 'Select an option',
  ...props
}, ref) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-[11px] font-semibold text-[#888] uppercase tracking-wider flex items-center gap-1">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-lg">
        <select
          ref={ref}
          id={selectId}
          className={`w-full px-3 py-2 rounded-lg bg-[#1a1a1a] text-[13px] text-[#e2e8f0] focus:outline-none appearance-none cursor-pointer transition-all ${
            error
              ? 'border border-rose-500/50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
              : 'border border-[#2a2a2a] hover:border-[#333] focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]'
          }`}
          {...props}
        >
          {placeholder && <option value="" className="bg-[#111111]">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#111111]">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#555]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <span className="text-[11px] font-medium text-rose-500 mt-0.5">{error}</span>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
