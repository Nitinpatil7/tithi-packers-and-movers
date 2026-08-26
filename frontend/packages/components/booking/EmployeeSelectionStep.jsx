'use client';

import React, { useState } from 'react';
import { CheckCircle2, Users } from 'lucide-react';
import { cn } from '@utils/utils';
import BookingActionBar from './BookingActionBar';

export default function EmployeeSelectionStep({ onSubmit, onBack, initialData = {}, employeeRates = [] }) {
  const initialCount = Number(initialData.employeeCount || 0);
  const configuredCounts = employeeRates.length ? employeeRates.map((item) => Number(item.employees)).filter(Boolean) : [1, 2, 3, 4, 5];
  const quickCounts = [...new Set(configuredCounts)].sort((a, b) => a - b);
  const [selectedCount, setSelectedCount] = useState(initialCount && quickCounts.includes(initialCount) ? initialCount : initialCount ? 'custom' : null);
  const [customCount, setCustomCount] = useState(initialCount && !quickCounts.includes(initialCount) ? initialCount : Math.max(...quickCounts, 5) + 1);
  const resolvedCount = selectedCount === 'custom' ? Number(customCount) : Number(selectedCount);
  const selectedRate = employeeRates.find((item) => Number(item.employees) === resolvedCount);

  const handleNext = () => {
    if (resolvedCount > 0) onSubmit({ useBasePackage: false, employeeCount: resolvedCount, employeeRatePrice: Number(selectedRate?.price || 0), employeeTotal: 0 });
  };

  return (
    <div className="flex flex-col gap-7 text-left">
      <div>
        <h3 className="text-2xl font-black text-text-primary mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Select Employees</h3>
        <p className="text-sm text-text-secondary font-medium">Choose the number of workers required. Pricing is selected in the next duration step.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickCounts.map((count) => {
          const selected = selectedCount === count;
          return (
            <button key={count} type="button" onClick={() => setSelectedCount(count)} className={cn('relative rounded-2xl border-2 p-5 flex flex-col items-center gap-3 transition-all', selected ? 'border-primary bg-primary-soft shadow-sky' : 'border-bg-border bg-white hover:border-primary/40')}>
              <Users className={cn('w-7 h-7', selected ? 'text-primary' : 'text-text-secondary')} />
              <span className="text-2xl font-black text-text-primary">{count}</span>
              <span className="text-xs font-bold text-text-secondary">{count === 1 ? 'Employee' : 'Employees'}</span>
              {selected && <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-primary" />}
            </button>
          );
        })}
        <button type="button" onClick={() => setSelectedCount('custom')} className={cn('rounded-2xl border-2 p-5 flex flex-col items-center justify-center gap-2 transition-all', selectedCount === 'custom' ? 'border-primary bg-primary-soft' : 'border-bg-border bg-white hover:border-primary/40')}>
          <Users className="w-7 h-7 text-primary" /><span className="font-black text-text-primary">Custom</span>
        </button>
      </div>

      {selectedCount === 'custom' && (
        <div className="max-w-sm p-4 rounded-2xl bg-bg-section border border-bg-border">
          <label className="text-xs font-bold text-text-secondary uppercase block mb-2">Custom employee count</label>
          <input type="number" min="1" max="50" value={customCount} onChange={(event) => setCustomCount(event.target.value)} className="booking-input" />
        </div>
      )}

      {!resolvedCount && <p className="text-center text-sm font-bold text-red-500">Please select the number of employees to continue.</p>}

      <BookingActionBar onBack={onBack} onNext={handleNext} disabled={!resolvedCount} />
    </div>
  );
}

export { EmployeeSelectionStep };
