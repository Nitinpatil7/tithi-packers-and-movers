// src/components/booking/ReviewStep.jsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, MapPin, Box, Sparkles, Calendar,
  Clock, IndianRupee, CheckCircle2, Users, Sun, AlertTriangle, Truck
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { formatCurrency, getServiceLabel } from '@/lib/utils';

const SERVICE_LABELS = {
  'local': 'Local Shifting',
  'local-shifting': 'Local Shifting',
  'intercity': 'Intercity Moving',
  'intercity-moving': 'Intercity Moving',
  'labour': 'Labour & Porter Service',
  'labour-service': 'Labour & Porter Service',
  'packing': 'Ordinary Service',
  'commercial': 'Commercial Relocation',
};

const TIME_SLOT_LABELS = {
  morning: 'Morning (7:00 AM – 11:00 AM)',
  afternoon: 'Afternoon (12:00 PM – 4:00 PM)',
  evening: 'Evening (5:00 PM – 8:00 PM)',
};

function ReviewCard({ icon: Icon, iconColor, iconBg, title, children }) {
  return (
    <div className="bg-bg-section rounded-2xl border border-bg-border p-5 flex flex-col gap-4 text-left">
      <div className="flex items-center gap-3 border-b border-bg-border pb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: iconBg }}>
          <Icon className="w-4.5 h-4.5" style={{ color: iconColor }} />
        </div>
        <h4 className="text-sm font-black text-text-primary uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
          {title}
        </h4>
      </div>
      <div className="flex flex-col gap-3 text-sm">{children}</div>
    </div>
  );
}

function DataRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-text-tertiary font-bold uppercase tracking-wider">{label}</span>
      <span className="text-base font-bold text-text-primary">{value || '—'}</span>
    </div>
  );
}

function PricingRow({ label, value, highlight, strike }) {
  return (
    <div className={cn("flex items-center justify-between py-2", highlight ? "border-t-2 border-primary/20 mt-1 pt-3" : "border-b border-bg-border last:border-0")}>
      <span className={cn("text-sm font-semibold", highlight ? "font-black text-text-primary" : "text-text-secondary")}>
        {label}
      </span>
      <span className={cn("text-sm font-black font-mono", highlight ? "text-primary text-lg" : strike ? "text-text-tertiary line-through" : "text-text-primary")}>
        {value}
      </span>
    </div>
  );
}

// cn utility inline
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
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

  const isLabour = serviceType === 'labour' || serviceType === 'labour-service' || serviceType === 'porter_labour_service';
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const labourPerEmployee = employeeCount > 0 ? employeeTotal / employeeCount : 0;
  const allowanceText = (pricingBreakdown.freeItemAllowance || []).map((item) => `${item.sizeKey}: ${item.quantity}`).join(' · ');
  const itemBreakdown = pricingBreakdown.itemBreakdown || {};
  const rawSelectedTruck = pricingBreakdown.selectedTruck || {};
  const truckLabel = rawSelectedTruck?.name
    ? `${rawSelectedTruck.name}${rawSelectedTruck.capacityKg ? ` - ${Number(rawSelectedTruck.capacityKg).toLocaleString('en-IN')} kg` : ''}`
    : '';
  const selectedTruck = truckLabel ? { ...rawSelectedTruck, name: truckLabel, capacityKg: 0 } : {};
  const employeeRate = pricingBreakdown.employeeRate || {};
  const hourlyRate = pricingBreakdown.hourlyRate || {};
  const activeDistanceSlab = (pricingBreakdown.distanceSlabs || []).find((slab) => Number(distance) >= Number(slab.fromKm || 0) && (slab.toKm === null || slab.toKm === undefined || slab.toKm === '' || Number(distance) <= Number(slab.toKm)));

  const formattedDate = scheduledDate
    ? new Date(scheduledDate + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      })
    : '—';

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="text-left">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-black text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
            Review Your Booking
          </h3>
        </div>
        <p className="text-sm text-text-secondary font-medium">
          Everything looks good? Verify your phone to confirm.
        </p>
      </div>

      {/* Top row: Route + Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Route */}
        <ReviewCard icon={MapPin} iconBg="#E0F2FE" iconColor="#0EA5E9" title="Addresses & Route">
          <DataRow label="From (Pickup)" value={pickupLocation?.address} />
          {pickupLocation?.address && (
            <span className="text-xs text-text-tertiary font-semibold -mt-2">
              Floor: {pickupLocation?.floor === 0 ? 'Ground' : pickupLocation?.floor}
              {pickupLocation?.liftAvailable ? ' · Lift ✓' : ' · No Lift'}
            </span>
          )}
          {dropLocation?.address && (
            <>
              <div className="h-px bg-bg-border" />
              <DataRow label="To (Drop)" value={dropLocation.address} />
              <span className="text-xs text-text-tertiary font-semibold -mt-2">
                Floor: {dropLocation?.floor === 0 ? 'Ground' : dropLocation?.floor}
                {dropLocation?.liftAvailable ? ' · Lift ✓' : ' · No Lift'}
              </span>
            </>
          )}
        </ReviewCard>

        {/* Schedule */}
        <ReviewCard icon={Calendar} iconBg="#BAE6FD" iconColor="#0284C7" title="Schedule">
          <DataRow label="Service" value={SERVICE_LABELS[serviceType] || serviceType} />
          {truckLabel && <DataRow label="Selected truck" value={truckLabel} />}
          <div className="grid grid-cols-1 gap-3 border-t border-bg-border pt-3">
            <DataRow label="Date" value={formattedDate} />
            <DataRow label="Time Slot" value={TIME_SLOT_LABELS[timeSlot] || timeSlot} />
          </div>
          {sundayHike > 0 && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-xl border border-amber-200 -mt-1">
              <Sun className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="text-xs font-bold text-amber-700">Sunday — 5% extra charge applies</p>
            </div>
          )}
        </ReviewCard>
      </div>

      {/* Employee / Labour summary */}
      {employeeCount > 0 && (
        <ReviewCard icon={Users} iconBg="#E0F2FE" iconColor="#0EA5E9" title={isLabour ? 'Labour Details' : 'Crew'}>
          <DataRow label="Employees" value={`${employeeCount} worker${employeeCount > 1 ? 's' : ''}`} />
          {isLabour && hoursCount > 0 && (
            <DataRow label="Duration" value={`${hoursCount} hour${hoursCount > 1 ? 's' : ''}`} />
          )}
          {isLabour && selectedTruck?.name && <DataRow label="Truck selected" value={`${selectedTruck.name}${selectedTruck.capacityKg ? ` · ${selectedTruck.capacityKg} kg` : ''}${truckTotal > 0 ? ` · ${formatCurrency(truckTotal)}` : ''}`} />}
          {isLabour && employeeRate?.employees && <DataRow label="Employee package" value={employeeRate.label || `${employeeRate.employees} employee(s)`} />}
          {isLabour && (hourlyRate?.hours || hourlyRate?.price) && <DataRow label="Hourly package" value={`${hourlyRate.label || `${hoursCount} hour`}${hourlyRate.price ? ` · ${formatCurrency(hourlyRate.price)} per employee` : ''}`} />}
          <DataRow label="Labour Cost" value={formatCurrency(employeeTotal)} />
        </ReviewCard>
      )}

      {isLabour && (
        <ReviewCard icon={Truck} iconBg="#E0F2FE" iconColor="#0EA5E9" title="Porter Quote Details">
          <DataRow label="Distance" value={distanceCharge > 0 ? `${distance} km · ${formatCurrency(distanceCharge)}` : 'Distance charge not applied'} />
          {activeDistanceSlab && <DataRow label="Distance range" value={`${activeDistanceSlab.label || `${activeDistanceSlab.fromKm}-${activeDistanceSlab.toKm || '+'} km`} · ${activeDistanceSlab.isFree ? 'Free' : `${formatCurrency(activeDistanceSlab.ratePerKm)} / km`}`} />}
          <DataRow label="Truck" value={selectedTruck?.name ? `${selectedTruck.name}${truckTotal > 0 ? ` · ${formatCurrency(truckTotal)}` : ''}` : 'Not selected'} />
          <DataRow label="Employees + hours" value={`${employeeCount || 0} employee(s) · ${hoursCount || 0} hour(s)`} />
        </ReviewCard>
      )}

      {/* Items + Add-ons (non-labour) */}
      {!isLabour && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReviewCard icon={Box} iconBg="#BAE6FD" iconColor="#0EA5E9" title={`Inventory (${totalItems} items)`}>
            {Boolean(itemBreakdown.selectedCount) && (
              <div className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700">
                Base allowance included {itemBreakdown.includedCount || 0} item(s). Additional charged item(s): {itemBreakdown.chargedCount || 0}.
              </div>
            )}
            {items.length > 0 ? (
              <div className="max-h-[180px] overflow-y-auto flex flex-col gap-2 pr-1">
                {items.map((item) => (
                  <div key={item.name} className="flex justify-between items-center py-2 border-b border-bg-border last:border-0">
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-semibold text-text-secondary">{item.name}</span>
                      <span className="text-[10px] text-text-tertiary uppercase font-bold">Size: {item.tag}</span>
                    </div>
                    <span className="text-sm font-black text-text-primary font-mono bg-primary-soft px-2 py-0.5 rounded-lg">
                      ×{item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <span className="text-3xl block mb-2">📋</span>
                <p className="text-sm text-text-tertiary font-semibold">No items checklist added</p>
              </div>
            )}
          </ReviewCard>

          <ReviewCard icon={Sparkles} iconBg="#E0F2FE" iconColor="#38BDF8" title="Special Add-ons">
            {specialServices.length > 0 ? (
              <div className="max-h-[180px] overflow-y-auto flex flex-col gap-2 pr-1">
                {specialServices.map((service) => (
                  <div key={service.name} className="flex justify-between items-center py-2 border-b border-bg-border last:border-0">
                    <span className="text-sm font-semibold text-text-secondary">
                      {service.name} ×{service.quantity}
                    </span>
                    <span className="text-sm font-black text-primary font-mono">
                      {formatCurrency((service.charge || service.price || 0) * service.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <Sparkles className="mb-2 h-7 w-7 text-primary" strokeWidth={1.7} />
                <p className="text-sm text-text-tertiary font-semibold">No add-ons selected</p>
              </div>
            )}
          </ReviewCard>
        </div>
      )}

      {/* Pricing Summary */}
      <motion.div
        className="p-6 bg-primary-soft rounded-2xl border border-primary/20 flex flex-col gap-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-4 text-left">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <IndianRupee className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-base font-black text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
              Detailed Price Quotation
            </p>
            <p className="text-xs text-text-secondary font-medium">
              Transparent charges based on distance, floor level, and items.
            </p>
          </div>
        </div>

        <div className="flex flex-col">
          {/* Base Fare */}
          {(!isLabour || useBasePackage || basePrice > 0) && (
            <PricingRow label={isLabour && useBasePackage ? 'Base Labour Package' : 'Base Fare Shifting Cost'} value={formatCurrency(basePrice)} />
          )}

          {/* Shifting Items Extra */}
          {itemsExtraCharge > 0 && (
            <PricingRow 
              label={`Additional item charges${allowanceText ? ` (base includes ${allowanceText})` : ' (above base allowance)'}`} 
              value={formatCurrency(itemsExtraCharge)} 
            />
          )}
          {!isLabour && itemBreakdown.selectedCount > 0 && itemsExtraCharge === 0 && (
            <PricingRow
              label={`Items covered in base allowance${allowanceText ? ` (${allowanceText})` : ''}`}
              value="Included"
            />
          )}

          {/* Distance Charges */}
          {distanceCharge > 0 && (
            <PricingRow 
              label={`Distance Charges (${distance} km)`} 
              value={formatCurrency(distanceCharge)} 
            />
          )}

          {/* Floor Charges */}
          {floorTotalCharge > 0 && (
            <PricingRow 
              label={`Floor Charges (Pickup: F${pickupLocation?.floor ?? 0} + Drop: F${dropLocation?.floor ?? 0})`} 
              value={formatCurrency(floorTotalCharge)} 
            />
          )}

          {/* Labor/Crew charges */}
          {employeeTotal > 0 && (
            <PricingRow 
              label={isLabour ? `Labour (${hoursCount || 1}h package ${formatCurrency(labourPerEmployee)} per employee × ${employeeCount})` : `Crew Service (${employeeCount} employees)`}
              value={formatCurrency(employeeTotal)} 
            />
          )}
          {truckTotal > 0 && (
            <PricingRow
              label={`Truck Charge${pricingBreakdown.selectedTruck?.name ? ` (${pricingBreakdown.selectedTruck.name})` : ''}`}
              value={formatCurrency(truckTotal)}
            />
          )}

          {/* Add-on services */}
          {addOnTotal > 0 && (
            <PricingRow label="Special Services & Add-ons" value={formatCurrency(addOnTotal)} />
          )}

          {/* Sunday Hike */}
          {sundayHike > 0 && (
            <PricingRow
              label="Sunday Booking Hike (+5%)"
              value={`+ ${formatCurrency(sundayHike)}`}
            />
          )}

          {/* Grand Total */}
          <PricingRow
            label="Total Quotation Price"
            value={formatCurrency(grandTotal)}
            highlight
          />
        </div>

        {sundayHike > 0 && (
          <div className="flex items-start gap-2 mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-left">
            <Sun className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-amber-700">
              5% Sunday hike (₹{sundayHike}) has been added to your shifting quotation.
            </p>
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-5 border-t border-bg-border">
        <Button variant="secondary" onClick={onBack} icon={ArrowLeft}>Back</Button>
        <button
          onClick={onSubmit}
          className="btn-sky px-6 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          Verify Phone (OTP)
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
export { ReviewStep };
