'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, IndianRupee } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const PACKAGES = [
  { hours: 1, perEmployee: 300 }, { hours: 2, perEmployee: 500 },
  { hours: 3, perEmployee: 650 }, { hours: 4, perEmployee: 850 },
  { hours: 5, perEmployee: 1000 }, { hours: 6, perEmployee: 1150 },
  { hours: 7, perEmployee: 1300 },
];

export default function HoursSelectionStep({ onSubmit, onBack, initialData = {}, rates = [] }) {
  const packages = rates.length ? rates.filter((item) => item.isActive !== false).map((item) => ({ hours: Number(item.hours), perEmployee: Number(item.price || 0), label: item.label, isFree: item.isFree })) : PACKAGES;
  const [selectedHours, setSelectedHours] = useState(Number(initialData.hoursCount || 0));
  const employeeCount = Number(initialData.employeeCount || 1);
  const selectedPackage = packages.find((item) => item.hours === selectedHours);
  const total = selectedPackage ? selectedPackage.perEmployee * employeeCount : 0;

  const handleNext = () => {
    if (selectedPackage) onSubmit({ hoursCount: selectedHours, hourlyRatePerEmployee: selectedPackage.perEmployee, hoursTotal: total, employeeTotal: total, grandTotal: total });
  };

  return (
    <div className="flex flex-col gap-7 text-left">
      <div>
        <h3 className="text-2xl font-black text-text-primary mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Select Work Duration</h3>
        <p className="text-sm text-text-secondary font-medium">Prices below are package charges per employee for the selected duration.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {packages.map((option) => {
          const selected = selectedHours === option.hours;
          return (
            <button key={option.hours} type="button" onClick={() => setSelectedHours(option.hours)} className={cn('relative rounded-2xl border-2 p-4 flex flex-col items-center gap-2 transition-all', selected ? 'border-primary bg-primary-soft shadow-sky' : 'border-bg-border bg-white hover:border-primary/40')}>
              <Clock className={cn('w-5 h-5', selected ? 'text-primary' : 'text-text-secondary')} />
              <span className="text-xl font-black text-text-primary">{option.label || `${option.hours}h`}</span>
              <span className="text-sm font-black text-primary">₹{option.perEmployee}</span>
              <span className="text-[10px] text-text-tertiary">per employee</span>
              {selected && <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-primary" />}
            </button>
          );
        })}
      </div>
      {selectedPackage && (
        <div className="p-5 bg-primary-soft rounded-2xl border border-primary/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3"><IndianRupee className="w-5 h-5 text-primary" /><div><p className="font-black text-text-primary">Labour Total</p><p className="text-xs text-text-secondary">₹{selectedPackage.perEmployee} per employee × {employeeCount} employees</p></div></div>
          <span className="text-2xl font-black text-primary">₹{total}</span>
        </div>
      )}
      <div className="flex items-center justify-between pt-4 border-t border-bg-border">
        <Button variant="secondary" onClick={onBack} icon={ArrowLeft}>Back</Button>
        <button onClick={handleNext} disabled={!selectedPackage} className="btn-sky px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50">Next Step <ArrowRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

export { HoursSelectionStep };
