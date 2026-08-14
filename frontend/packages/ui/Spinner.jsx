// src/components/ui/Spinner.jsx
import React from 'react';
import { cn } from '@utils/utils';

export default function Spinner({ size = 'md', className }) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
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
      <svg viewBox="0 0 96 96" className="h-full w-full" aria-hidden="true" focusable="false">
        <circle cx="48" cy="48" r="47" fill="none" stroke="currentColor" strokeOpacity=".14" strokeWidth="2" />
        <g className="truck-loader__ring" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2">
          <path d="M28 20a33 33 0 0 0-7 47" opacity=".8" />
          <path d="M68 76a33 33 0 0 0 7-47" opacity=".8" />
        </g>
        <circle cx="48" cy="48" r="22" fill="none" />
        <g fill="currentColor">
          <path d="M34 45.5h19.5v-6H34a2 2 0 0 0-2 2v12h3.8a5.2 5.2 0 0 1 10.1 0h11.2a5.2 5.2 0 0 1 10.1 0H70v-7.2a3 3 0 0 0-.7-1.9l-4.5-5.3a3 3 0 0 0-2.3-1.1h-6.8v13.5H34v-6Z" />
          <path d="M57.8 40.8h4.4c.4 0 .8.2 1.1.5l3.3 3.9h-8.8v-4.4Z" fill="currentColor" opacity=".35" />
          <path d="M29.5 43h10.2a1.5 1.5 0 0 0 0-3H31a1.5 1.5 0 0 0-1.5 1.5V43Z" />
          <path d="M28 48h11a1.5 1.5 0 0 0 0-3H28v3Z" />
          <circle cx="40.8" cy="54.4" r="3.1" />
          <circle cx="62.2" cy="54.4" r="3.1" />
        </g>
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
