// src/components/layout/AdminHeader.jsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight, ArrowLeft, Bell, Clock, Menu } from 'lucide-react';
import { cn } from '@tithi/utils/utils';
import { useInAppNotificationSummary } from '@/hooks/useAdmin';

export default function AdminHeader({ onToggleSidebar }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: alertSummary } = useInAppNotificationSummary();
  const todayKey = toDateKey(new Date());

  // Extract breadcrumbs from path
  const paths = pathname.split('/').filter(Boolean);
  
  // Format breadcrumb item labels
  const getBreadcrumbLabel = (path) => {
    if (path === 'admin') return 'Admin';
    if (path === 'dashboard') return 'Dashboard';
    if (path === 'bookings') return 'Bookings';
    if (path === 'pricing') return 'Pricing Manager';
    if (path === 'booking-pricing') return 'Booking Pricing';
    if (path === 'items') return 'Items Manager';
    if (path === 'addons') return 'Add-on Services';
    if (path === 'users') return 'Users';
    if (path === 'analytics') return 'Analytics';
    if (path === 'messaging') return 'Messaging';
    if (path === 'faq') return 'FAQ Manager';
    if (path === 'contacts') return 'Contact Queries';
    if (path === 'settings') return 'Settings';
    // If it's an ID
    if (path.startsWith('TPM') || path.startsWith('b') || !isNaN(path.charAt(0))) {
      return `Detail: ${path}`;
    }
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const isSubpage = paths.length > 2;

  return (
    <header className="h-16 min-h-16 shrink-0 border-b border-sky-100 bg-white/90 backdrop-blur-xl flex items-center justify-between px-4 md:px-7 sticky top-0 z-10">
      {/* Left Section: Breadcrumbs */}
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded bg-bg-elevated hover:bg-bg-border border border-bg-border text-text-secondary hover:text-text-primary transition-colors focus:outline-none shrink-0"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        {isSubpage && (
          <button
            onClick={() => router.back()}
            className="p-1 rounded bg-bg-elevated hover:bg-bg-border border border-bg-border text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        
        <nav className="flex items-center gap-1.5 text-xs md:text-sm text-text-secondary">
          {paths.map((path, idx) => {
            const isLast = idx === paths.length - 1;
            const label = getBreadcrumbLabel(path);
            
            return (
              <React.Fragment key={path}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-text-tertiary" />}
                <span
                  className={cn(
                    "font-medium",
                    isLast ? "text-text-primary font-semibold" : "hover:text-text-primary transition-colors cursor-default"
                  )}
                >
                  {label}
                </span>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="hidden sm:flex items-center gap-2">
        <Link
          href="/messaging?view=unread"
          className="flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-[11px] font-bold text-sky-700 ring-1 ring-sky-100 transition hover:bg-sky-100 hover:text-sky-900"
          title="View unread notifications"
        >
          <Bell className="h-3.5 w-3.5" /> {alertSummary?.unreadCount || 0} Unread
        </Link>
        <Link
          href={`/bookings?scheduledDate=${todayKey}&view=today-scheduled`}
          className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100 hover:text-emerald-900"
          title="View today's scheduled bookings"
        >
          Today {alertSummary?.todayBookings?.length || 0}
        </Link>
        <Link
          href="/bookings?upcomingMinutes=60&view=next-hour"
          className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700 ring-1 ring-amber-100 transition hover:bg-amber-100 hover:text-amber-900"
          title="View bookings due in the next hour"
        >
          <Clock className="h-3.5 w-3.5" /> Next 1h {alertSummary?.upcomingBookings?.length || 0}
        </Link>
      </div>
    </header>
  );
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
