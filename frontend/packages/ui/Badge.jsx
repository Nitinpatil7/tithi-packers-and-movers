// src/components/ui/Badge.jsx
import React from 'react';
import { cn, getStatusColorClass, getStatusLabel, getServiceLabel } from '@utils/utils';

export default function Badge({ 
  children, 
  variant = 'default', // 'default' | 'primary' | 'secondary' | 'status' | 'service' | 'outline'
  type, // used for status or service mapping (e.g. 'pending', 'local')
  className,
  ...props 
}) {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border';

  const variants = {
    default: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    primary: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-bg-elevated text-text-secondary border-bg-border',
    outline: 'bg-transparent text-text-secondary border-bg-border',
  };

  if (variant === 'status') {
    return (
      <span className={cn(baseStyles, getStatusColorClass(type), className)} {...props}>
        {getStatusLabel(type)}
      </span>
    );
  }

  if (variant === 'service') {
    const serviceColors = {
      local: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      local_shifting: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      intercity: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      intercity_moving: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      porter_labour_service: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
      labour: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
      packing: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      commercial: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
    const colorClass = serviceColors[type] || 'bg-zinc-800 text-zinc-300 border-zinc-700';
    return (
      <span className={cn(baseStyles, colorClass, className)} {...props}>
        {getServiceLabel(type)}
      </span>
    );
  }

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
