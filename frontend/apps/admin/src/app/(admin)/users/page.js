// src/app/admin/users/page.js
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdminUsers } from '@/hooks/useAdmin';
import Card from '@tithi/ui/Card';
import Spinner from '@tithi/ui/Spinner';
import Badge from '@tithi/ui/Badge';
import { formatCurrency, formatDate } from '@tithi/utils/utils';
import { MessageSquare } from 'lucide-react';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const { data: users = [], isLoading } = useAdminUsers({ search, limit: 300 });
  const userRows = Array.isArray(users) ? users : [];

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
                      {u.mobile}
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
    </div>
  );
}
