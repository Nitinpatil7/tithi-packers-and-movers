// src/components/booking/BusinessDetailsStep.jsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Briefcase, ArrowRight, Building2, Users, Maximize2, Package } from 'lucide-react';

export default function BusinessDetailsStep({ onSubmit, initialData = {} }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      businessType: initialData.businessDetails?.businessType || '',
      employeeCount: initialData.businessDetails?.employeeCount || '',
      premisesSize: initialData.businessDetails?.premisesSize || '',
      specialItems: initialData.businessDetails?.specialItems || '',
    }
  });

  const handleFormSubmit = (data) => onSubmit({ businessDetails: data });

  const businessTypes = [
    { value: 'Office', label: '🏢 Office Space' },
    { value: 'Retail Shop', label: '🛍️ Retail / Showroom' },
    { value: 'Warehouse', label: '🏭 Warehouse / Storage' },
    { value: 'Clinic/Lab', label: '🏥 Medical / Laboratory' },
    { value: 'Other', label: '📋 Other Commercial' },
  ];

  const employeeRanges = [
    { value: '1-5', label: '1 – 5 Employees' },
    { value: '6-15', label: '6 – 15 Employees' },
    { value: '16-50', label: '16 – 50 Employees' },
    { value: '50+', label: '50+ Employees' },
  ];

  const inputClass = "booking-input text-sm";
  const selectClass = "booking-input text-sm appearance-none cursor-pointer";
  const labelClass = "text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-1.5";

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-7">
      <div>
        <h3 className="text-2xl font-black text-text-primary mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
          🏢 Business Relocation Details
        </h3>
        <p className="text-sm text-text-secondary font-medium">
          Tell us about your business so we can plan the perfect commercial move.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>
            <Building2 className="w-3.5 h-3.5 text-primary" />
            Business Category *
          </label>
          <select
            className={`${selectClass} ${errors.businessType ? 'border-red-400' : ''}`}
            {...register('businessType', { required: 'Business type is required' })}
          >
            <option value="">Select type...</option>
            {businessTypes.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.businessType && <p className="text-xs text-red-500 font-semibold">⚠ {errors.businessType.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>
            <Users className="w-3.5 h-3.5 text-primary" />
            Team Size *
          </label>
          <select
            className={`${selectClass} ${errors.employeeCount ? 'border-red-400' : ''}`}
            {...register('employeeCount', { required: 'Team size is required' })}
          >
            <option value="">Select range...</option>
            {employeeRanges.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.employeeCount && <p className="text-xs text-red-500 font-semibold">⚠ {errors.employeeCount.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>
            <Maximize2 className="w-3.5 h-3.5 text-primary" />
            Premises Size *
          </label>
          <input
            placeholder="e.g. 1500 sq ft"
            className={`${inputClass} ${errors.premisesSize ? 'border-red-400' : ''}`}
            {...register('premisesSize', {
              required: 'Premises size is required',
              pattern: { value: /^[0-9a-zA-Z\s]+$/, message: 'Enter a valid format (e.g. 1500 sq ft)' }
            })}
          />
          {errors.premisesSize && <p className="text-xs text-red-500 font-semibold">⚠ {errors.premisesSize.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>
            <Package className="w-3.5 h-3.5 text-primary" />
            Special Equipment (optional)
          </label>
          <input
            placeholder="e.g. servers, large safes, glass dividers"
            className={inputClass}
            {...register('specialItems')}
          />
        </div>
      </div>

      {/* Info tip */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200">
        <span className="text-xl shrink-0">💡</span>
        <div>
          <p className="text-sm font-bold text-amber-800">Weekend Moves Available</p>
          <p className="text-xs text-amber-700 font-medium mt-0.5 leading-relaxed">
            We specialize in weekend and after-hours commercial moves to minimize business disruption.
          </p>
        </div>
      </div>

      <div className="pt-4 flex justify-end border-t border-bg-border">
        <button type="submit" className="btn-orange px-6 py-3 rounded-xl font-bold flex items-center gap-2">
          Next Step <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
export { BusinessDetailsStep };
