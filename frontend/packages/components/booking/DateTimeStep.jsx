// src/components/booking/DateTimeStep.jsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, ArrowRight, ArrowLeft, AlertTriangle, Sun, Sunset, Sunrise } from 'lucide-react';
import Button from '@ui/Button';
import Spinner from '@ui/Spinner';
import { cn } from '@utils/utils';

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
    <div className="bg-white rounded-2xl border border-bg-border shadow-card overflow-hidden">
      {/* Month nav */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-bg-border bg-sky-50">
        <button
          type="button"
          onClick={goToPrev}
          disabled={!canGoPrev}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-text-secondary" />
        </button>
        <span className="text-sm font-black text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
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
            "py-2 text-center text-[11px] font-black uppercase tracking-widest",
            d === 'Sun' ? "text-red-500" : "text-text-tertiary"
          )}>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5 p-3">
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
      <div className="px-4 py-3 border-t border-bg-border bg-sky-50 flex items-center gap-4 flex-wrap">
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
  const [calendarReady, setCalendarReady] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    initialData.scheduledDate ? new Date(initialData.scheduledDate + 'T00:00:00') : null
  );
  const [slot, setSlot] = useState(initialData.timeSlot || null);
  const [error, setError] = useState('');

  const isSunday = selectedDate?.getDay() === 0;

  useEffect(() => {
    setCalendarReady(true);
  }, []);

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
    <div className="flex flex-col gap-7 text-left">
      {/* Title */}
      <div>
        <h3 className="text-2xl font-black text-text-primary mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
          📅 Schedule Your Move
        </h3>
        <p className="text-sm text-text-secondary font-medium">
          Select your preferred date and arrival time slot. Earliest booking is <strong>tomorrow</strong>.
        </p>
      </div>

      {/* Calendar */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-black uppercase tracking-wider text-text-secondary">
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
      <div className="flex flex-col gap-3">
        <label className="text-xs font-black uppercase tracking-wider text-text-secondary flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Preferred Arrival Time *
        </label>
        <div className="scrollbar-none -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
          {TIME_SLOTS.map((item) => {
            const isSelected = slot === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => { setSlot(item.id); setError(''); }}
                className={cn(
                  "flex min-w-[78vw] snap-start flex-col items-center justify-center text-center p-5 rounded-2xl border-2 cursor-pointer select-none transition-all duration-200 sm:min-w-0",
                  isSelected
                    ? "border-primary bg-primary-soft shadow-sky"
                    : "border-bg-border bg-white hover:border-primary/30 hover:bg-sky-50 shadow-xs"
                )}
              >
                <item.icon className="mb-2 h-7 w-7 text-primary" strokeWidth={1.7} />
                <span className={cn("text-sm font-black mb-1", isSelected ? "text-primary" : "text-text-primary")}
                  style={{ fontFamily: 'var(--font-heading)' }}>
                  {item.label}
                </span>
                <span className="text-xs font-mono text-text-secondary">{item.time}</span>
                <span className="text-[10px] text-text-tertiary font-semibold mt-1 uppercase tracking-wider">{item.desc}</span>
                {isSelected && (
                  <span className="mt-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
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

      {error && (
        <p className="text-sm text-red-500 font-bold text-center">{error}</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-bg-border">
        <Button variant="secondary" onClick={onBack} icon={ArrowLeft}>Back</Button>
        <button
          onClick={handleNext}
          className="btn-sky px-6 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          Next Step <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
export { DateTimeStep };
