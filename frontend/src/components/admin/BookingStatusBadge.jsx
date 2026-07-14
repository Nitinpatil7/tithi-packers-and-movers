// src/components/admin/BookingStatusBadge.jsx
'use client';

import React from 'react';
import Badge from '@/components/ui/Badge';

export default function BookingStatusBadge({ status }) {
  return (
    <Badge variant="status" type={status} />
  );
}
