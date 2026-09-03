'use client';

import React from 'react';
import { cn } from '@tithi/utils/utils';

export default function AdminStatGrid({ children, className = '' }) {
  const count = React.Children.count(children);

  return (
    <section
      className={cn('admin-stat-grid', className)}
      data-count={count}
    >
      {children}
    </section>
  );
}
