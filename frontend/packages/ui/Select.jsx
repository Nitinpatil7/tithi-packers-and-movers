// src/components/ui/Select.jsx
import React from 'react';
import { cn } from '@utils/utils';

const Select = React.forwardRef(({
  className,
  label,
  error,
  options = [],
  placeholder = 'Select an option',
  children,
  ...props
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          {label}
        </label>
      )}
      <select
        className={cn(
          "w-full px-4 py-2.5 bg-bg-elevated border border-bg-border text-text-primary rounded-md text-sm transition-colors duration-200 focus:outline-none focus:border-primary cursor-pointer",
          error && "border-red-500/80 focus:border-red-500",
          className
        )}
        ref={ref}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children ? children : options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs text-red-500 font-medium">
          {error.message || error}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
export { Select };
