// src/components/layout/Providers.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient, enableQueryPersistence } from '@lib/queryClient';
import Toast from '@ui/Toast';
import { useThemeStore } from '@store/themeStore';
import { useBookingStore } from '@store/bookingStore';

export default function Providers({ children }) {
  const [queryClient] = useState(() => createQueryClient());
  const router = useRouter();
  const pathname = usePathname();
  const { initializeTheme } = useThemeStore();
  const appName = process.env.NEXT_PUBLIC_TITHI_APP || 'website';

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  useEffect(() => {
    let cancelled = false;
    let cleanupPersistence = () => {};
    let idleId;
    let timer;

    const hydrateDeferredState = () => {
      if (cancelled) return;
      cleanupPersistence = enableQueryPersistence(queryClient);

      const isAdminRoute = appName === 'admin' || window.location.pathname.startsWith('/admin');
      if (isAdminRoute) return;

      try {
        void useBookingStore.persist.rehydrate().catch(() => {
          useBookingStore.persist.clearStorage();
        });
      } catch {
        useBookingStore.persist.clearStorage();
      }
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(hydrateDeferredState, { timeout: 1600 });
    } else if (typeof window !== 'undefined') {
      timer = window.setTimeout(hydrateDeferredState, 0);
    }

    return () => {
      cancelled = true;
      if (idleId) window.cancelIdleCallback(idleId);
      if (timer) window.clearTimeout(timer);
      cleanupPersistence();
    };
  }, [queryClient]);

  useEffect(() => {
    // Warm the three main booking routes as soon as the browser is idle so
    // service-card and navbar clicks feel immediate.
    const prefetchServices = () => {
      if (appName !== 'website' || pathname?.startsWith('/admin') || pathname?.startsWith('/monitoring')) return;
      [
        '/book/local-shifting',
        '/book/intercity-moving',
        '/book/labour-service',
        '/book/commercial-moving',
        '/book/ordinary-service',
        '/about',
        '/contact',
        '/my-bookings',
      ].forEach((route) => router.prefetch(route));
    };
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(prefetchServices, { timeout: 450 });
      return () => window.cancelIdleCallback(idleId);
    }
    const timer = window.setTimeout(prefetchServices, 250);
    return () => window.clearTimeout(timer);
  }, [appName, pathname, router]);

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
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Toast Alert overlay */}
      <Toast />

      {/* Children pages */}
      <div className="flex-1 w-full">
        {children}
      </div>
    </QueryClientProvider>
  );
}

