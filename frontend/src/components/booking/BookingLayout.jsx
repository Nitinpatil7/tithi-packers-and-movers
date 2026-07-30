'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, CheckCircle, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BookingLayout({ title, steps = [], currentStep = 0, onBack, children }) {
  const contentTopRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const showBackButton = currentStep > 0 && currentStep < steps.length - 1;
  const slideVariants = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, x: -30, transition: { duration: 0.28, ease: 'easeIn' } },
  };

  useEffect(() => {
    const top = contentTopRef.current?.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: Math.max(0, top || 0), behavior: 'smooth' });
  }, [currentStep]);

  return (
    <div className="min-h-screen bg-bg-page pt-24 pb-16">
      <div className="absolute top-0 left-0 right-0 h-72 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="booking-flow-bg pointer-events-none absolute inset-x-0 top-16 h-64" />
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-4 flex items-center max-w-6xl mx-auto min-h-8">
            {showBackButton ? (
              <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-bold text-text-secondary hover:text-primary transition-colors group">
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back
              </button>
            ) : <div />}
        </div>

        <div className="relative overflow-hidden bg-white rounded-2xl border border-bg-border shadow-sm p-4 mb-5 w-full max-w-6xl mx-auto">
          <motion.div
            className="pointer-events-none absolute right-5 top-3 hidden h-10 w-28 items-center sm:flex"
            animate={prefersReducedMotion ? undefined : { x: [-8, 8, -8] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="absolute left-0 right-0 top-1/2 h-px border-t border-dashed border-sky-200" />
            <span className="relative ml-auto grid h-8 w-8 place-items-center rounded-xl bg-sky-950 text-sky-100 shadow-sm">
              <Truck className="h-4 w-4" strokeWidth={1.8} />
            </span>
          </motion.div>
          <div>
            <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
              {steps.map((step, idx) => {
                const isActive = idx === currentStep;
                const isCompleted = idx < currentStep;
                return (
                  <React.Fragment key={step}>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className={cn('w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs border transition-all duration-300', isActive ? 'bg-primary text-white border-primary shadow-sky-sm scale-105' : isCompleted ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-bg-section border-bg-border text-text-tertiary')}>
                        {isCompleted ? <CheckCircle className="w-4 h-4 text-white" /> : <span>{idx + 1}</span>}
                      </div>
                      <span className={cn('text-xs font-bold transition-all duration-300', isActive ? 'text-primary scale-102' : isCompleted ? 'text-emerald-600 font-bold' : 'text-text-tertiary')}>{step}</span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className="flex-1 min-w-[20px] h-0.5 bg-bg-border mx-2 relative rounded-full">
                        <div className={cn('absolute top-0 left-0 h-full transition-all duration-500', isCompleted ? 'w-full bg-emerald-500' : isActive ? 'w-1/2 bg-primary' : 'w-0 bg-transparent')} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        <div ref={contentTopRef} className="bg-white rounded-3xl border border-bg-border shadow-card overflow-hidden w-full max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} variants={slideVariants} initial="initial" animate="animate" exit="exit" className="p-8 md:p-10">
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export { BookingLayout };
