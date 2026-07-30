'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import Spinner from '@/components/ui/Spinner';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { useThemeStore } from '@/store/themeStore';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, checkSession } = useAdminAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isLoginPage = pathname === '/admin/login';
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const applyPublicTheme = useThemeStore((state) => state.applyTheme);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('admin-root');
    return () => {
      document.documentElement.classList.remove('admin-root');
      applyPublicTheme(useThemeStore.getState().theme);
    };
  }, [applyPublicTheme]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (status === 'unauthenticated' && !isLoginPage) router.replace('/admin/login');
    if (status === 'authenticated' && isLoginPage) router.replace('/admin/dashboard');
  }, [status, isLoginPage, router]);

  if (isLoginPage) return <div className="admin-theme">{children}</div>;

  if (status !== 'authenticated') {
    return (
      <div className="loader-theme-bg grid min-h-screen place-items-center">
        <div className="flex flex-col items-center gap-3 text-sm font-bold text-orange-600">
          <Spinner size="lg" />
          Verifying secure admin session...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-theme flex h-screen overflow-hidden bg-sky-50 text-slate-900">
      <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className="flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
        <AdminHeader onToggleSidebar={() => setSidebarOpen((open) => !open)} />
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_top_right,_#dff4ff_0,_#f0f9ff_34%,_#f8fcff_70%)] p-4 md:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
