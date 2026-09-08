// src/components/booking/DateTimeStep.jsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, AlertTriangle, Sun, Sunset, Sunrise } from 'lucide-react';
import Spinner from '@tithi/ui/Spinner';
import { cn } from '@tithi/utils/utils';
import { useBookingStore } from '@tithi/store/bookingStore';
import BookingActionBar from './BookingActionBar';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getTomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function toDateStr(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function CustomCalendar({ selectedDate, onSelect }) {
  const tomorrow = getTomorrowDate();
  const [viewYear, setViewYear] = useState(tomorrow.getFullYear());
  const [viewMonth, setViewMonth] = useState(tomorrow.getMonth());

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const days = [];
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(viewYear, viewMonth, d));
    }
    return days;
  }, [viewYear, viewMonth]);

  const goToPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goToNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Don't allow going back before the month of tomorrow
  const canGoPrev = viewYear > tomorrow.getFullYear() ||
    (viewYear === tomorrow.getFullYear() && viewMonth > tomorrow.getMonth());

  return (
    <div className="overflow-hidden rounded-2xl border border-bg-border bg-white shadow-card">
      {/* Month nav */}
      <div className="flex items-center justify-between border-b border-bg-border bg-sky-50 px-3.5 py-3 sm:px-5 sm:py-4">
        <button
          type="button"
          onClick={goToPrev}
          disabled={!canGoPrev}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-text-secondary" />
        </button>
        <span className="text-sm font-semibold text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={goToNext}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-text-secondary" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-bg-border">
        {DAY_NAMES.map((d) => (
          <div key={d} className={cn(
            "py-1.5 text-center text-[11px] font-semibold uppercase tracking-widest sm:py-2",
            d === 'Sun' ? "text-red-500" : "text-text-tertiary"
          )}>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5 p-2 sm:p-3">
        {calendarDays.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;

          const isPast = day < tomorrow && !isSameDay(day, tomorrow);
          const isDisabled = isPast;
          const isSunday = day.getDay() === 0;
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={idx}
              type="button"
              disabled={isDisabled}
              onClick={() => !isDisabled && onSelect(day)}
              className={cn(
                "calendar-day mx-auto",
                isSelected && isSunday ? "calendar-day-selected calendar-day-sunday bg-red-500 text-white" : "",
                isSelected && !isSunday ? "calendar-day-selected" : "",
                !isSelected && isSunday && !isDisabled ? "calendar-day-sunday" : "",
                isDisabled ? "calendar-day-disabled" : "",
                isToday && !isSelected ? "ring-2 ring-primary/40 font-black" : ""
              )}
              title={isSunday && !isDisabled ? 'Sunday booking' : undefined}
            >
              {day.getDate()}
              {isSunday && !isDisabled && (
                <span className="sunday-hike-badge">S</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 border-t border-bg-border bg-sky-50 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-sky-500" />
          <span className="text-[10px] font-semibold text-text-secondary">Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-red-100 text-red-500 flex items-center justify-center text-[9px] font-bold ring-1 ring-red-300">
            S
          </div>
          <span className="text-[10px] font-semibold text-text-secondary">Sunday</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-bg-section opacity-40" />
          <span className="text-[10px] font-semibold text-text-secondary">Not available</span>
        </div>
      </div>
    </div>
  );
}

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning', time: '7:00 AM – 11:00 AM', icon: Sunrise, desc: 'Best for large moves' },
  { id: 'afternoon', label: 'Afternoon', time: '12:00 PM – 4:00 PM', icon: Sun, desc: 'Most popular' },
  { id: 'evening', label: 'Evening', time: '5:00 PM – 8:00 PM', icon: Sunset, desc: 'Office hours end' },
];

export default function DateTimeStep({ onSubmit, onBack, initialData = {} }) {
  const updateBookingData = useBookingStore((state) => state.updateBookingData);
  const [calendarReady, setCalendarReady] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    initialData.scheduledDate ? new Date(initialData.scheduledDate + 'T00:00:00') : null
  );
  const [slot, setSlot] = useState(initialData.timeSlot || null);
  const [error, setError] = useState('');
  const initialScheduledDate = initialData.scheduledDate || null;
  const initialTimeSlot = initialData.timeSlot || null;

  const isSunday = selectedDate?.getDay() === 0;

  useEffect(() => {
    setCalendarReady(true);
  }, []);

  useEffect(() => {
    setSelectedDate(initialScheduledDate ? new Date(`${initialScheduledDate}T00:00:00`) : null);
  }, [initialScheduledDate]);

  useEffect(() => {
    setSlot(initialTimeSlot);
  }, [initialTimeSlot]);

  useEffect(() => {
    const scheduledDate = selectedDate ? toDateStr(selectedDate) : null;
    const currentData = useBookingStore.getState().bookingData || {};
    if (
      (currentData.scheduledDate || null) === scheduledDate
      && (currentData.timeSlot || null) === (slot || null)
      && Boolean(currentData.isSunday) === Boolean(isSunday)
    ) {
      return;
    }
    updateBookingData({ scheduledDate, timeSlot: slot, isSunday });
  }, [isSunday, selectedDate, slot, updateBookingData]);

  const handleNext = () => {
    if (!selectedDate) { setError('Please select a moving date.'); return; }
    if (!slot) { setError('Please choose a preferred time slot.'); return; }
    onSubmit({
      scheduledDate: toDateStr(selectedDate),
      timeSlot: slot,
      isSunday,
    });
  };

  return (
    <div className="flex flex-col gap-5 text-left sm:gap-7">
      {/* Title */}
      <div>
        <h3 className="mb-1 text-2xl font-bold text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
          📅 Schedule Your Move
        </h3>
        <p className="text-sm text-text-secondary font-medium">
          Select your preferred date and arrival time slot. Earliest booking is <strong>tomorrow</strong>.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Calendar */}
      <div className="flex flex-col gap-1.5 sm:gap-2">
        <label className="text-xs font-semibold uppercase leading-tight tracking-wider text-text-secondary">
          Select Moving Date *
        </label>
        {calendarReady ? (
          <CustomCalendar
            selectedDate={selectedDate}
            onSelect={(d) => { setSelectedDate(d); setError(''); }}
          />
        ) : (
          <div className="grid min-h-80 place-items-center rounded-2xl border border-bg-border bg-white">
            <Spinner size="md" />
          </div>
        )}
        {calendarReady && selectedDate && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "text-xs font-bold flex items-center gap-1.5 mt-1 px-2",
              isSunday ? "text-red-600" : "text-primary"
            )}
          >
            {isSunday ? '⚠️' : '✓'}{' '}
            {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {isSunday && ' - Weekend crew availability will be reflected in your final quote summary.'}
          </motion.p>
        )}
      </div>

      {/* Sunday warning banner */}
      <AnimatePresence>
        {isSunday && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800">Sunday Booking</p>
                <p className="text-xs text-amber-700 font-medium mt-0.5">
                  Sunday bookings use weekend crew availability. Any applicable adjustment will be shown only in your final quote summary.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time Slot */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase leading-tight tracking-wider text-text-secondary sm:gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Preferred Arrival Time *
        </label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-[repeat(3,minmax(12rem,1fr))] sm:gap-3">
          {TIME_SLOTS.map((item) => {
            const isSelected = slot === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => { setSlot(item.id); setError(''); }}
                className={cn(
                  "flex min-h-[7rem] min-w-0 flex-col items-center justify-center rounded-xl border-2 p-2 text-center cursor-pointer select-none transition-all duration-200 sm:min-h-[9.5rem] sm:min-w-[12rem] sm:rounded-2xl sm:p-5",
                  isSelected
                    ? "border-primary bg-primary-soft shadow-sky"
                    : "border-bg-border bg-white hover:border-primary/30 hover:bg-sky-50 shadow-xs"
                )}
              >
                <item.icon className="mb-1.5 h-5 w-5 text-primary sm:mb-2 sm:h-7 sm:w-7" strokeWidth={1.7} />
                <span className={cn("mb-0.5 text-[11px] font-semibold sm:mb-1 sm:text-sm", isSelected ? "text-primary" : "text-text-primary")}
                  style={{ fontFamily: 'var(--font-heading)' }}>
                  {item.label}
                </span>
                <span className="text-[9px] font-mono leading-3 text-text-secondary sm:text-xs sm:leading-5">{item.time}</span>
                <span className="mt-0.5 text-[8px] font-semibold uppercase text-text-tertiary sm:mt-1 sm:text-[10px] sm:tracking-wider">{item.desc}</span>
                {isSelected && (
                  <span className="mt-1 rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-bold uppercase text-white sm:mt-2 sm:px-2 sm:text-[10px] sm:tracking-wider">
                    Selected
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Flex scheduling info */}
      <div className="flex items-start gap-3 p-4 bg-sky-50 rounded-2xl border border-primary/15">
        <span className="text-xl shrink-0">⚡</span>
        <div>
          <p className="text-sm font-bold text-primary">Flexible Scheduling</p>
          <p className="text-xs text-text-secondary font-medium mt-0.5 leading-relaxed">
            Our team will confirm your booking within 2 hours and adjust the slot if needed. Weekend slots are available.
          </p>
        </div>
      </div>

      {/* Actions */}
      <BookingActionBar onBack={onBack} onNext={handleNext} />
    </div>
  );
}
export { DateTimeStep };
