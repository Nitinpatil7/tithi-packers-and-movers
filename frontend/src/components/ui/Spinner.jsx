// src/components/ui/Spinner.jsx
import React from 'react';
import { cn } from '@/lib/utils';

export default function Spinner({ size = 'md', className }) {
  const sizes = {
    sm: 'w-7 h-5',
    md: 'w-20 h-12',
    lg: 'w-32 h-20',
  };

  return (
    <div
      className={cn(
        'truck-loader inline-flex items-center justify-center text-primary',
        sizes[size],
        className
      )}
      role="status"
    >
      <svg viewBox="0 0 120 72" className="h-full w-full" aria-hidden="true" focusable="false">
        <g className="truck-loader__body">
          <path d="M14 38h46V21c0-3.3 2.7-6 6-6h19c2 0 3.9 1 5 2.7L101 36h5c2.8 0 5 2.2 5 5v10H14V38Z" fill="currentColor" />
          <path d="M66 22h16.5c.7 0 1.4.4 1.8 1L92 36H66V22Z" fill="#fff" opacity=".88" />
          <path d="M22 28h28" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".82" />
          <path d="M14 51h97" stroke="#152338" strokeWidth="4" strokeLinecap="round" opacity=".2" />
        </g>
        <circle className="truck-loader__wheel" cx="35" cy="53" r="8" fill="#152338" />
        <circle className="truck-loader__wheel" cx="88" cy="53" r="8" fill="#152338" />
        <g className="truck-loader__road" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".45">
          <path d="M10 65h26" />
          <path d="M52 65h34" />
          <path d="M99 65h14" />
        </g>
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
