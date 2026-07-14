// src/app/admin/dashboard/page.js
'use client';

import React from 'react';
import { 
  CalendarDays, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Award, 
  Users 
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
  
  // Fetch stats & bookings
  const { data: stats, isLoading: statsLoading } = useAdminStats(token);
  const { data: bookingsData, isLoading: bookingsLoading } = useAllBookings({}, token);

  const bookings = bookingsData?.bookings || [];

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-text-primary">Dashboard</h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Real-time metrics and relocation management for Surat.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          [0, 1, 2, 3].map((item) => <StatSkeleton key={item} />)
        ) : (
          <>
            <StatCard
              title="Today's Bookings"
              value={stats?.todayBookings || 0}
              icon={CalendarDays}
              color="primary"
            />
            <StatCard
              title="Pending Verification"
              value={stats?.pendingBookings || 0}
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
              title="Completed Relocations"
              value={stats?.completedThisMonth || 0}
              icon={CheckCircle}
              color="packing"
            />
          </>
        )}
      </div>

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
