'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Coins, LineChart, Sparkles, TrendingUp } from 'lucide-react';
import { useAdminAnalyticsOverview, useAdminStats } from '@/hooks/useAdmin';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

const BookingLineChart = dynamic(() => import('@/components/admin/BookingLineChart'), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center text-text-tertiary">Loading chart...</div>,
});

export default function AdminAnalyticsPage() {
  const { data: dashboard, isLoading: loadingDashboard } = useAdminStats();
  const { data: overview, isLoading: loadingOverview } = useAdminAnalyticsOverview();

  if (loadingDashboard || loadingOverview) {
    return <div className="min-h-[70vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  const popularity = overview?.servicePopularityBreakdown || [];
  const growth = overview?.revenueGrowth30Days || {};

  return <div className="flex flex-col gap-6 text-left pb-12">
    <div>
      <h1 className="text-2xl font-black text-text-primary">Business Analytics</h1>
      <p className="text-xs text-text-secondary mt-0.5">Live booking analytics from backend aggregation.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Metric icon={Coins} label="Estimated Revenue" value={formatCurrency(overview?.estimatedRevenue || 0)} />
      <Metric icon={LineChart} label="Average Booking Value" value={formatCurrency(overview?.averageBookingValue || 0)} />
      <Metric icon={Sparkles} label="Highest Demand Service" value={overview?.highestDemandService?.label || 'Not available'} />
      <Metric icon={TrendingUp} label="30 Day Growth" value={`${growth.growthPercentage || 0}%`} />
    </div>

    <Card className="p-6 bg-bg-card border border-bg-border/60 glass flex flex-col gap-4">
      <div className="flex flex-col text-left">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Daily Booking Frequency</h3>
        <span className="text-[10px] text-text-tertiary">Last 30 days from active business bookings</span>
      </div>
      <BookingLineChart data={dashboard?.dailyBookings || []} />
    </Card>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-5 bg-bg-card border border-bg-border/60 glass text-left">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-4 border-b border-bg-border/60 pb-2">Service Popularity</h3>
        <div className="flex flex-col gap-3">
          {popularity.length === 0 ? <p className="text-sm text-text-secondary">No service analytics yet.</p> : popularity.map((item) => <div key={item.serviceType} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center gap-3 text-xs">
              <Badge variant="service" type={item.serviceType} />
              <span className="font-mono text-text-primary font-bold">{item.bookings} bookings ({item.percentage}%)</span>
            </div>
            <div className="w-full h-1.5 bg-bg-border rounded-full overflow-hidden"><div className="h-full rounded-full bg-sky-500" style={{ width: `${Math.min(item.percentage || 0, 100)}%` }} /></div>
            <span className="text-[11px] text-text-secondary">{formatCurrency(item.estimatedRevenue || 0)} estimated</span>
          </div>)}
        </div>
      </Card>

      <Card className="p-5 bg-bg-card border border-bg-border/60 glass text-left">
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-4 border-b border-bg-border/60 pb-2">Revenue Window</h3>
        <div className="grid gap-3 text-sm">
          <Row label="Current 30 days" value={formatCurrency(growth.currentPeriodRevenue || 0)} />
          <Row label="Previous 30 days" value={formatCurrency(growth.previousPeriodRevenue || 0)} />
          <Row label="Total bookings counted" value={overview?.bookings || dashboard?.stats?.totalBookings || 0} />
        </div>
      </Card>
    </div>
  </div>;
}

function Metric({ icon: Icon, label, value }) {
  return <Card className="p-5 bg-bg-card/45 border border-bg-border/60 glass flex items-center gap-4">
    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0"><Icon className="w-5 h-5" /></div>
    <div className="flex flex-col text-left gap-0.5"><span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">{label}</span><span className="text-lg font-black text-text-primary">{value}</span></div>
  </Card>;
}

function Row({ label, value }) {
  return <div className="flex items-center justify-between rounded-xl bg-sky-50/70 px-4 py-3"><span className="font-semibold text-slate-600">{label}</span><span className="font-mono font-bold text-slate-900">{value}</span></div>;
}
