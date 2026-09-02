// src/app/admin/users/page.js
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdminBookingsByPhone, useAdminUsers } from '@/hooks/useAdmin';
import Card from '@tithi/ui/Card';
import Spinner from '@tithi/ui/Spinner';
import Badge from '@tithi/ui/Badge';
import Modal from '@tithi/ui/Modal';
import { formatCurrency, formatDate } from '@tithi/utils/utils';
import { CalendarDays, IndianRupee, MessageSquare, Phone, TicketCheck } from 'lucide-react';

const SERVICE_LABELS = {
  local_shifting: 'Local Shifting',
  intercity_moving: 'Intercity Moving',
  porter_labour_service: 'Labour & Vehicle',
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const { data: users = [], isLoading } = useAdminUsers({ search, limit: 300 });
  const userRows = Array.isArray(users) ? users : [];
  const selectedPhone = selectedUser?.mobile || '';
  const {
    data: phoneBookings = [],
    isLoading: bookingsLoading,
    isError: bookingsError,
    error: bookingsErrorDetail,
  } = useAdminBookingsByPhone(selectedPhone, { enabled: Boolean(selectedPhone) });

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-text-primary">Registered Users</h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Customer directory generated from confirmed booking records.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, email, or mobile" className="admin-field max-w-md" />
      </div>

      {/* Users directory table card */}
      <Card className="p-6 bg-bg-card border border-bg-border/60 glass">
        {isLoading ? (
          <div className="py-12 flex items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : userRows.length === 0 ? (
          <div className="py-12 text-center text-text-secondary text-sm border border-bg-border border-dashed rounded-lg">
            No users registered in directory yet.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-bg-border bg-bg-elevated/45 text-text-secondary text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Client Name</th>
                  <th className="px-6 py-4">Mobile Number</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Last Booking</th>
                  <th className="px-6 py-4 text-right">Orders Booked</th>
                  <th className="px-6 py-4 text-right">Quoted Value</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border/60 text-xs md:text-sm">
                {userRows.map((u) => (
                  <tr key={u._id} className="hover:bg-bg-elevated/10 transition-colors">
                    {/* Name */}
                    <td className="px-6 py-4 font-bold text-text-primary flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-black uppercase shrink-0">
                        {(u.name || 'U').charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </td>

                    {/* Mobile */}
                    <td className="px-6 py-4 font-mono text-text-primary">
                      <button
                        type="button"
                        onClick={() => setSelectedUser(u)}
                        className="cursor-pointer font-bold text-sky-700 underline-offset-4 transition hover:text-sky-900 hover:underline"
                      >
                        {u.mobile}
                      </button>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-text-secondary">
                      {u.email}
                    </td>

                    {/* Registration Date */}
                    <td className="px-6 py-4 font-mono text-text-secondary">
                      {formatDate(u.lastBookingAt || u.createdAt)}
                    </td>

                    {/* Booking Count */}
                    <td className="px-6 py-4 text-right font-mono font-bold">
                      <Badge variant="primary" className="text-xs px-2 py-0.5">
                        {u.bookingCount || 0} Shifts
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-text-primary">
                      {formatCurrency(u.totalQuotedAmount || 0)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/messaging?mobile=${encodeURIComponent(u.mobile || '')}&name=${encodeURIComponent(u.name || '')}`} className="inline-flex items-center gap-1.5 rounded-lg border border-sky-100 px-3 py-2 text-xs font-semibold text-sky-700">
                        <MessageSquare className="h-3.5 w-3.5" />Message
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        title={selectedUser ? `${selectedUser.name || 'Customer'} bookings` : 'Customer bookings'}
        size="xl"
      >
        <div className="space-y-4 text-left">
          <div className="flex flex-col gap-3 rounded-2xl border border-sky-100 bg-sky-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wide text-text-tertiary">Phone number</p>
              <p className="mt-1 flex items-center gap-2 font-mono text-sm font-black text-text-primary">
                <Phone className="h-4 w-4 text-sky-600" />
                {selectedPhone || '-'}
              </p>
            </div>
            <Badge variant="primary" className="w-fit text-xs px-2 py-0.5">
              {phoneBookings.length} booking{phoneBookings.length === 1 ? '' : 's'}
            </Badge>
          </div>

          {bookingsLoading ? (
            <div className="grid min-h-56 place-items-center rounded-2xl border border-bg-border">
              <Spinner size="md" />
            </div>
          ) : bookingsError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-600">
              {bookingsErrorDetail?.message || 'Could not load bookings for this phone number.'}
            </div>
          ) : phoneBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-bg-border p-8 text-center text-sm font-semibold text-text-secondary">
              No confirmed bookings found for this phone number.
            </div>
          ) : (
            <div className="max-h-[58vh] space-y-3 overflow-y-auto pr-1">
              {phoneBookings.map((booking) => (
                <Link
                  key={booking.bookingid || booking.bookingId}
                  href={`/bookings/${encodeURIComponent(booking.bookingid || booking.bookingId)}`}
                  className="block rounded-2xl border border-bg-border bg-white p-4 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/40"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-mono text-sm font-black text-text-primary">
                        <TicketCheck className="h-4 w-4 text-sky-600" />
                        {booking.bookingid || booking.bookingId}
                      </p>
                      <p className="mt-1 text-xs font-bold text-text-secondary">
                        {SERVICE_LABELS[booking.serviceType] || booking.serviceType || 'Service'}
                      </p>
                    </div>
                    <Badge variant="status" type={booking.status} className="w-fit px-3" />
                  </div>
                  <div className="mt-4 grid gap-2 border-t border-bg-border/60 pt-3 text-xs font-semibold text-text-secondary sm:grid-cols-2">
                    <span className="flex items-center gap-2">
                      <CalendarDays className="h-3.5 w-3.5 text-sky-600" />
                      {formatDate(booking.scheduledDate || booking.scheduledate || booking.createdAt)}
                    </span>
                    <span className="flex items-center gap-2 sm:justify-end">
                      <IndianRupee className="h-3.5 w-3.5 text-sky-600" />
                      {formatCurrency(booking.totalAmount || 0)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
