// src/components/booking/TruckSelectionStep.jsx
'use client';

import React, { useMemo, useState } from 'react';
import { Info, Truck, Users } from 'lucide-react';
import TruckGuideModal from './TruckGuideModal';
import { TRUCK_OPTIONS } from '@tithi/data/truckOptions';
import { cn } from '@tithi/utils/utils';
import { getTruckImageSrc } from '@tithi/utils/truckVisuals';
import BookingActionBar from './BookingActionBar';

const NO_TRUCK_OPTION = {
  id: 'no_truck',
  name: 'No Truck - Labour Only',
  capacityKg: 0,
  image: '',
  price: 0,
  bestFor: 'Only labour/workers required',
  example: 'Use this when you only need lifting, loading, unloading, or arranging.',
  isNoTruck: true,
};

const normalizeTruckOption = (truck = {}) => {
  const capacityKg = Number(truck.capacityKg || 0);
  return {
    id: truck.key || truck.id,
    name: truck.name || 'Truck',
    capacityKg,
    image: truck.image || '',
    price: Number(truck.price || 0),
    bestFor: capacityKg ? `${capacityKg.toLocaleString('en-IN')} kg capacity` : truck.capacityLabel || truck.bestFor || 'Capacity not set',
    example: truck.example || '',
    isFree: truck.isFree,
    isNoTruck: Boolean(truck.isNoTruck),
  };
};

export default function TruckSelectionStep({ onSubmit, onBack, initialData = {}, trucks = [], allowNoTruck = false }) {
  const options = useMemo(() => {
    const truckOptions = (trucks.length ? trucks : TRUCK_OPTIONS).map(normalizeTruckOption);
    return allowNoTruck ? [NO_TRUCK_OPTION, ...truckOptions] : truckOptions;
  }, [allowNoTruck, trucks]);
  const initialTruck = initialData.labourOnly ? NO_TRUCK_OPTION.id : initialData.selectedTruck || initialData.truckType || null;
  const [selectedTruck, setSelectedTruck] = useState(initialTruck);
  const [guideOpen, setGuideOpen] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!selectedTruck) {
      setError(allowNoTruck ? 'Please choose a truck or select labour only.' : 'Please select a truck size to continue.');
      return;
    }

    const selectedTruckData = options.find((truck) => truck.id === selectedTruck) || null;
    if (selectedTruckData?.isNoTruck) {
      onSubmit({
        useBasePackage: false,
        selectedTruck: null,
        truckType: null,
        selectedTruckData: null,
        truckTotal: 0,
        labourOnly: true,
      });
      return;
    }

    onSubmit({
      useBasePackage: false,
      selectedTruck,
      truckType: selectedTruck,
      selectedTruckData,
      truckTotal: Number(selectedTruckData?.price || 0),
      labourOnly: false,
    });
  };

  return (
    <div className="flex flex-col gap-7">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-black text-text-primary mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
            <Truck className="mr-2 inline h-7 w-7 text-primary" /> Select Vehicle Size
          </h3>
          <p className="text-sm text-text-secondary font-medium">
            {allowNoTruck ? 'Choose a truck, or continue with labour only if no vehicle is needed.' : 'Choose the truck by name and kg capacity from admin pricing rules.'}
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
              {truck.isNoTruck ? (
                <span className="grid h-20 w-24 shrink-0 place-items-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
                  <Users className="h-7 w-7" />
                </span>
              ) : (
                <img
                  src={getTruckImageSrc(truck)}
                  alt={truck.name}
                  className="h-20 w-24 shrink-0 rounded-xl border border-bg-border bg-bg-section object-cover"
                  onError={(event) => { event.currentTarget.src = getTruckImageSrc({}); }}
                />
              )}
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
              </div>
            </button>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-500 font-bold text-center">{error}</p>}

      <BookingActionBar onBack={onBack} onNext={handleNext} tone="orange" />

      <TruckGuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}

export { TruckSelectionStep };
