// src/components/admin/BookingEditModal.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Clock, Edit3, IndianRupee, Tag, X } from 'lucide-react';
import { getBookingTimeSlot, toDateInputValue, getBookingScheduledDate } from '@/lib/utils';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: '#F59E0B' },
  { value: 'quote_sent', label: 'Quote Sent', color: '#0EA5E9' },
  { value: 'confirmed', label: 'Confirmed', color: '#10B981' },
  { value: 'in_progress', label: 'In Progress', color: '#0EA5E9' },
  { value: 'completed', label: 'Completed', color: '#059669' },
  { value: 'cancelled', label: 'Cancelled', color: '#EF4444' },
];

const TIME_SLOTS = [
  { value: 'morning', label: 'Morning (7AM-11AM)' },
  { value: 'afternoon', label: 'Afternoon (12PM-4PM)' },
  { value: 'evening', label: 'Evening (5PM-8PM)' },
  { value: 'after_hours', label: 'After hours' },
];

export default function BookingEditModal({ booking, isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    status: 'pending',
    scheduledDate: '',
    timeSlot: 'morning',
    manualQuote: '',
    totalAmount: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!booking) return;
    setForm({
      status: booking.status || 'pending',
      scheduledDate: toDateInputValue(getBookingScheduledDate(booking)),
      timeSlot: getBookingTimeSlot(booking) || 'morning',
      manualQuote: booking.manualQuote || booking.pricing?.serviceCharge || '',
      totalAmount: booking.totalAmount || booking.pricing?.totalAmount || '',
      notes: booking.notes || booking.quoteSnapshot?.note || '',
    });
  }, [booking]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        ...booking,
        ...form,
        manualQuote: Number(form.manualQuote) || 0,
        totalAmount: Number(form.totalAmount) || 0,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!booking) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="flex items-center justify-between border-b border-bg-border p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100">
                  <Edit3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-text-primary">Edit Booking</h2>
                  <p className="font-mono text-xs text-text-tertiary">{booking.bookingId || booking.bookingid}</p>
                </div>
              </div>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors hover:bg-bg-section">
                <X className="h-4 w-4 text-text-secondary" />
              </button>
            </div>

            <div className="px-6 pb-2 pt-4">
              <div className="rounded-xl border border-primary/15 bg-sky-50 p-3 text-sm">
                <p className="font-black text-text-primary">{booking.customerName || 'Customer not added'}</p>
                <p className="mt-0.5 font-mono text-xs text-text-secondary">{booking.mobile || '-'} / {booking.email || '-'}</p>
              </div>
            </div>

            <div className="flex flex-col gap-5 p-6">
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary">
                  <Tag className="h-3.5 w-3.5 text-primary" /> Booking Status
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => update('status', status.value)}
                      className={`rounded-xl border-2 px-3 py-2 text-left text-xs font-bold transition-all ${form.status === status.value ? 'border-transparent' : 'border-bg-border bg-white hover:border-bg-elevated'}`}
                      style={form.status === status.value ? { backgroundColor: `${status.color}18`, borderColor: status.color, color: status.color } : {}}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-bg-border" />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Date" icon={Calendar}>
                  <input type="date" value={form.scheduledDate} onChange={(event) => update('scheduledDate', event.target.value)} className="booking-input text-sm" />
                </Field>
                <Field label="Time Slot" icon={Clock}>
                  <select value={form.timeSlot} onChange={(event) => update('timeSlot', event.target.value)} className="booking-input text-sm">
                    {TIME_SLOTS.map((slot) => <option key={slot.value} value={slot.value}>{slot.label}</option>)}
                  </select>
                </Field>
              </div>

              <div className="h-px bg-bg-border" />

              <div>
                <label className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary">
                  <IndianRupee className="h-3.5 w-3.5 text-primary" /> Pricing
                </label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <PriceField label="Service Charge (Rs)" value={form.manualQuote} onChange={(value) => update('manualQuote', value)} />
                  <PriceField label="Total Amount (Rs)" value={form.totalAmount} onChange={(value) => update('totalAmount', value)} />
                </div>
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Internal Notes</span>
                <textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Add any notes for this booking..." rows={3} className="booking-input resize-none text-sm" />
              </label>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-bg-border p-6 pt-4">
              <button onClick={onClose} className="rounded-xl border border-bg-border px-5 py-2.5 text-sm font-bold text-text-secondary transition-colors hover:bg-bg-section">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-sky flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary">
        <Icon className="h-3.5 w-3.5 text-primary" /> {label}
      </span>
      {children}
    </label>
  );
}

function PriceField({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-text-tertiary">{label}</span>
      <input type="number" value={value} onChange={(event) => onChange(event.target.value)} placeholder="0" min={0} className="booking-input text-sm" />
    </label>
  );
}

export { BookingEditModal };
