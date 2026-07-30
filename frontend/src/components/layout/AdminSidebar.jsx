import React, { useEffect } from 'react';
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
import { cn } from '@/lib/utils';

const adminLinks = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'All Bookings', path: '/admin/bookings', icon: CalendarRange },
  { name: 'Items Manager', path: '/admin/items', icon: Boxes },
  { name: 'Add-on Services', path: '/admin/addons', icon: Puzzle },
  { name: 'Booking Pricing', path: '/admin/booking-pricing', icon: BadgeIndianRupee },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { name: 'Messaging', path: '/admin/messaging', icon: MessageSquare },
  { name: 'FAQ Manager', path: '/admin/faq', icon: CircleHelp },
  { name: 'Legal Pages', path: '/admin/legal-pages', icon: Scale },
  { name: 'Testimonials', path: '/admin/testimonials', icon: MessageSquareQuote },
  { name: 'Contact Queries', path: '/admin/contacts', icon: MessagesSquare },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAdminAuthStore((state) => state.logout);

  useEffect(() => {
    if (onClose) onClose();
  }, [pathname, onClose]);

  const handleLogout = async () => {
    await logout();
    router.replace('/admin/login');
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
        "fixed md:sticky top-0 left-0 h-screen z-40 transition-transform duration-300 md:translate-x-0 shrink-0",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        "w-64 md:w-20 lg:w-64 overflow-hidden bg-white border-r border-sky-100 flex flex-col shadow-[8px_0_30px_rgba(14,165,233,0.06)]"
      )}>
        {/* Top Section */}
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Sidebar Brand */}
          <div className="p-4 md:p-6 border-b border-sky-100 flex items-center justify-center lg:justify-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 shadow-md shadow-sky-200 flex items-center justify-center font-black text-white tracking-wider shrink-0">
              T
            </div>
            <div className="flex md:hidden lg:flex flex-col">
              <span className="font-bold text-sm tracking-wider text-slate-900">
                TITHI ADMIN
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider text-sky-600">
                Control Panel
              </span>
            </div>
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
                  prefetch={false}
                  className={cn(
                    "flex items-center justify-start gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-all group relative",
                    isActive 
                      ? "bg-sky-50 text-sky-700 shadow-sm ring-1 ring-sky-100" 
                      : "text-slate-500 hover:text-sky-700 hover:bg-sky-50/70"
                  )}
                >
                  <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-sky-600" : "text-slate-400 group-hover:text-sky-600")} />
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
          <Link
            href="/"
            prefetch={false}
            className="flex items-center justify-start gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated/40 group relative"
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="inline md:hidden lg:inline">Public Site</span>
            <span className="hidden md:block lg:hidden absolute left-full ml-4 px-2 py-1 bg-bg-elevated text-xs text-text-primary border border-bg-border rounded opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap">
              Public Site
            </span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 group relative focus:outline-none"
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
