// src/components/booking/ReviewStep.jsx
'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Box, Calendar, CheckCircle2, Clock, IndianRupee, MapPin, ShieldCheck, Sparkles, Sun, Truck, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { getTruckImageSrc } from '@/lib/truckVisuals';

const SERVICE_LABELS = {
  local: 'Local Shifting',
  'local-shifting': 'Local Shifting',
  intercity: 'Intercity Moving',
  'intercity-moving': 'Intercity Moving',
  labour: 'Labour & Porter Service',
  'labour-service': 'Labour & Porter Service',
  porter_labour_service: 'Labour & Porter Service',
  packing: 'Ordinary Service',
  commercial: 'Commercial Relocation',
};

const TIME_SLOT_LABELS = {
  morning: 'Morning (7:00 AM - 11:00 AM)',
  afternoon: 'Afternoon (12:00 PM - 4:00 PM)',
  evening: 'Evening (5:00 PM - 8:00 PM)',
};

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function QuoteLine({ icon: Icon, label, detail, value, muted = false }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-sky-100/80 py-4 last:border-0">
      <div className="flex min-w-0 items-start gap-3">
        <span className={cn('mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl', muted ? 'bg-bg-section text-text-tertiary' : 'bg-orange-50 text-primary')}>
          <Icon className="h-4.5 w-4.5" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-black text-text-primary">{label}</span>
          {detail && <span className="mt-0.5 block text-xs font-semibold leading-5 text-text-tertiary">{detail}</span>}
        </span>
      </div>
      <span className={cn('shrink-0 pt-1 text-right font-mono text-sm font-black', muted ? 'text-text-tertiary' : 'text-text-primary')}>
        {value}
      </span>
    </div>
  );
}

function ContextChip({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-orange-100 bg-white/85 px-3 py-2 shadow-xs">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-orange-50 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-black uppercase tracking-wide text-text-tertiary">{label}</span>
        <span className="block truncate text-xs font-bold text-text-primary">{value}</span>
      </span>
    </div>
  );
}

function TruckContext({ truck }) {
  if (!truck?.name) return null;
  const capacity = truck.capacityKg ? `${Number(truck.capacityKg).toLocaleString('en-IN')} kg` : truck.capacityLabel || 'Capacity not set';
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-white/85 p-3 shadow-xs">
      <Image unoptimized src={getTruckImageSrc(truck)} alt={truck.name} width={80} height={56} className="h-14 w-20 shrink-0 rounded-xl border border-bg-border object-cover" />
      <span className="min-w-0">
        <span className="block truncate text-sm font-black text-text-primary">{truck.name}</span>
        <span className="text-xs font-bold text-text-tertiary">{capacity}</span>
      </span>
    </div>
  );
}

export default function ReviewStep({ onSubmit, onBack, bookingData = {} }) {
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
    basePrice = 1499,
    itemsExtraCharge = 0,
    distance = 0,
    distanceCharge = 0,
    pickupFloorCharge = 0,
    dropFloorCharge = 0,
    floorTotalCharge = 0,
    employeeTotal = 0,
    truckTotal = 0,
    addOnTotal = 0,
    sundayHike = 0,
    grandTotal = 0,
    pricingBreakdown = {},
    useBasePackage = false,
  } = bookingData;

  const isLabour = ['labour', 'labour-service', 'porter_labour_service'].includes(serviceType);
  const totalItems = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const itemBreakdown = pricingBreakdown.itemBreakdown || {};
  const selectedTruck = pricingBreakdown.selectedTruck?.name ? pricingBreakdown.selectedTruck : null;
  const labourPerEmployee = employeeCount > 0 ? employeeTotal / employeeCount : 0;
  const pickupFloorSelected = Number(pickupLocation?.floor || 0) > 0;
  const dropFloorSelected = Number(dropLocation?.floor || 0) > 0;
  const formattedDate = scheduledDate
    ? new Date(`${scheduledDate}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  const addonLines = specialServices
    .map((service) => ({
      name: service.name,
      quantity: Number(service.quantity || 1),
      total: Number(service.total ?? ((service.charge || service.price || service.unitPrice || 0) * (service.quantity || 1))),
    }))
    .filter((service) => service.total > 0);

  return (
    <div className="flex flex-col gap-6 text-left">
      <motion.header
        className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50/80 via-white to-sky-50/80 p-5 shadow-card sm:p-6"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-sky">
              <IndianRupee className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Final quote</p>
              <h3 className="mt-1 text-2xl font-black text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>Review Your Booking Cost</h3>
              <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-text-secondary">Only the final computed quotation is shown here. Charges below are calculated from your selected route, access details, inventory, add-ons, and labour choices.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-orange-100 bg-white/90 px-4 py-3 text-right shadow-xs">
            <span className="block text-[10px] font-black uppercase tracking-wide text-text-tertiary">Total quotation</span>
            <strong className="mt-1 block font-mono text-2xl font-black text-primary sm:text-3xl">{formatCurrency(grandTotal)}</strong>
          </div>
        </div>
      </motion.header>

      <motion.section
        className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-card"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.35 }}
      >
        <div className="border-b border-orange-100 bg-gradient-to-r from-orange-50 to-sky-50 px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-black text-text-primary">Cost Breakdown</h4>
              <p className="mt-0.5 text-xs font-semibold text-text-tertiary">Line-by-line charges applied to this booking.</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="px-5 sm:px-6">
          {(!isLabour || useBasePackage || basePrice > 0) && (
            <QuoteLine icon={CheckCircle2} label={isLabour && useBasePackage ? 'Base labour package' : 'Base shifting fare'} detail={isLabour && useBasePackage ? 'Configured base package selected.' : 'Starting fare from the active pricing rule.'} value={formatCurrency(basePrice)} />
          )}

          <QuoteLine icon={MapPin} label="Distance charge" detail={distance ? `${distance} km route distance` : 'Route distance unavailable or not applicable'} value={distanceCharge > 0 ? formatCurrency(distanceCharge) : 'Included'} muted={distanceCharge <= 0} />

          {!isLabour && pickupFloorSelected && <QuoteLine icon={MapPin} label="Pickup lift/floor charge" detail={`Floor ${pickupLocation?.floor}${pickupLocation?.liftAvailable ? ' with lift' : ' without lift'}`} value={pickupFloorCharge > 0 ? formatCurrency(pickupFloorCharge) : 'Included'} muted={pickupFloorCharge <= 0} />}
          {!isLabour && dropFloorSelected && <QuoteLine icon={MapPin} label="Drop lift/floor charge" detail={`Floor ${dropLocation?.floor}${dropLocation?.liftAvailable ? ' with lift' : ' without lift'}`} value={dropFloorCharge > 0 ? formatCurrency(dropFloorCharge) : 'Included'} muted={dropFloorCharge <= 0} />}

          {!isLabour && itemBreakdown.selectedCount > 0 && (
            <QuoteLine icon={Box} label="Free item allowance" value={itemBreakdown.includedCount > 0 ? `${itemBreakdown.includedCount} included` : 'Not applicable'} muted={itemBreakdown.includedCount <= 0} />
          )}

          {!isLabour && itemsExtraCharge > 0 && <QuoteLine icon={Box} label="Additional item charges" detail="Items beyond the free allowance." value={formatCurrency(itemsExtraCharge)} />}
          {!isLabour && itemBreakdown.selectedCount > 0 && itemsExtraCharge <= 0 && <QuoteLine icon={Box} label="Additional item charges" detail="All selected items are covered by the allowance." value="Included" muted />}

          {addonLines.length > 0 ? addonLines.map((service) => (
            <QuoteLine key={service.name} icon={Sparkles} label={service.quantity > 1 ? `${service.name} x ${service.quantity}` : service.name} detail="Add-on service charge" value={formatCurrency(service.total)} />
          )) : !isLabour && <QuoteLine icon={Sparkles} label="Add-on service charges" detail="No paid add-ons selected." value="None" muted />}

          {isLabour && employeeTotal > 0 && <QuoteLine icon={Users} label="Labour charge" detail={`${hoursCount || 1} hour package${employeeCount ? ` for ${employeeCount} employee(s)` : ''}${labourPerEmployee ? `, ${formatCurrency(labourPerEmployee)} per employee` : ''}`} value={formatCurrency(employeeTotal)} />}
          {isLabour && truckTotal > 0 && <QuoteLine icon={Truck} label="Truck charge" detail={selectedTruck?.name || 'Selected vehicle'} value={formatCurrency(truckTotal)} />}
          {isLabour && useBasePackage && employeeTotal <= 0 && truckTotal <= 0 && <QuoteLine icon={Users} label="Labour/truck package adjustment" detail="Truck, employees, and hours are covered by the selected base package." value="Included" muted />}

          {sundayHike > 0 && <QuoteLine icon={Sun} label="Sunday booking adjustment" detail="Weekend crew availability adjustment." value={formatCurrency(sundayHike)} />}
        </div>

        <div className="border-t border-orange-100 bg-gradient-to-r from-orange-50 via-white to-sky-50 px-5 py-5 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-sm font-black text-text-primary">Total quotation price</span>
              <span className="mt-0.5 block text-xs font-semibold text-text-tertiary">Inclusive of the charge lines above.</span>
            </span>
            <strong className="font-mono text-2xl font-black text-primary sm:text-3xl">{formatCurrency(grandTotal)}</strong>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ContextChip icon={Truck} label="Service" value={SERVICE_LABELS[serviceType] || serviceType} />
        <ContextChip icon={Calendar} label="Move date" value={formattedDate} />
        <ContextChip icon={Clock} label="Time slot" value={TIME_SLOT_LABELS[timeSlot] || timeSlot} />
        <ContextChip icon={Box} label="Inventory" value={totalItems ? `${totalItems} item(s) selected` : isLabour ? `${employeeCount || 0} employee(s), ${hoursCount || 0} hour(s)` : 'No item checklist'} />
      </div>

      <TruckContext truck={selectedTruck} />

      <div className="flex items-center justify-between pt-5 border-t border-bg-border">
        <Button variant="secondary" onClick={onBack} icon={ArrowLeft}>Back</Button>
        <button onClick={onSubmit} className="btn-sky px-6 py-3 rounded-xl font-bold flex items-center gap-2">
          Verify Phone (OTP)
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export { ReviewStep };
