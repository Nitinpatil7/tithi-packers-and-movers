import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  CalendarRange, 
  Boxes, 
  BadgeIndianRupee,
  Puzzle,
  Users, 
  BarChart3, 
  MessageSquare, 
  CircleHelp,
  Scale,
  MessagesSquare,
  MessageSquareQuote,
  Settings,
  Home,
  LogOut
} from 'lucide-react';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { useSiteSetting } from '@tithi/hooks/useSiteSetting';
import { cn } from '@tithi/utils/utils';
import { resolveSiteAssetUrl } from '@tithi/utils/siteAssets';

const adminLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'All Bookings', path: '/bookings', icon: CalendarRange },
  { name: 'Items Manager', path: '/items', icon: Boxes },
  { name: 'Add-on Services', path: '/addons', icon: Puzzle },
  { name: 'Booking Pricing', path: '/booking-pricing', icon: BadgeIndianRupee },
  { name: 'Users', path: '/users', icon: Users },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Messaging', path: '/messaging', icon: MessageSquare },
  { name: 'FAQ Manager', path: '/faq', icon: CircleHelp },
  { name: 'Legal Pages', path: '/legal-pages', icon: Scale },
  { name: 'Testimonials', path: '/testimonials', icon: MessageSquareQuote },
  { name: 'Contact Queries', path: '/contacts', icon: MessagesSquare },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const WEBSITE_URL = (process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAdminAuthStore((state) => state.logout);
  const { data: site = {} } = useSiteSetting();
  const logoSrc = resolveSiteAssetUrl(site.logoUrl);

  useEffect(() => {
    if (onClose) onClose();
  }, [pathname, onClose]);

  useEffect(() => {
    const warmAdminRoutes = () => {
      adminLinks.forEach((link) => router.prefetch(link.path));
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(warmAdminRoutes, { timeout: 1200 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timer = window.setTimeout(warmAdminRoutes, 0);
    return () => window.clearTimeout(timer);
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/30 z-30 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed top-0 bottom-0 left-0 md:sticky md:top-0 md:bottom-auto h-screen z-40 transition-transform duration-300 md:translate-x-0 shrink-0",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        "w-64 md:w-20 lg:w-64 overflow-hidden bg-white border-r border-sky-100 flex flex-col shadow-[8px_0_30px_rgba(14,165,233,0.06)]"
      )}>
        {/* Top Section */}
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Sidebar Brand */}
          <div className="p-4 md:p-6 border-b border-sky-100 flex items-center justify-start md:justify-center lg:justify-start gap-3">
            {logoSrc && (
              <Image
                unoptimized
                src={logoSrc}
                alt={site.companyName || 'Company logo'}
                width={140}
                height={44}
                className="h-10 w-auto max-w-[150px] shrink-0 object-contain md:h-11 md:max-w-[44px] lg:max-w-[150px]"
              />
            )}
          </div>

          {/* Links Navigation */}
          <nav className="admin-sidebar-scroll mt-4 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain p-2 pb-5 md:p-4 md:pb-5">
            {adminLinks.map((link) => {
              const isActive = pathname === link.path || pathname.startsWith(link.path + '/');
              const Icon = link.icon;
              
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={cn(
                    "flex items-center justify-start gap-3 rounded-xl px-3.5 py-3 text-sm font-bold transition-all group relative md:justify-center md:px-0 lg:justify-start lg:px-3.5",
                    isActive 
                      ? "bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-100" 
                      : "text-slate-500 hover:text-sky-700 hover:bg-sky-50/70"
                  )}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl md:h-10 md:w-10 lg:h-auto lg:w-auto">
                    <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-sky-600" : "text-slate-400 group-hover:text-sky-600")} />
                  </span>
                  <span className="inline md:hidden lg:inline">{link.name}</span>
                  
                  {/* Tooltip for collapsed view */}
                  <span className="hidden md:block lg:hidden absolute left-full ml-4 px-2 py-1 bg-bg-elevated text-xs text-text-primary border border-bg-border rounded opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap shadow-lg">
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="shrink-0 border-t border-bg-border bg-white p-2 md:p-4 flex flex-col gap-1.5">
          <a
            href={WEBSITE_URL}
            className="flex items-center justify-start gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated/40 group relative md:justify-center md:px-0 lg:justify-start lg:px-3"
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="inline md:hidden lg:inline">Public Site</span>
            <span className="hidden md:block lg:hidden absolute left-full ml-4 px-2 py-1 bg-bg-elevated text-xs text-text-primary border border-bg-border rounded opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap">
              Public Site
            </span>
          </a>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-start gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 group relative focus:outline-none md:justify-center md:px-0 lg:justify-start lg:px-3"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="inline md:hidden lg:inline">Logout</span>
            <span className="hidden md:block lg:hidden absolute left-full ml-4 px-2 py-1 bg-bg-elevated text-xs text-red-500 border border-bg-border rounded opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap">
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}

