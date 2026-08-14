// src/components/ui/Input.jsx
import React from 'react';
import { cn } from '@utils/utils';

const Input = React.forwardRef(({
  className,
  type = 'text',
  label,
  error,
  icon: Icon,
  ...props
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-4 text-text-tertiary pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "booking-input",
            Icon && "pl-11",
            error && "border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-red-500 font-semibold flex items-center gap-1">
          ⚠ {error.message || error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
export { Input };
