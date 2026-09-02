'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, IndianRupee, Mail, PackageCheck, Phone, Sparkles, Truck, User, X } from 'lucide-react';
import LocationStep from '@shared-components/booking/LocationStep';
import ItemSelectionStep from '@shared-components/booking/ItemSelectionStep';
import SpecialServicesStep from '@shared-components/booking/SpecialServicesStep';
import TruckSelectionStep from '@shared-components/booking/TruckSelectionStep';
import EmployeeSelectionStep from '@shared-components/booking/EmployeeSelectionStep';
import HoursSelectionStep from '@shared-components/booking/HoursSelectionStep';
import DateTimeStep from '@shared-components/booking/DateTimeStep';
import { usePublicPricingRule, usePublicPricingRules } from '@hooks/useBookingPricingRules';
import { calculateBookingPrice } from '@utils/pricing';
import { formatCurrency } from '@utils/utils';
import { activeServiceTypesFromRules } from '@utils/serviceTypes';

const SERVICES = [
  { value: 'local', api: 'local_shifting', title: 'Local Shifting', desc: 'Surat city pickup and drop with items, add-ons and schedule.', icon: PackageCheck },
  { value: 'intercity', api: 'intercity_moving', title: 'Intercity Moving', desc: 'Surat pickup to another city with dynamic distance pricing.', icon: Truck },
  { value: 'labour', api: 'porter_labour_service', title: 'Labour & Vehicle', desc: 'Vehicle selection, employee count and hourly package quote.', icon: Sparkles },
];

const baseData = {
  serviceType: 'local',
  pickupLocation: null,
  dropLocation: null,
  items: [],
  specialServices: [],
  selectedTruck: null,
  truckType: null,
  employeeCount: 0,
  hoursCount: 0,
  scheduledDate: null,
  timeSlot: null,
  contactDetails: { name: '', mobile: '', email: '' },
};

const applyPricingSnapshot = (bookingData = {}) => {
  const pricing = calculateBookingPrice(bookingData);
  return {
    ...bookingData,
    basePrice: pricing.basePrice,
    itemsExtraCharge: pricing.itemsExtraCharge,
    distance: pricing.distance,
    distanceKm: pricing.distance,
    distanceCharge: pricing.distanceCharge,
    pickupFloorCharge: pricing.pickupFloorCharge,
    dropFloorCharge: pricing.dropFloorCharge,
    floorTotalCharge: pricing.floorTotalCharge,
    employeeTotal: pricing.employeeTotal,
    truckTotal: pricing.truckTotal,
    addOnTotal: pricing.addOnTotal,
    sundayHike: pricing.sundayHike,
    grandTotal: pricing.grandTotal,
    totalAmount: pricing.grandTotal,
    pricingBreakdown: pricing.breakdown,
  };
};

export default function CreateBookingModal({ isOpen, onClose, onSave }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState(baseData);
  const [saving, setSaving] = useState(false);
  const { data: pricingRules = [], isFetched: pricingRulesFetched } = usePublicPricingRules();
  const activeServiceTypes = useMemo(
    () => (pricingRulesFetched ? activeServiceTypesFromRules(pricingRules) : SERVICES.map((service) => service.api)),
    [pricingRules, pricingRulesFetched]
  );
  const activeServices = useMemo(
    () => SERVICES.filter((service) => activeServiceTypes.includes(service.api)),
    [activeServiceTypes]
  );
  const selectedService = activeServices.find((item) => item.value === bookingData.serviceType) || activeServices[0] || SERVICES[0];
  const { data: pricingRule } = usePublicPricingRule(selectedService.api);
  const isLabour = bookingData.serviceType === 'labour';

  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep(0);
    setBookingData(baseData);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !pricingRulesFetched || !activeServices.length) return;
    if (!activeServices.some((service) => service.value === bookingData.serviceType)) {
      setBookingData({ ...baseData, serviceType: activeServices[0].value });
      setCurrentStep(0);
    }
  }, [activeServices, bookingData.serviceType, isOpen, pricingRulesFetched]);

  useEffect(() => {
    if (pricingRule?._id) updateBookingData({ pricingRule });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricingRule?._id]);

  const updateBookingData = (data) => {
    setBookingData((current) => {
      const next = {
        ...current,
        ...data,
        pickupLocation: data.pickupLocation ? { ...current.pickupLocation, ...data.pickupLocation } : current.pickupLocation,
        dropLocation: data.dropLocation ? { ...current.dropLocation, ...data.dropLocation } : current.dropLocation,
        contactDetails: data.contactDetails ? { ...current.contactDetails, ...data.contactDetails } : current.contactDetails,
      };
      return applyPricingSnapshot(next);
    });
  };

  const steps = useMemo(() => isLabour
    ? ['Service', 'Location', 'Truck', 'Employees', 'Hours', 'Schedule', 'Customer', 'Review']
    : ['Service', 'Location', 'Items', 'Add-ons', 'Schedule', 'Customer', 'Review'], [isLabour]);

  const submitStep = (data = {}) => {
    updateBookingData(data);
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };
  const back = () => setCurrentStep((step) => Math.max(0, step - 1));
  const chooseService = (serviceType) => {
    setBookingData({ ...baseData, serviceType });
    setCurrentStep(1);
  };
  const finish = async () => {
    setSaving(true);
    try {
      const finalBookingData = applyPricingSnapshot(bookingData);
      await onSave({
        ...finalBookingData,
        customerName: finalBookingData.contactDetails?.name,
        mobile: finalBookingData.contactDetails?.mobile,
        email: finalBookingData.contactDetails?.email,
        manualQuote: finalBookingData.grandTotal || 0,
        totalAmount: finalBookingData.grandTotal || 0,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const body = () => {
    if (currentStep === 0) return <ServiceChooser services={activeServices} onChoose={chooseService} />;
    if (currentStep === 1) return <LocationStep onSubmit={submitStep} initialData={bookingData} serviceType={bookingData.serviceType} pricingRule={pricingRule} />;
    if (!isLabour && currentStep === 2) return <ItemSelectionStep onSubmit={submitStep} onBack={back} initialData={bookingData} isIntercity={bookingData.serviceType === 'intercity'} />;
    if (!isLabour && currentStep === 3) return <SpecialServicesStep onSubmit={submitStep} onBack={back} initialData={bookingData} serviceType={bookingData.serviceType} />;
    if (!isLabour && currentStep === 4) return <DateTimeStep onSubmit={submitStep} onBack={back} initialData={bookingData} />;
    if (!isLabour && currentStep === 5) return <CustomerStep onSubmit={submitStep} onBack={back} initialData={bookingData} />;
    if (!isLabour && currentStep === 6) return <AdminReview bookingData={bookingData} onBack={back} onSubmit={finish} saving={saving} />;
    if (isLabour && currentStep === 2) return <TruckSelectionStep onSubmit={submitStep} onBack={back} initialData={bookingData} trucks={pricingRule?.labourPricing?.trucks || []} showPrice={false} />;
    if (isLabour && currentStep === 3) return <EmployeeSelectionStep onSubmit={submitStep} onBack={back} initialData={bookingData} employeeRates={pricingRule?.labourPricing?.employeeRates || []} />;
    if (isLabour && currentStep === 4) return <HoursSelectionStep onSubmit={submitStep} onBack={back} initialData={bookingData} rates={pricingRule?.labourPricing?.hourlyRates || []} />;
    if (isLabour && currentStep === 5) return <DateTimeStep onSubmit={submitStep} onBack={back} initialData={bookingData} />;
    if (isLabour && currentStep === 6) return <CustomerStep onSubmit={submitStep} onBack={back} initialData={bookingData} />;
    return <AdminReview bookingData={bookingData} onBack={back} onSubmit={finish} saving={saving} />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-2xl" initial={{ scale: 0.96, y: 18 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 18 }}>
            <header className="flex items-center justify-between border-b border-sky-100 p-4 sm:p-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Create Booking from Admin</h2>
                <p className="text-xs font-medium text-slate-500">Same booking flow and pricing calculation as customer side, made for phone/counter orders.</p>
              </div>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700"><X className="h-4 w-4" /></button>
            </header>
            <StepBar steps={steps} currentStep={currentStep} />
            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              {body()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ServiceChooser({ services, onChoose }) {
  return <div className="mx-auto max-w-4xl text-left"><h3 className="text-2xl font-semibold text-slate-900">Choose service type</h3><p className="mt-1 text-sm font-medium text-slate-500">Admin pehle active service choose kare, phir us service ka proper booking flow open hoga.</p>{services.length ? <div className="mt-6 grid gap-4 md:grid-cols-3">{services.map((service) => { const Icon = service.icon; return <button key={service.value} type="button" onClick={() => onChoose(service.value)} className="rounded-2xl border border-sky-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-50 text-sky-600"><Icon className="h-5 w-5" /></span><h4 className="mt-4 font-semibold text-slate-900">{service.title}</h4><p className="mt-2 text-sm font-medium leading-6 text-slate-500">{service.desc}</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-600">Start flow <ArrowRight className="h-4 w-4" /></span></button>; })}</div> : <p className="mt-6 rounded-2xl border border-dashed border-sky-100 bg-sky-50 p-6 text-center text-sm font-semibold text-slate-500">No active services are available for booking creation.</p>}</div>;
}

function StepBar({ steps, currentStep }) {
  return <div className="border-b border-sky-100 bg-sky-50/45 px-4 py-3"><div className="flex gap-2 overflow-x-auto">{steps.map((step, index) => <div key={step} className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${index === currentStep ? 'bg-sky-600 text-white' : index < currentStep ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-slate-500 ring-1 ring-sky-100'}`}>{index < currentStep ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span>{index + 1}</span>}{step}</div>)}</div></div>;
}

function CustomerStep({ onSubmit, onBack, initialData }) {
  const [form, setForm] = useState(initialData.contactDetails || { name: '', mobile: '', email: '' });
  const [error, setError] = useState('');
  const submit = () => {
    if (!form.name?.trim()) return setError('Customer name required.');
    if (!/^[6-9]\d{9}$/.test(form.mobile || '')) return setError('Valid 10 digit mobile required.');
    onSubmit({ contactDetails: form });
  };
  return <div className="mx-auto max-w-3xl text-left"><h3 className="text-2xl font-semibold text-slate-900">Customer details</h3><p className="mt-1 text-sm font-medium text-slate-500">Admin booking me OTP skip rahega; customer details directly confirm payload me jayengi.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Customer name" icon={User}><input value={form.name || ''} onChange={(e) => { setForm({ ...form, name: e.target.value }); setError(''); }} className="admin-field" placeholder="Customer name" /></Field><Field label="Mobile number" icon={Phone}><input value={form.mobile || ''} onChange={(e) => { setForm({ ...form, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }); setError(''); }} className="admin-field" placeholder="10 digit mobile number" /></Field><Field label="Email optional" icon={Mail}><input value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="admin-field" placeholder="customer@email.com" /></Field></div>{error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}<div className="mt-8 flex items-center justify-between border-t border-sky-100 pt-5"><button onClick={onBack} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600"><ArrowLeft className="h-4 w-4" />Back</button><button onClick={submit} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white">Review quote<ArrowRight className="h-4 w-4" /></button></div></div>;
}

function AdminReview({ bookingData, onBack, onSubmit, saving }) {
  const itemsTotal = (bookingData.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const addons = bookingData.specialServices || [];
  const isLabour = bookingData.serviceType === 'labour';
  return <div className="mx-auto max-w-4xl text-left"><h3 className="text-2xl font-semibold text-slate-900">Review and create booking</h3><p className="mt-1 text-sm font-medium text-slate-500">Final snapshot will be posted through draft, quote update and confirm APIs.</p><div className="mt-6 grid gap-4 lg:grid-cols-2"><SummaryCard title="Customer"><Row label="Name" value={bookingData.contactDetails?.name} /><Row label="Mobile" value={bookingData.contactDetails?.mobile} /><Row label="Email" value={bookingData.contactDetails?.email || '-'} /></SummaryCard><SummaryCard title="Route and schedule"><Row label="Pickup" value={bookingData.pickupLocation?.address} /><Row label="Drop" value={bookingData.dropLocation?.address} /><Row label="Date / slot" value={`${bookingData.scheduledDate || '-'} · ${bookingData.timeSlot || '-'}`} /></SummaryCard>{!isLabour && <SummaryCard title="Items and add-ons"><Row label="Selected items" value={`${itemsTotal} item(s)`} /><Row label="Add-ons" value={`${addons.length} selected`} /><Row label="Extra item charge" value={formatCurrency(bookingData.itemsExtraCharge || 0)} /></SummaryCard>}{isLabour && <SummaryCard title="Labour details"><Row label="Truck" value={bookingData.pricingBreakdown?.selectedTruck?.name || bookingData.selectedTruck} /><Row label="Employees" value={bookingData.employeeCount} /><Row label="Hours" value={bookingData.hoursCount} /></SummaryCard>}<SummaryCard title="Price breakdown"><Row label="Base" value={formatCurrency(bookingData.basePrice || 0)} /><Row label="Distance" value={formatCurrency(bookingData.distanceCharge || 0)} /><Row label="Floor / lift" value={formatCurrency(bookingData.floorTotalCharge || 0)} /><Row label="Items extra" value={formatCurrency(bookingData.itemsExtraCharge || 0)} /><Row label="Add-ons" value={formatCurrency(bookingData.addOnTotal || 0)} /><Row label="Truck" value={formatCurrency(bookingData.truckTotal || 0)} /><Row label="Labour" value={formatCurrency(bookingData.employeeTotal || 0)} /><Row label="Sunday hike" value={formatCurrency(bookingData.sundayHike || 0)} /><div className="mt-3 border-t border-sky-100 pt-3"><Row label="Total quote" value={formatCurrency(bookingData.grandTotal || 0)} strong /></div></SummaryCard></div><div className="mt-8 flex items-center justify-between border-t border-sky-100 pt-5"><button onClick={onBack} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600"><ArrowLeft className="h-4 w-4" />Back</button><button onClick={onSubmit} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"><IndianRupee className="h-4 w-4" />{saving ? 'Creating...' : 'Create booking'}</button></div></div>;
}

function SummaryCard({ title, children }) { return <section className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"><h4 className="mb-3 text-sm font-semibold text-slate-900">{title}</h4><div className="space-y-2">{children}</div></section>; }
function Row({ label, value, strong }) { return <div className="flex items-start justify-between gap-4 text-sm"><span className="font-medium text-slate-500">{label}</span><span className={`${strong ? 'text-lg font-semibold text-sky-700' : 'font-semibold text-slate-800'} text-right`}>{value || '-'}</span></div>; }
function Field({ label, icon: Icon, children }) { return <label className="block"><span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{Icon && <Icon className="h-3.5 w-3.5 text-sky-500" />}{label}</span>{children}</label>; }

export { CreateBookingModal };
