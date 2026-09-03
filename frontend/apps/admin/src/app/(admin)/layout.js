'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import Spinner from '@tithi/ui/Spinner';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { useThemeStore } from '@tithi/store/themeStore';
import useAdminRealtime from '@/hooks/useAdminRealtime';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, checkSession } = useAdminAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isLoginPage = pathname === '/login';
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const applyPublicTheme = useThemeStore((state) => state.applyTheme);
  useAdminRealtime(status === 'authenticated' && !isLoginPage);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('admin-root');
    document.documentElement.style.colorScheme = 'only light';
    let colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
    if (!colorSchemeMeta) {
      colorSchemeMeta = document.createElement('meta');
      colorSchemeMeta.setAttribute('name', 'color-scheme');
      document.head.appendChild(colorSchemeMeta);
    }
    colorSchemeMeta.setAttribute('content', 'light');
    return () => {
      document.documentElement.classList.remove('admin-root');
      applyPublicTheme(useThemeStore.getState().theme);
    };
  }, [applyPublicTheme]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (status === 'unauthenticated' && !isLoginPage) router.replace('/login');
    if (status === 'authenticated' && isLoginPage) router.replace('/dashboard');
  }, [status, isLoginPage, router]);

  if (isLoginPage) return <div className="admin-theme">{children}</div>;

  if (status !== 'authenticated') {
    return (
      <div className="grid min-h-screen place-items-center bg-transparent">
        <div className="flex flex-col items-center gap-3 text-sm font-bold text-orange-600">
          <Spinner size="lg" />
          Verifying secure admin session...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-theme flex h-screen min-h-screen overflow-hidden bg-sky-50 text-slate-900 supports-[height:100dvh]:h-dvh supports-[height:100dvh]:min-h-dvh">
      <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader onToggleSidebar={() => setSidebarOpen((open) => !open)} />
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_top_right,_#dff4ff_0,_#f0f9ff_34%,_#f8fcff_70%)] p-4 pb-20 md:p-7 md:pb-24 lg:pb-28">
          {children}
        </main>
      </div>
    </div>
  );
}
