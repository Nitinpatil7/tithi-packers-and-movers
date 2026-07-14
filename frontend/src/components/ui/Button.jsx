// src/components/ui/Button.jsx
import React from 'react';
import { cn } from '@/lib/utils';
import Spinner from './Spinner';

const Button = React.forwardRef(({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  type = 'button',
  icon: Icon,
  iconPosition = 'left',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-page active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50';

  const variants = {
    primary: 'bg-gradient-to-br from-primary to-primary-dark text-white hover:from-primary-light hover:to-primary shadow-orange focus:ring-primary',
    secondary: 'bg-white border-2 border-bg-border text-text-primary hover:border-primary/30 hover:text-primary shadow-xs focus:ring-primary',
    ghost: 'bg-transparent text-text-secondary hover:bg-bg-section hover:text-text-primary focus:ring-primary',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-500 shadow-sm',
    local: 'bg-service-local text-white hover:opacity-90 focus:ring-service-local shadow-local',
    intercity: 'bg-service-intercity text-white hover:opacity-90 focus:ring-service-intercity shadow-intercity',
    packing: 'bg-service-packing text-white hover:opacity-90 focus:ring-service-packing shadow-packing',
    commercial: 'bg-service-commercial text-white hover:opacity-90 focus:ring-service-commercial shadow-commercial',
  };

  const sizes = {
    sm: 'px-3.5 py-2 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2',
  };

  return (
    <button
      type={type}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      ref={ref}
      {...props}
    >
      {loading && <Spinner size="sm" className="mr-1" />}
      {!loading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
export { Button };
