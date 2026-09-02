'use client';

import React, { useEffect, useState } from 'react';
import { useBookingStore } from '@tithi/store/bookingStore';

export default function BookingRoutesLayout({ children }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve(useBookingStore.persist.rehydrate())
      .catch(() => {
        useBookingStore.persist.clearStorage();
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });

    const unsubscribe = useBookingStore.persist.onFinishHydration?.(() => {
      if (!cancelled) setHydrated(true);
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center bg-hero-gradient px-4 pt-24">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-sky-100 bg-white/90 px-8 py-7 text-center shadow-card">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-sm font-black text-text-primary">Restoring your booking...</p>
        </div>
      </div>
    );
  }

  return children;
}
