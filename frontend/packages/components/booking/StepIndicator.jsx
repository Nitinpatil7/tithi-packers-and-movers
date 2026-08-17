// src/components/booking/StepIndicator.jsx
'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@tithi/utils/utils';

export default function StepIndicator({ steps = [], currentStep = 0 }) {
  return (
    <div className="flex flex-col gap-1">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isActive = idx === currentStep;

        return (
          <div key={step} className="relative">
            {/* Connector line */}
            {idx < steps.length - 1 && (
              <div className={cn(
                "absolute left-5 top-11 w-0.5 h-6 z-0 transition-colors duration-300",
                isCompleted ? "bg-primary" : "bg-bg-border"
              )} />
            )}

            <div className={cn(
              "flex items-center gap-4 py-2 px-3 rounded-xl transition-all duration-300 relative z-10",
              isActive ? "bg-primary-soft" : ""
            )}>
              {/* Step circle */}
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all duration-300 shrink-0 border-2",
                isCompleted
                  ? "bg-primary border-primary text-white"
                  : isActive
                  ? "border-primary text-primary bg-white shadow-sky"
                  : "border-bg-border text-text-tertiary bg-white"
              )}>
                {isCompleted ? <Check className="w-5 h-5" /> : idx + 1}
              </div>

              {/* Label */}
              <div className="flex flex-col">
                <span className={cn(
                  "text-sm font-bold transition-colors duration-300",
                  isCompleted ? "text-emerald-600" : isActive ? "text-primary" : "text-text-tertiary"
                )}>
                  {step}
                </span>
                {isCompleted && (
                  <span className="text-xs text-emerald-500 font-semibold">Completed ✓</span>
                )}
                {isActive && (
                  <span className="text-xs text-primary font-semibold">In progress...</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
export { StepIndicator };
