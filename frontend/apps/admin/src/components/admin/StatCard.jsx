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
    <Card className="relative flex min-w-0 items-center justify-between gap-2 overflow-hidden border-bg-border bg-bg-card/65 p-3 glass sm:p-5 group">
      
      {/* Metrics text */}
      <div className="flex min-w-0 flex-col gap-1 text-left">
        <span className="text-[10px] font-semibold text-text-secondary uppercase leading-tight tracking-wider sm:text-xs">
          {title}
        </span>
        <span className="mt-1 text-xl font-black text-text-primary sm:text-2xl md:text-3xl">
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
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border sm:h-12 sm:w-12", iconColors[color])}>
          <Icon className="h-4.5 w-4.5 sm:h-5.5 sm:w-5.5" />
        </div>
      )}

    </Card>
  );
}
export { StatCard };
