'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock3, Sparkles } from 'lucide-react';

export default function ServiceComingSoon({ serviceName = 'This service' }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-hero-gradient px-4 pb-16 pt-28 sm:px-6">
      <div className="absolute inset-0 pattern-dots opacity-50" />
      <motion.section
        className="relative z-10 mx-auto max-w-3xl overflow-hidden rounded-3xl border border-sky-100 bg-white/95 p-6 text-center shadow-[0_24px_70px_rgba(14,165,233,0.16)] sm:p-10"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="mx-auto grid h-20 w-20 place-items-center rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-orange-50 text-primary shadow-sky"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Clock3 className="h-9 w-9" strokeWidth={1.8} />
        </motion.div>
        <p className="mt-6 inline-flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-[0.18em] text-primary">
          <Sparkles className="h-3.5 w-3.5" /> {serviceName}
        </p>
        <h1 className="mt-2 text-3xl font-black text-text-primary sm:text-4xl" style={{ fontFamily: 'var(--font-heading)' }}>Coming Soon</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-6 text-text-secondary">
          This booking option is currently paused. Please choose another active service or check back shortly.
        </p>
        <Link href="/" className="btn-sky mt-7 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black">
          <ArrowLeft className="h-4 w-4" /> Back to services
        </Link>
      </motion.section>
    </main>
  );
}
