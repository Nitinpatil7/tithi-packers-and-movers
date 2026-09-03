// src/components/booking/ReviewStep.jsx
'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Box, Calendar, Clock, IndianRupee, MapPin, PackageCheck, Sparkles, Truck, Users } from 'lucide-react';
import { formatCurrency } from '@tithi/utils/utils';
import { getTruckImageSrc } from '@tithi/utils/truckVisuals';
import BookingActionBar from './BookingActionBar';

const SERVICE_LABELS = {
  local: 'Local Shifting',
  'local-shifting': 'Local Shifting',
  intercity: 'Intercity Moving',
  'intercity-moving': 'Intercity Moving',
  labour: 'Labour & Vehicle',
  'labour-service': 'Labour & Vehicle',
  porter_labour_service: 'Labour & Vehicle',
  packing: 'Ordinary Service',
  commercial: 'Commercial Relocation',
};

const TIME_SLOT_LABELS = {
  morning: 'Morning (7:00 AM - 11:00 AM)',
  afternoon: 'Afternoon (12:00 PM - 4:00 PM)',
  evening: 'Evening (5:00 PM - 8:00 PM)',
};

function cleanText(value) {
  return String(value || '').replace(/\\r\\n|\\n|\\r/g, ' ').replace(/\s+/g, ' ').trim();
}

function DetailCard({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="booking-themed-card min-w-0 rounded-2xl border border-sky-100 bg-white/90 p-4 shadow-xs">
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-[10px] font-black uppercase tracking-wide text-text-tertiary">{label}</span>
          <span className="mt-1 block break-words text-sm font-bold leading-5 text-text-primary">{value}</span>
        </span>
      </div>
    </div>
  );
}

function ScrollPanel({ title, subtitle, icon: Icon, children, empty }) {
  return (
    <section className="booking-themed-card min-w-0 overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-card">
      <div className="booking-themed-card-head border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-orange-50 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <h4 className="text-base font-black text-text-primary">{title}</h4>
            {subtitle && <p className="mt-0.5 text-xs font-semibold leading-5 text-text-tertiary">{subtitle}</p>}
          </span>
        </div>
      </div>
      <div className="h-60 overflow-y-auto overscroll-contain p-4 pr-3 sm:h-64 sm:p-5">
        {children || <p className="rounded-2xl border border-dashed border-bg-border p-8 text-center text-sm font-semibold text-text-tertiary">{empty}</p>}
      </div>
    </section>
  );
}

function InlineIconImage({ icon, className = 'h-9 w-9' }) {
  return icon ? (
    <Image
      src={icon}
      alt=""
      width={48}
      height={48}
      sizes="36px"
      className={`${className} rounded-lg object-cover dark:drop-shadow-[0_10px_18px_rgba(0,0,0,0.32)]`}
    />
  ) : null;
}

export default function ReviewStep({ onSubmit, onBack, bookingData = {}, nextLabel = 'Verify Phone' }) {
  const {
    serviceType,
    pickupLocation,
    dropLocation,
    items = [],
    specialServices = [],
    scheduledDate,
    timeSlot,
    employeeCount = 0,
    hoursCount = 0,
    grandTotal = 0,
    totalAmount = 0,
    selectedTruckData,
    selectedTruck,
    labourOnly,
    truckType,
    pricingBreakdown = {},
    packingSubType,
    businessDetails = {},
  } = bookingData;

  const isLabour = ['labour', 'labour-service', 'porter_labour_service'].includes(serviceType);
  const totalItems = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const total = Number(totalAmount || grandTotal || 0);
  const reviewCopy = nextLabel === 'Update'
    ? 'Review your updated booking total and selected services.'
    : 'Review your booking details before phone verification. Detailed price calculation is kept internal.';
  const formattedDate = scheduledDate
    ? new Date(`${scheduledDate}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : '';
  const truck = selectedTruckData || pricingBreakdown.selectedTruck || null;
  const truckLabel = labourOnly ? 'Without Truck' : truck?.name || selectedTruck || truckType || '';
  const addOns = (specialServices || []).filter((service) => cleanText(service.name));

  return (
    <div className="booking-review-ui flex min-w-0 flex-col gap-6 text-left sm:gap-7">
      <motion.header
        className="booking-themed-card booking-review-total relative mb-1 rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50/95 via-white to-sky-50/95 p-5 shadow-card sm:mb-2 sm:p-6"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-sky">
              <IndianRupee className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-primary">Estimated total</span>
              <strong className="mt-1 block font-mono text-3xl font-black text-text-primary sm:text-4xl">{formatCurrency(total)}</strong>
            </span>
          </div>
          <p className="max-w-md text-sm font-semibold leading-6 text-text-secondary">{reviewCopy}</p>
        </div>
      </motion.header>

      <section className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <DetailCard icon={Truck} label="Service" value={cleanText(SERVICE_LABELS[serviceType] || serviceType)} />
        <DetailCard icon={Calendar} label="Move date" value={formattedDate} />
        <DetailCard icon={Clock} label="Time slot" value={TIME_SLOT_LABELS[timeSlot] || timeSlot} />
        <DetailCard icon={MapPin} label={isLabour ? 'Work location' : 'Pickup'} value={cleanText(pickupLocation?.address)} />
        <DetailCard icon={MapPin} label={isLabour ? 'Work end' : 'Drop'} value={cleanText(dropLocation?.address)} />
      </section>

      {isLabour ? (
        <section className="grid min-w-0 gap-3 sm:grid-cols-2">
          <DetailCard icon={Truck} label="Truck option" value={truckLabel || 'Not selected'} />
          <DetailCard icon={Users} label="Workers selected" value={`${employeeCount || 0} employee(s)${hoursCount ? ` for ${hoursCount} hour(s)` : ''}`} />
        </section>
      ) : (
        <ScrollPanel title="Selected Items" subtitle={`${totalItems || 0} item(s) selected`} icon={PackageCheck} empty="No selected items found.">
          {items.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {items.map((item, index) => (
                <div key={item.itemKey || item.key || `${item.name}-${index}`} className="booking-review-chip flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-sky-50/50 px-3 py-2.5">
                  <span className="min-w-0 truncate text-sm font-bold text-text-primary">{cleanText(item.name)}</span>
                  <span className="shrink-0 rounded-lg bg-bg-white px-2 py-1 font-mono text-xs font-black text-primary ring-1 ring-sky-100">x{Number(item.quantity || 0)}</span>
                </div>
              ))}
            </div>
          )}
        </ScrollPanel>
      )}

      <ScrollPanel title="Selected Add-ons" subtitle="Optional services chosen for this booking." icon={Sparkles} empty="No add-ons selected.">
        {addOns.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {addOns.map((service, index) => (
              <div key={`${service.name}-${index}`} className="booking-review-chip flex min-w-0 items-center gap-3 rounded-2xl border border-orange-100 bg-orange-50/60 px-3 py-2.5">
                {service.icon && <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-bg-white/60"><InlineIconImage icon={service.icon} /></span>}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-text-primary">{cleanText(service.name)}</span>
                  {Number(service.quantity || 0) > 1 && <span className="mt-0.5 block text-xs font-semibold text-text-tertiary">Quantity {service.quantity}</span>}
                </span>
              </div>
            ))}
          </div>
        )}
      </ScrollPanel>

      {!isLabour && (
        <section className="grid min-w-0 gap-3 sm:grid-cols-2">
          <DetailCard icon={Box} label="Packing category" value={cleanText(packingSubType)} />
          <DetailCard icon={Users} label="Business details" value={cleanText([businessDetails.businessType, businessDetails.employeeCount, businessDetails.premisesSize].filter(Boolean).join(', '))} />
        </section>
      )}

      {truck && !isLabour && (
        <div className="booking-themed-card flex min-w-0 items-center gap-3 rounded-2xl border border-sky-100 bg-white p-3 shadow-xs">
          <Image unoptimized src={getTruckImageSrc(truck)} alt={truck.name || 'Selected truck'} width={80} height={56} className="h-14 w-20 shrink-0 rounded-xl border border-bg-border object-cover" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-black text-text-primary">{truck.name}</span>
            <span className="text-xs font-bold text-text-tertiary">{truck.capacityKg ? `${Number(truck.capacityKg).toLocaleString('en-IN')} kg` : truck.capacityLabel || 'Selected vehicle'}</span>
          </span>
        </div>
      )}

      <BookingActionBar onBack={onBack} onNext={onSubmit} nextLabel={nextLabel} />
    </div>
  );
}

export { ReviewStep };
