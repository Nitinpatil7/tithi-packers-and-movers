// src/components/admin/BookingLineChart.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function BookingLineChart({ data = [] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64 flex items-center justify-center text-text-tertiary">Loading chart...</div>;
  }

  const hasBookings = data.some((item) => Number(item.count ?? item.bookings ?? 0) > 0);

  if (!hasBookings) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-bg-border bg-bg-section px-6 text-center text-xs font-semibold text-text-secondary">
        No confirmed booking frequency in the last 30 days yet.
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#232328" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#636366" 
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#636366" 
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#111114',
              border: '1px solid #232328',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#F5F5F7'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="count" 
            name="Bookings"
            stroke="#FF5722" 
            strokeWidth={3}
            dot={{ r: 3, fill: '#FF5722', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
export { BookingLineChart };
