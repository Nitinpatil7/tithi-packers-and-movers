// src/components/ui/Card.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Card({
  children,
  className,
  onClick,
  glass = false,
  animate = false,
  glowColor,
  ...props
}) {
  const baseClass = cn(
    'rounded-2xl border bg-white transition-all duration-300',
    glass ? 'glass-card' : 'border-bg-border shadow-card',
    onClick && 'cursor-pointer hover:shadow-md hover:border-bg-elevated',
    glowColor === 'primary' && 'hover:shadow-orange hover:border-primary/30',
    glowColor === 'local' && 'hover:shadow-local hover:border-service-local/30',
    glowColor === 'intercity' && 'hover:shadow-intercity hover:border-service-intercity/30',
    glowColor === 'packing' && 'hover:shadow-packing hover:border-service-packing/30',
    glowColor === 'commercial' && 'hover:shadow-commercial hover:border-service-commercial/30',
    className
  );

  if (animate) {
    return (
      <motion.div
        className={baseClass}
        onClick={onClick}
        whileHover={onClick ? { y: -4, scale: 1.01 } : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClass} onClick={onClick} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn('px-6 pt-6 pb-4 border-b border-bg-border', className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={cn('px-6 py-4 border-t border-bg-border bg-bg-section rounded-b-2xl', className)} {...props}>
      {children}
    </div>
  );
}
