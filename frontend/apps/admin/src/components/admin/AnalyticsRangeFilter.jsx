'use client';

import React from 'react';

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
    <div className={`flex w-full min-w-0 flex-col gap-2 ${compact ? 'sm:w-auto' : 'sm:w-auto sm:items-end'}`}>
      <label className="flex w-full min-w-0 flex-col gap-1 sm:w-auto">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Time range</span>
        <select
          value={selection.range || 'month'}
          onChange={(event) => setRange(event.target.value)}
          className={`admin-field h-10 w-full min-w-0 px-3 py-2 text-sm font-extrabold text-text-primary ${compact ? 'sm:w-40' : 'sm:w-44'}`}
          aria-label="Analytics time range"
        >
          {RANGE_OPTIONS.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>
      {selection.range === 'custom' && (
        <div className="grid w-full min-w-0 grid-cols-1 items-center gap-2 text-xs font-bold text-text-secondary min-[420px]:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:w-auto sm:grid-cols-[9rem_auto_9rem]">
          <input
            type="date"
            value={selection.startDate || ''}
            onChange={(event) => setDate('startDate', event.target.value)}
            className="admin-field h-9 w-full min-w-0 px-2 py-1 text-xs"
            aria-label="Analytics start date"
          />
          <span className="text-center">to</span>
          <input
            type="date"
            value={selection.endDate || ''}
            onChange={(event) => setDate('endDate', event.target.value)}
            className="admin-field h-9 w-full min-w-0 px-2 py-1 text-xs"
            aria-label="Analytics end date"
          />
        </div>
      )}
    </div>
  );
}
