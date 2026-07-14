// src/components/layout/Providers.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QueryClientProvider } from '@tanstack/react-query';
import { enableQueryPersistence, queryClient } from '@/lib/queryClient';
import { getItemCatalog } from '@/lib/itemApi';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Toast from '@/components/ui/Toast';
import { useThemeStore } from '@/store/themeStore';
import { useLanguageStore } from '@/store/languageStore';
import { useBookingStore } from '@/store/bookingStore';

export default function Providers({ children }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { initializeTheme } = useThemeStore();
  const { initializeLanguage } = useLanguageStore();

  useEffect(() => {
    let active = true;
    const boot = async () => {
      initializeTheme();
      initializeLanguage();
      const cleanupPersistence = enableQueryPersistence();
      try {
        await useBookingStore.persist.rehydrate();
      } catch {
        useBookingStore.persist.clearStorage();
      }
      if (active) setMounted(true);
      return cleanupPersistence;
    };

    let cleanupPersistence = () => {};
    void boot().then((cleanup) => {
      cleanupPersistence = cleanup || cleanupPersistence;
    });

    return () => {
      active = false;
      cleanupPersistence();
    };
  }, [initializeTheme, initializeLanguage]);

  useEffect(() => {
    // Warm the three main booking routes as soon as the browser is idle so
    // service-card and navbar clicks feel immediate.
    const prefetchServices = () => {
      router.prefetch('/book/local-shifting');
      router.prefetch('/book/intercity-moving');
      router.prefetch('/book/labour-service');
      router.prefetch('/about');
      router.prefetch('/contact');
      router.prefetch('/my-bookings');
      void queryClient.prefetchQuery({ queryKey: ['items', 'catalog', {}], queryFn: () => getItemCatalog({}), staleTime: 5 * 60 * 1000 });
    };
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(prefetchServices);
      return () => window.cancelIdleCallback(idleId);
    }
    prefetchServices();
  }, [router]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-bg-page text-text-primary">
        <div className="h-16 w-full border-b border-bg-border/60 bg-bg-page/80" />
        <main className="grid flex-1 place-items-center px-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm font-bold text-text-secondary">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {/* Toast Alert overlay */}
      <Toast />

      {/* Main sticky navigation */}
      <Navbar />

      {/* Children pages */}
      <div className="flex-1 w-full">
        {children}
      </div>

      {/* Main footer */}
      <Footer />
    </QueryClientProvider>
  );
}
