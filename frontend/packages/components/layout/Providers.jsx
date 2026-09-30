// src/components/layout/Providers.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient, enableQueryPersistence } from '@tithi/lib/queryClient';
import Toast from '@tithi/ui/Toast';
import { useThemeStore } from '@tithi/store/themeStore';
import DynamicSiteFavicon from './DynamicSiteFavicon';

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
          queryClient.invalidateQueries({ queryKey: ['addons', 'available'] });
        }
        if (event?.target === 'addon') {
          queryClient.invalidateQueries({ queryKey: ['addons', 'available'] });
          queryClient.invalidateQueries({ queryKey: ['admin', 'addons'] });
        }
        if (event?.target === 'faq') {
          queryClient.invalidateQueries({ queryKey: ['faqs'] });
        }
        if (event?.target === 'testimonial') {
          queryClient.invalidateQueries({ queryKey: ['testimonials'] });
          queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] });
        }
        if (event?.target === 'site-setting') {
          queryClient.invalidateQueries({ queryKey: ['site-setting'] });
        }
      });
      socket.on('pricing:updated', () => {
        queryClient.invalidateQueries({ queryKey: ['booking-pricing-rules'] });
        queryClient.invalidateQueries({ queryKey: ['booking-pricing-rule'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'booking-pricing-rules'] });
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

  useEffect(() => {
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
    if (!apiUrl || typeof window === 'undefined') return undefined;

    const sendEvent = (payload) => {
      const body = JSON.stringify({
        ...payload,
        path: window.location.pathname,
        referrer: document.referrer || '',
        userAgent: navigator.userAgent || '',
      });
      const url = `${apiUrl}/api/analytics-track`;
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        if (navigator.sendBeacon(url, blob)) return;
      }
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    };

    const pageViewKey = `tithi:last-page-view:${window.location.pathname}`;
    let lastPageView = 0;
    try {
      lastPageView = Number(sessionStorage.getItem(pageViewKey) || 0);
    } catch {
      // Browsers can block storage; analytics should never block rendering.
      lastPageView = 0;
    }
    if (Date.now() - lastPageView > 2000) {
      try {
        sessionStorage.setItem(pageViewKey, String(Date.now()));
      } catch {
        // Ignore storage failures and still send the page-view event.
      }
      sendEvent({ type: 'page_view' });
    }

    const handleClick = (event) => {
      const target = event.target?.closest?.('a,button,[role="button"]');
      if (!target) return;
      const label = target.getAttribute('aria-label') || target.textContent || target.getAttribute('href') || 'click';
      sendEvent({ type: 'click', label: label.trim().replace(/\s+/g, ' ').slice(0, 120) });
    };

    document.addEventListener('click', handleClick, { capture: true, passive: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Toast Alert overlay */}
      <Toast />
      <DynamicSiteFavicon />

      {/* Children pages */}
      <div className="flex-1 w-full">
        {children}
      </div>
    </QueryClientProvider>
  );
}

