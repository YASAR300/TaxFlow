import React from 'react';

/**
 * Reusable Toggle Switch Component.
 * 
 * Props:
 * - checked (boolean): Controlled active state of the toggle
 * - onChange (function): Callback when the toggle state changes, receiving the new boolean value
 * - label (string): Primary text for the toggle label
 * - description (string, optional): Secondary context text displayed below the label
 */
export const Toggle = ({ checked = false, onChange, label, description }) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <label className="flex items-start justify-between gap-4 cursor-pointer select-none">
      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <span className="text-[13px] font-medium text-[#e2e8f0]">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[11px] text-[#888]">{description}</span>
          )}
        </div>
      )}
      <div className="relative shrink-0 flex items-center pt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          className="sr-only"
        />
        <div
          className={`w-11 h-6 rounded-full transition-all duration-200 ${
            checked ? 'bg-blue-600' : 'bg-slate-200'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-200 m-0.5 ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </div>
      </div>
    </label>
  );
};

export default Toggle;
