// src/components/admin/StatCard.jsx
'use client';

import React from 'react';
import Card from '@tithi/ui/Card';
import AnimatedCounter from '@tithi/ui/AnimatedCounter';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@tithi/utils/utils';

export default function StatCard({ 
  title, 
  value, 
  suffix = '',
  trendValue, 
  trendDirection = 'up', // 'up' | 'down'
  icon: Icon,
  color = 'primary' // 'primary' | 'local' | 'intercity' | 'packing' | 'commercial'
}) {
  const iconColors = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    local: 'bg-service-local/10 text-service-local border-service-local/20',
    intercity: 'bg-service-intercity/10 text-service-intercity border-service-intercity/20',
    packing: 'bg-service-packing/10 text-service-packing border-service-packing/20',
    commercial: 'bg-service-commercial/10 text-service-commercial border-service-commercial/20',
  };

  const isTrendUp = trendDirection === 'up';

  return (
    <Card className="p-5 flex items-center justify-between border-bg-border bg-bg-card/65 glass relative overflow-hidden group">
      
      {/* Metrics text */}
      <div className="flex flex-col gap-1 text-left">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          {title}
        </span>
        <span className="text-2xl md:text-3xl font-black text-text-primary mt-1">
          <AnimatedCounter value={value} suffix={suffix} />
        </span>
        
        {/* Trend Indicator */}
        {trendValue && (
          <span className="flex items-center gap-1 text-[10px] mt-1 font-semibold">
            {isTrendUp ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-red-500" />
            )}
            <span className={isTrendUp ? 'text-emerald-500' : 'text-red-500'}>
              {trendValue}
            </span>
            <span className="text-text-tertiary">vs last week</span>
          </span>
        )}
      </div>

      {/* Decorative Icon */}
      {Icon && (
        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center border shrink-0", iconColors[color])}>
          <Icon className="w-5.5 h-5.5" />
        </div>
      )}

    </Card>
  );
}
export { StatCard };
