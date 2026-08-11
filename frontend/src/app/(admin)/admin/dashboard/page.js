// src/app/admin/dashboard/page.js
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  CalendarDays, 
  Clock, 
  CheckCircle, 
  Award, 
  Activity,
  AlertTriangle,
  BarChart3,
  MapPin,
  TimerReset,
} from 'lucide-react';
import { useAdminStats, useAllBookings } from '@/hooks/useAdmin';
import { useAuthStore } from '@/store/authStore';
import StatCard from '@/components/admin/StatCard';
import BookingTable from '@/components/admin/BookingTable';
import dynamic from 'next/dynamic';
import Card from '@/components/ui/Card';

const BookingLineChart = dynamic(() => import('@/components/admin/BookingLineChart'), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center text-text-tertiary">Loading chart...</div>
});

const ServicePieChart = dynamic(() => import('@/components/admin/ServicePieChart'), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center text-text-tertiary">Loading chart...</div>
});

export default function DashboardPage() {
  const { token } = useAuthStore();
  const todayKey = useMemo(() => toDateKey(new Date()), []);
  
  // Fetch stats & bookings
  const { data: stats, isLoading: statsLoading } = useAdminStats(token);
  const { data: bookingsData, isLoading: bookingsLoading } = useAllBookings({}, token);
  const { data: todayBookingsData, isLoading: todayActionsLoading } = useAllBookings({
    scheduledDate: todayKey,
    actionOnly: true,
    limit: 50,
  }, token);
  const { data: delayedBookingsData, isLoading: delayedLoading } = useAllBookings({
    delayOnly: true,
    limit: 25,
  }, token);
  const { data: realtimeSummary } = useQuery({
    queryKey: ['admin', 'realtime-summary'],
    queryFn: async () => null,
    enabled: false,
  });

  const bookings = bookingsData?.bookings || [];
  const todayActionBookings = todayBookingsData?.bookings || [];
  const delayedBookings = delayedBookingsData?.bookings || [];

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-text-primary">Dashboard</h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Real-time metrics and relocation management for Surat.
        </p>
      </div>

      {/* First-screen operations row */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <TodayActionBookings bookings={todayActionBookings} loading={todayActionsLoading} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:col-span-7">
          {statsLoading ? (
            [0, 1, 2, 3].map((item) => <StatSkeleton key={item} />)
          ) : (
            <>
              <StatCard
                title="Today's Orders"
                value={todayActionBookings.length}
                icon={CalendarDays}
                color="primary"
              />
              <StatCard
                title="Next Hour Orders"
                value={realtimeSummary?.counts?.nextHour || 0}
                icon={Clock}
                color="commercial"
              />
              <StatCard
                title="Confirmed Shifts"
                value={stats?.confirmedBookings || 0}
                icon={Award}
                color="local"
              />
              <StatCard
                title="Completed Bookings"
                value={stats?.completedThisMonth || 0}
                icon={CheckCircle}
                color="packing"
              />
            </>
          )}
        </div>
      </div>

      <DelayedBookingsAlert bookings={delayedBookings} loading={delayedLoading} />

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Daily Bookings Line Chart */}
        <Card className="lg:col-span-8 p-6 bg-bg-card border border-bg-border/60 glass flex flex-col gap-4">
          <div className="flex flex-col text-left">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Daily Booking Frequency
            </h3>
            <span className="text-[10px] text-text-tertiary">Calculated monthly cycles</span>
          </div>
          {statsLoading ? <ChartSkeleton /> : <BookingLineChart data={stats?.dailyBookings || []} />}
        </Card>

        {/* Bookings share distribution Donut/Pie Chart */}
        <Card className="lg:col-span-4 p-6 bg-bg-card border border-bg-border/60 glass flex flex-col gap-4">
          <div className="flex flex-col text-left">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Service Category Share
            </h3>
            <span className="text-[10px] text-text-tertiary">Based on total order volumes</span>
          </div>
          {statsLoading ? <ChartSkeleton compact /> : <ServicePieChart data={stats?.bookingsByService || {}} />}
        </Card>

      </div>

      {/* Service Analysis */}
      <ServiceAnalysis stats={stats} loading={statsLoading} />

      {/* Recent Bookings List Card */}
      <Card className="p-6 bg-bg-card border border-bg-border/60 glass flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col text-left">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Recent Shifting Queues
            </h3>
            <span className="text-[10px] text-text-tertiary font-medium">Verify pending locations or quote updates</span>
          </div>
        </div>

        {bookingsLoading ? <TableSkeleton /> : <BookingTable bookings={bookings} limit={10} />}
      </Card>

    </div>
  );
}

function DelayedBookingsAlert({ bookings, loading }) {
  const visibleBookings = useMemo(() => bookings.slice(0, 5), [bookings]);
  const oldestDelay = useMemo(() => (
    bookings.reduce((max, booking) => Math.max(max, getDelayDays(booking.scheduledDate)), 0)
  ), [bookings]);

  if (loading) {
    return (
      <Card className="border border-amber-200 bg-amber-50/80 p-5">
        <div className="h-20 animate-pulse rounded-xl bg-white/70" />
      </Card>
    );
  }

  if (visibleBookings.length === 0) return null;

  return (
    <Card className="border border-amber-200 bg-amber-50/80 p-5 shadow-xs">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-amber-200 bg-white text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-900">
              Delayed Bookings
            </h3>
            <p className="mt-1 text-xs font-semibold text-amber-800">
              {bookings.length} booking{bookings.length === 1 ? '' : 's'} crossed the scheduled date without completion or cancellation.
              {oldestDelay > 0 ? ` Oldest delay: ${oldestDelay} day${oldestDelay === 1 ? '' : 's'}.` : ''}
            </p>
          </div>
        </div>
        <Link
          href="/admin/bookings"
          className="inline-flex w-fit items-center justify-center rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-black uppercase tracking-wide text-amber-700 transition hover:bg-amber-100"
        >
          Review queue
        </Link>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
        {visibleBookings.map((booking) => {
          const bookingId = booking.bookingId || booking.bookingid || booking._id;
          const delayDays = getDelayDays(booking.scheduledDate);
          const schedule = getBookingSchedule(booking);
          return (
            <Link
              key={bookingId}
              href={`/admin/bookings/${encodeURIComponent(bookingId)}`}
              className="block min-w-0 rounded-xl border border-amber-200 bg-white/85 p-3 transition hover:border-amber-400 hover:bg-white"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-black text-text-primary">{booking.customerName || 'Customer'}</h4>
                  <p className="mt-1 truncate text-[11px] font-semibold text-text-tertiary">{bookingId}</p>
                </div>
                <span className="shrink-0 rounded-md bg-amber-100 px-2 py-1 text-[10px] font-black uppercase text-amber-700">
                  {delayDays}d late
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 text-[11px] font-bold text-amber-800">
                <span className="truncate">{booking.status?.replaceAll('_', ' ')}</span>
                <span className="shrink-0 uppercase">{schedule.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

function TodayActionBookings({ bookings, loading }) {
  const now = useLiveNow();
  const visibleBookings = useMemo(() => bookings.slice(0, 4), [bookings]);

  return (
    <Card className="xl:col-span-5 border border-bg-border/60 bg-bg-card p-5 glass">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-text-primary">
            Today Action Orders
          </h3>
          <p className="mt-1 text-[11px] font-semibold text-text-tertiary">
            Scheduled shifts requiring admin action today
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/15 bg-primary/10 px-2.5 py-1.5 text-xs font-black text-primary">
          <TimerReset className="h-3.5 w-3.5" />
          {bookings.length}
        </span>
      </div>

      {loading ? (
        <div className="mt-4 space-y-2">
          {[0, 1, 2].map((item) => <div key={item} className="h-[66px] animate-pulse rounded-xl bg-bg-section" />)}
        </div>
      ) : visibleBookings.length === 0 ? (
        <div className="mt-4 grid min-h-[214px] place-items-center rounded-2xl border border-dashed border-bg-border bg-bg-section px-4 text-center text-sm font-semibold text-text-secondary">
          No action bookings scheduled for today.
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {visibleBookings.map((booking) => {
            const bookingId = booking.bookingId || booking.bookingid || booking._id;
            const schedule = getBookingSchedule(booking);
            const remaining = getRemainingTime(schedule.date, now);
            return (
              <Link
                key={bookingId}
                href={`/admin/bookings/${encodeURIComponent(bookingId)}`}
                className="block rounded-xl border border-bg-border bg-bg-section/80 p-3 transition hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-sm font-black text-text-primary">{booking.customerName || 'Customer'}</h4>
                      <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-black uppercase text-text-tertiary">{booking.status?.replaceAll('_', ' ')}</span>
                    </div>
                    <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] font-semibold text-text-tertiary">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{booking.pickupLocation?.city || booking.pickupLocation?.address || 'Pickup pending'}</span>
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-sm font-black text-primary">{remaining.label}</p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase text-text-tertiary">{schedule.label}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function useLiveNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getBookingSchedule(booking) {
  const dateKey = booking.scheduledDate || toDateKey(new Date());
  const slot = String(booking.timeSlot || '').toLowerCase();
  const slotTime = {
    morning: '09:00',
    afternoon: '13:00',
    evening: '17:00',
  }[slot] || (/^\d{1,2}:\d{2}/.test(slot) ? slot : '09:00');
  const date = new Date(`${dateKey}T${slotTime.slice(0, 5)}:00`);
  const label = slot ? slot.replaceAll('_', ' ') : '09:00';
  return { date, label };
}

function getRemainingTime(target, now) {
  const diff = target.getTime() - now.getTime();
  const absolute = Math.abs(diff);
  const hours = Math.floor(absolute / 3600000);
  const minutes = Math.floor((absolute % 3600000) / 60000);
  const seconds = Math.floor((absolute % 60000) / 1000);
  const value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return { label: diff >= 0 ? value : `-${value}` };
}

function getDelayDays(dateKey) {
  if (!dateKey) return 0;
  const scheduled = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(scheduled.getTime())) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  scheduled.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((today.getTime() - scheduled.getTime()) / 86400000));
}

function ServiceAnalysis({ stats, loading }) {
  const services = stats?.serviceBreakdown || [];
  const total = services.reduce((sum, item) => sum + Number(item.bookings || 0), 0);
  const topService = services[0];

  return (
    <Card className="p-6 bg-bg-card border border-bg-border/60 glass">
      <div className="flex flex-col gap-1 text-left sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            Service Analysis
          </h3>
          <span className="text-[10px] text-text-tertiary">
            Service-wise booking count and share from live backend data
          </span>
        </div>
        {topService && (
          <span className="mt-2 inline-flex w-fit items-center gap-2 rounded-lg border border-primary/15 bg-primary/10 px-3 py-2 text-xs font-bold text-primary sm:mt-0">
            <Activity className="h-3.5 w-3.5" />
            Top: {topService.label || topService.serviceType}
          </span>
        )}
      </div>

      {loading ? (
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-2xl border border-bg-border bg-bg-section" />
          ))}
        </div>
      ) : services.length === 0 || total === 0 ? (
        <div className="mt-5 flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-bg-border bg-bg-section px-5 text-center text-sm font-semibold text-text-secondary">
          No completed, confirmed, pending, or in-progress business bookings counted yet.
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {services.map((service) => {
            const count = Number(service.bookings || 0);
            const percent = total ? Math.round((count / total) * 100) : 0;
            return (
              <article key={service.serviceType || service.label} className="rounded-2xl border border-bg-border bg-bg-section/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-black text-text-primary">
                      {service.label || service.serviceType}
                    </h4>
                    <p className="mt-1 text-[11px] font-semibold text-text-tertiary">
                      {count} booking{count === 1 ? '' : 's'}
                    </p>
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
                    <BarChart3 className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-[11px] font-bold text-text-secondary">
                    <span>Share</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-bg-border">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(percent, 4)}%` }} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function StatSkeleton() {
  return (
    <Card className="h-[116px] animate-pulse border-bg-border bg-bg-card/65 p-5">
      <div className="h-3 w-28 rounded bg-bg-muted" />
      <div className="mt-5 h-8 w-16 rounded bg-bg-muted" />
      <div className="mt-4 h-3 w-36 rounded bg-bg-muted" />
    </Card>
  );
}

function ChartSkeleton({ compact = false }) {
  return (
    <div className={`grid ${compact ? 'h-64' : 'h-64'} animate-pulse place-items-center rounded-2xl border border-bg-border bg-bg-section`}>
      <div className="h-10 w-32 rounded bg-bg-muted" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border border-bg-border bg-white p-4">
      {[0, 1, 2, 3, 4].map((item) => (
        <div key={item} className="grid animate-pulse grid-cols-4 gap-4 rounded-lg bg-bg-section p-4">
          <div className="h-4 rounded bg-bg-muted" />
          <div className="h-4 rounded bg-bg-muted" />
          <div className="h-4 rounded bg-bg-muted" />
          <div className="h-4 rounded bg-bg-muted" />
        </div>
      ))}
    </div>
  );
}
