// src/components/admin/ServicePieChart.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ServicePieChart({ data = {} }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = [
    { name: 'Local Shifting', value: data.local || 0, color: '#3B82F6' },
    { name: 'Intercity Moving', value: data.intercity || 0, color: '#8B5CF6' },
    { name: 'Labour & Vehicle', value: data.porterLabour || 0, color: '#10B981' },
  ].filter(item => item.value > 0);

  if (!mounted) {
    return <div className="h-64 flex items-center justify-center text-text-tertiary">Loading chart...</div>;
  }

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-text-secondary">
        No service details logged yet.
      </div>
    );
  }

  return (
    <div className="w-full h-64 flex flex-col justify-center">
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#111114',
              border: '1px solid #232328',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#F5F5F7'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Custom Legend layout below to look super premium */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-2 text-[10px] font-semibold text-text-secondary">
        {chartData.map((item) => (
          <span key={item.name} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            {item.name} ({item.value})
          </span>
        ))}
      </div>
    </div>
  );
}
export { ServicePieChart };
