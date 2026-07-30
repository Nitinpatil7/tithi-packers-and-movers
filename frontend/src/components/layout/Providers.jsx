// src/components/layout/Providers.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QueryClientProvider } from '@tanstack/react-query';
import { enableQueryPersistence, queryClient } from '@/lib/queryClient';
import { getItemCatalog } from '@/lib/itemApi';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Spinner from '@/components/ui/Spinner';
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

  useEffect(() => {
    let socket;
    let cancelled = false;
    const connectRealtime = async () => {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
      if (!apiUrl || cancelled) return;
      const { io } = await import('socket.io-client');
      if (cancelled) return;
      socket = io(`${apiUrl}/content`, {
        transports: ['websocket'],
        withCredentials: true,
      });
      socket.on('content:changed', (event) => {
        if (event?.target === 'catalog') {
          queryClient.invalidateQueries({ queryKey: ['items'] });
          queryClient.invalidateQueries({ queryKey: ['admin', 'items'] });
        }
        if (event?.target === 'faq') {
          queryClient.invalidateQueries({ queryKey: ['faqs'] });
        }
        if (event?.target === 'testimonial') {
          queryClient.invalidateQueries({ queryKey: ['testimonials'] });
          queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] });
        }
      });
    };
    const start = () => { void connectRealtime(); };
    let idleId;
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) idleId = window.requestIdleCallback(start);
    else start();
    return () => {
      cancelled = true;
      if (idleId) window.cancelIdleCallback(idleId);
      socket?.disconnect();
    };
  }, []);

  if (!mounted) {
    return (
      <div className="loader-theme-bg flex min-h-screen w-full flex-col text-white">
        <div className="h-16 w-full border-b border-white/10 bg-white/5" />
        <main className="grid flex-1 place-items-center px-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <Spinner size="lg" />
            <p className="text-sm font-bold text-white/90">Loading...</p>
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
