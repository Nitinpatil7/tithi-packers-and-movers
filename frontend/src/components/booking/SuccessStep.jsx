'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Home, Search } from 'lucide-react';

export default function SuccessStep({ bookingId, returnTo = 'website', onReset }) {
  const router = useRouter();
  const [seconds, setSeconds] = useState(3);
  const targetPath = returnTo === 'admin' ? '/admin/bookings' : '/';

  useEffect(() => {
    import('canvas-confetti').then(({ default: confetti }) => {
      confetti({ particleCount: 120, spread: 85, origin: { y: 0.55 }, colors: ['#0EA5E9', '#38BDF8', '#10B981'] });
    }).catch(() => {});
    const goTarget = () => {
      onReset?.();
      try {
        router.replace(targetPath);
        window.setTimeout(() => {
          if (window.location.pathname !== targetPath) window.location.assign(targetPath);
        }, 700);
      } catch {
        window.location.assign(targetPath);
      }
    };
    const countdown = window.setInterval(() => setSeconds((value) => Math.max(value - 1, 0)), 1000);
    const redirect = window.setTimeout(goTarget, 3000);
    return () => { window.clearInterval(countdown); window.clearTimeout(redirect); };
  }, [onReset, router, targetPath]);

  return (
    <div className="flex flex-col items-center text-center gap-7 py-12 min-h-[420px] justify-center">
      <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 210, damping: 16 }} className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center">
        <CheckCircle2 className="w-14 h-14 text-emerald-500" />
      </motion.div>
      <div className="max-w-lg">
        <h2 className="text-3xl font-black text-text-primary mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Booking Confirmed</h2>
        <p className="text-lg text-text-secondary font-semibold">Our team will contact you soon.</p>
        {bookingId && <p className="mt-3 rounded-xl bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700">Booking ID: {bookingId}</p>}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {returnTo !== 'admin' && bookingId && <button onClick={() => router.push(`/my-bookings/${bookingId}`)} className="inline-flex items-center gap-2 rounded-xl border border-sky-100 bg-white px-5 py-3 text-sm font-semibold text-sky-700"><Search className="h-4 w-4" />Track booking</button>}
        <button onClick={() => { onReset?.(); router.push(targetPath); window.setTimeout(() => { if (window.location.pathname !== targetPath) window.location.assign(targetPath); }, 700); }} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white"><Home className="h-4 w-4" />{returnTo === 'admin' ? 'Back to bookings' : 'Back to home'}</button>
      </div>
      <p className="text-xs font-bold text-text-tertiary">Redirecting in {seconds} seconds...</p>
    </div>
  );
}

export { SuccessStep };
