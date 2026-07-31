// src/components/admin/BookingTable.jsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, Edit3, Trash2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { formatBookingDate, formatBookingTimeSlot, formatCurrency, formatDate } from '@/lib/utils';

const TIME_SLOT_LABELS = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  after_hours: 'After hours',
};

export default function BookingTable({ bookings = [], limit, onEdit, onDelete }) {
  const visibleBookings = limit ? bookings.slice(0, limit) : bookings;

  if (visibleBookings.length === 0) {
    return (
      <div className="py-16 text-center text-text-secondary text-sm border border-bg-border border-dashed rounded-xl bg-bg-section/50">
        <span className="text-4xl block mb-3">📋</span>
        No booking records found matching the active filters.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-bg-border rounded-xl bg-white shadow-xs">
      <table className="w-full text-left border-collapse">

        {/* Table Head */}
        <thead>
          <tr className="border-b border-bg-border bg-sky-50 text-text-secondary text-[11px] font-black uppercase tracking-wider">
            <th className="px-5 py-4">Booking ID</th>
            <th className="px-5 py-4">Customer</th>
            <th className="px-5 py-4 hidden md:table-cell">Service</th>
            <th className="px-5 py-4 hidden sm:table-cell">Date / Time</th>
            <th className="px-5 py-4 hidden lg:table-cell">Booked On</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4 hidden sm:table-cell">Amount</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-bg-border text-xs md:text-sm">
          {visibleBookings.map((b) => {
            const bookingId = b.bookingId || b.bookingid || b._id;
            const timeSlot = formatBookingTimeSlot(b, TIME_SLOT_LABELS, 'Slot not set');
            const scheduledDate = formatBookingDate(b);
            const bookedDate = formatDate(b.createdAt) || '-';
            return (
            <tr
              key={bookingId}
              className="hover:bg-sky-50/50 transition-colors group"
            >
              {/* ID */}
              <td className="px-5 py-4 font-mono font-bold text-text-primary text-xs">
                {bookingId || '-'}
              </td>

              {/* Customer */}
              <td className="px-5 py-4">
                <div className="flex flex-col text-left gap-0.5">
                  <span className="font-bold text-text-primary">{b.customerName || '-'}</span>
                  <span className="text-[10px] text-text-tertiary font-mono">{b.mobile || '-'}</span>
                  <span className="text-[10px] font-semibold text-text-tertiary sm:hidden">{scheduledDate} / {timeSlot}</span>
                  <span className="text-[10px] font-semibold text-sky-600 lg:hidden">Booked: {bookedDate}</span>
                </div>
              </td>

              {/* Service */}
              <td className="px-5 py-4 hidden md:table-cell">
                <Badge variant="service" type={b.serviceType} />
              </td>

              {/* Date */}
              <td className="px-5 py-4 hidden sm:table-cell text-text-secondary font-mono">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-text-primary">{scheduledDate}</span>
                  <span className="text-[10px] font-semibold capitalize text-text-tertiary">{timeSlot}</span>
                </div>
              </td>

              {/* Booked Date */}
              <td className="px-5 py-4 hidden lg:table-cell text-text-secondary font-mono">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-text-primary">{bookedDate}</span>
                  <span className="text-[10px] font-semibold text-text-tertiary">Created by user</span>
                </div>
              </td>

              {/* Status */}
              <td className="px-5 py-4">
                <Badge variant="status" type={b.status} />
              </td>

              {/* Amount */}
              <td className="px-5 py-4 hidden sm:table-cell font-mono font-semibold text-text-primary">
                {b.totalAmount > 0 ? formatCurrency(b.totalAmount) : (
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Pending Quote
                  </span>
                )}
              </td>

              {/* Actions */}
              <td className="px-5 py-4">
                <div className="flex items-center justify-end gap-1">
                  {/* View */}
                  <Link
                    href={`/admin/bookings/${encodeURIComponent(bookingId)}`}
                    title="View Details"
                    aria-label="View booking details"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-primary hover:bg-primary-soft transition-all"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  {/* Edit */}
                  {onEdit && (
                    <button
                      title="Edit Booking"
                      onClick={() => onEdit(b)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-sky-600 hover:bg-sky-50 transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Delete */}
                  {onDelete && (
                    <button
                      title="Delete Booking"
                      onClick={() => onDelete(b)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );})}
        </tbody>
      </table>
    </div>
  );
}
export { BookingTable };
