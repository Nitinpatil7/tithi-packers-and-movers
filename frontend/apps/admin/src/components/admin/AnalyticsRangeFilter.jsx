'use client';

import React from 'react';
import { CalendarDays } from 'lucide-react';

const RANGE_OPTIONS = [
  ['day', 'Day'],
  ['week', 'Week'],
  ['month', 'Month'],
  ['year', 'Year'],
  ['custom', 'Custom'],
];

export function toDateKey(date) {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function defaultAnalyticsRange() {
  const today = toDateKey(new Date());
  return { range: 'month', startDate: today, endDate: today };
}

export function analyticsRangeQuery(selection = {}) {
  if (selection.range === 'custom') {
    return {
      range: 'custom',
      startDate: selection.startDate,
      endDate: selection.endDate,
    };
  }
  return { range: selection.range || 'month' };
}

export default function AnalyticsRangeFilter({ value, onChange, compact = false }) {
  const selection = value || defaultAnalyticsRange();
  const setRange = (range) => onChange?.({ ...selection, range });
  const setDate = (key, nextValue) => onChange?.({ ...selection, range: 'custom', [key]: nextValue });

  return (
    <div className={`flex min-w-0 flex-col gap-2 ${compact ? '' : 'sm:items-end'}`}>
      <div className="flex min-w-0 flex-wrap items-center gap-1 rounded-2xl border border-bg-border bg-white p-1">
        {RANGE_OPTIONS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setRange(key)}
            className={`rounded-xl px-3 py-2 text-xs font-black transition ${selection.range === key ? 'bg-primary text-white shadow-sky-sm' : 'text-text-secondary hover:bg-primary-soft'}`}
          >
            {label}
          </button>
        ))}
      </div>
      {selection.range === 'custom' && (
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs font-bold text-text-secondary">
          <CalendarDays className="h-3.5 w-3.5 text-primary" />
          <input
            type="date"
            value={selection.startDate || ''}
            onChange={(event) => setDate('startDate', event.target.value)}
            className="admin-field h-9 w-36 px-2 py-1 text-xs"
            aria-label="Analytics start date"
          />
          <span>to</span>
          <input
            type="date"
            value={selection.endDate || ''}
            onChange={(event) => setDate('endDate', event.target.value)}
            className="admin-field h-9 w-36 px-2 py-1 text-xs"
            aria-label="Analytics end date"
          />
        </div>
      )}
    </div>
  );
}
