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

  const chartData = data.length
    ? data.map((item) => ({
        ...item,
        count: Number(item.count ?? item.bookings ?? 0),
      }))
    : [{ date: 'No data', count: 0 }];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
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
            domain={[0, (dataMax) => Math.max(1, dataMax)]}
            allowDecimals={false}
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
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
export { BookingLineChart };
