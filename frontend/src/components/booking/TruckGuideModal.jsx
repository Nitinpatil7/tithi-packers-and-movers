// src/components/booking/TruckGuideModal.jsx
'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import { TRUCK_OPTIONS } from '@/data/truckOptions';
import { Truck } from 'lucide-react';

export default function TruckGuideModal({ isOpen, onClose }) {
  // Exclude 'not-sure' from the specs listing
  const options = TRUCK_OPTIONS.filter(t => t.id !== 'not-sure');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Truck Selection Guide" size="lg">
      <div className="flex flex-col gap-6">
        <p className="text-sm text-text-secondary">
          Not sure which vehicle fits your inventory volume? Review capacities, volumes, and best-use examples below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((truck) => (
            <div 
              key={truck.id}
              className="p-5 rounded-lg border border-bg-border bg-bg-elevated/40 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <Truck className="h-6 w-6 text-primary" strokeWidth={1.6} />
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-text-primary">{truck.name}</span>
                  <span className="text-xs text-primary font-semibold">{truck.price}</span>
                </div>
              </div>

              <div className="border-t border-bg-border/60 my-1" />

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-text-tertiary block">Payload Capacity</span>
                  <span className="text-text-secondary font-semibold">{truck.capacity}</span>
                </div>
                <div>
                  <span className="text-text-tertiary block">Volume Capacity</span>
                  <span className="text-text-secondary font-semibold">{truck.volume}</span>
                </div>
              </div>

              <div className="text-xs">
                <span className="text-text-tertiary block">Best suited for</span>
                <span className="text-text-secondary font-semibold">{truck.bestFor}</span>
              </div>

              <div className="text-xs bg-bg-dark/30 rounded p-2 text-text-secondary border border-bg-border/30">
                <span className="text-text-tertiary block font-medium mb-0.5">Example items:</span>
                {truck.example}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
export { TruckGuideModal };
