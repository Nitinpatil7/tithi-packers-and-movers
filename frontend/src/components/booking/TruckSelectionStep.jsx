// src/components/booking/TruckSelectionStep.jsx
'use client';

import React, { useState } from 'react';
import { Info, ArrowRight, ArrowLeft, Truck } from 'lucide-react';
import Button from '@/components/ui/Button';
import TruckGuideModal from './TruckGuideModal';
import { TRUCK_OPTIONS } from '@/data/truckOptions';
import { cn } from '@/lib/utils';
import { getTruckImageSrc } from '@/lib/truckVisuals';

const normalizeTruckOption = (truck = {}) => {
  const capacityKg = Number(truck.capacityKg || 0);
  return {
    id: truck.key || truck.id,
    name: truck.name || 'Truck',
    capacityKg,
    image: truck.image || '',
    bestFor: capacityKg ? `${capacityKg.toLocaleString('en-IN')} kg capacity` : truck.capacityLabel || truck.bestFor || 'Capacity not set',
    example: truck.example || '',
    price: Number(truck.price || 0) > 0 ? `Rs ${Number(truck.price).toLocaleString('en-IN')}` : '',
    isFree: truck.isFree,
  };
};

export default function TruckSelectionStep({ onSubmit, onBack, initialData = {}, trucks = [], showPrice = false }) {
  const options = (trucks.length ? trucks : TRUCK_OPTIONS).map(normalizeTruckOption);
  const [selectedTruck, setSelectedTruck] = useState(initialData.selectedTruck || initialData.truckType || null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!selectedTruck) {
      setError('Please select a truck size to continue.');
      return;
    }
    const selectedTruckData = options.find((truck) => truck.id === selectedTruck) || null;
    onSubmit({ selectedTruck, truckType: selectedTruck, selectedTruckData });
  };

  return (
    <div className="flex flex-col gap-7">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-black text-text-primary mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
            <Truck className="mr-2 inline h-7 w-7 text-primary" /> Select Vehicle Size
          </h3>
          <p className="text-sm text-text-secondary font-medium">
            Choose the truck by name and kg capacity from admin pricing rules.
          </p>
        </div>
        <button
          onClick={() => setGuideOpen(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary-soft border border-primary/20 px-3 py-2 rounded-xl hover:shadow-orange transition-all shrink-0 ml-4"
        >
          <Info className="w-3.5 h-3.5" />
          Size Guide
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((truck) => {
          const isSelected = selectedTruck === truck.id;
          return (
            <button
              key={truck.id}
              type="button"
              onClick={() => { setSelectedTruck(truck.id); setError(''); }}
              className={cn(
                'flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer select-none transition-all text-left w-full',
                isSelected
                  ? 'border-primary bg-primary-soft shadow-orange'
                  : 'border-bg-border bg-white hover:border-primary/30 hover:bg-bg-section shadow-xs'
              )}
            >
              <img
                src={getTruckImageSrc(truck)}
                alt={truck.name}
                className="h-20 w-24 shrink-0 rounded-xl border border-bg-border bg-bg-section object-cover"
                onError={(event) => { event.currentTarget.src = getTruckImageSrc({}); }}
              />
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn('text-base font-black', isSelected ? 'text-primary' : 'text-text-primary')} style={{ fontFamily: 'var(--font-heading)' }}>
                    {truck.name}
                  </span>
                  {isSelected && (
                    <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
                      Selected
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-text-secondary">{truck.bestFor}</span>
                {truck.example && <span className="text-xs text-text-tertiary">{truck.example}</span>}
                {showPrice && truck.price && <span className="mt-1 text-sm font-black text-primary">{truck.price}</span>}
              </div>
            </button>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-500 font-bold text-center">{error}</p>}

      <div className="flex items-center justify-between pt-4 border-t border-bg-border">
        <Button variant="secondary" onClick={onBack} icon={ArrowLeft}>Back</Button>
        <button onClick={handleNext} className="btn-orange px-6 py-3 rounded-xl font-bold flex items-center gap-2">
          Next Step <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <TruckGuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}

export { TruckSelectionStep };
