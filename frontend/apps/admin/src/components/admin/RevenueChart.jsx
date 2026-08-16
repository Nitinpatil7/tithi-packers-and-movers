// src/components/admin/RevenueChart.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@utils/utils';

export default function RevenueChart({ data = [] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Format currency labels for the Y-Axis
  const formatYAxis = (tick) => {
    if (tick === 0) return '₹0';
    if (tick >= 1000) return `₹${tick / 1000}k`;
    return `₹${tick}`;
  };

  if (!mounted) {
    return <div className="h-72 flex items-center justify-center text-text-tertiary">Loading chart...</div>;
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF5722" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#FF5722" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            tickFormatter={formatYAxis}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(value), 'Revenue']}
            contentStyle={{
              background: '#111114',
              border: '1px solid #232328',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#F5F5F7'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#FF5722" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export { RevenueChart };
