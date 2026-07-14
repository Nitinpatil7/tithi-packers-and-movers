// src/components/booking/PackingSubTypeStep.jsx
'use client';

import React, { useState } from 'react';
import { ArrowRight, Box, Sparkles, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PackingSubTypeStep({ onSubmit, initialData = {} }) {
  const [subType, setSubType] = useState(initialData.packingSubType || null);
  const [error, setError] = useState('');

  const options = [
    {
      id: 'packing_only',
      title: 'Packing Only',
      desc: 'Professional packing of all items with bubble wrap, foam, and heavy boxes.',
      icon: Box,
      color: '#00897B',
      bg: '#E0F2F1',
    },
    {
      id: 'packing_and_loading',
      title: 'Packing & Loading',
      desc: 'We pack all items securely and load them onto your transport vehicle.',
      icon: Sparkles,
      color: '#F57C00',
      bg: '#FFF3E0',
    },
    {
      id: 'unpacking_and_unloading',
      title: 'Unpacking & Unloading',
      desc: 'We unload items from your transport vehicle and unpack/set them up for you.',
      icon: Sparkles,
      color: '#1E88E5',
      bg: '#E3F2FD',
    },
    {
      id: 'loadinga_and_unloading',
      title: 'Loading & Unloading',
      desc: 'Loader helpers to load pre-packed items at pickup and unload at destination.',
      icon: Truck,
      color: '#7B3FA0',
      bg: '#F3E5F5',
    },
  ];

  const handleNext = () => {
    if (!subType) { setError('Please select a packing type to proceed.'); return; }
    onSubmit({ packingSubType: subType });
  };

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h3 className="text-2xl font-black text-text-primary mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
          <Box className="mr-2 inline h-6 w-6 text-primary" /> Choose Packing Package
        </h3>
        <p className="text-sm text-text-secondary font-medium">
          Select the level of packing service you need — we&apos;ll handle the rest.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {options.map((item) => {
          const isSelected = subType === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => { setSubType(item.id); setError(''); }}
              className={cn(
                "flex flex-col items-center text-center p-6 rounded-2xl border-2 cursor-pointer select-none transition-all relative",
                isSelected
                  ? "border-primary bg-primary-soft shadow-orange"
                  : "border-bg-border bg-white hover:border-primary/30 hover:bg-bg-section shadow-xs"
              )}
            >
              {item.badge && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                  {item.badge}
                </span>
              )}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm"
                style={{ backgroundColor: item.bg }}
              >
                <Icon className="h-8 w-8 text-primary" strokeWidth={1.7} />
              </div>
              <span
                className={cn("text-base font-black mb-2", isSelected ? "text-primary" : "text-text-primary")}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {item.title}
              </span>
              <span className="text-xs text-text-secondary leading-relaxed font-medium">{item.desc}</span>
              {isSelected && (
                <span className="mt-3 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Selected ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-500 font-bold text-center">⚠ {error}</p>}

      <div className="pt-4 flex justify-end border-t border-bg-border">
        <button onClick={handleNext} className="btn-orange px-6 py-3 rounded-xl font-bold flex items-center gap-2">
          Next Step <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
export { PackingSubTypeStep };
