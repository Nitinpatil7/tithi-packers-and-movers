'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, CheckCircle, Truck } from 'lucide-react';
import { cn } from '@utils/utils';

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
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }, [currentStep, prefersReducedMotion]);

  return (
    <div className="booking-layout-shell min-h-screen bg-gradient-to-b from-sky-50 via-bg-page to-white pt-24 pb-24 sm:pt-28">
      <div className="absolute top-0 left-0 right-0 h-72 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="booking-flow-bg pointer-events-none absolute inset-x-0 top-16 h-64" />
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {showBackButton && (
          <div className="mb-2 flex items-center max-w-6xl mx-auto min-h-7 sm:mb-3 sm:min-h-8">
            <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-bold text-text-secondary hover:text-primary transition-colors group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back
            </button>
          </div>
        )}

        <div className="booking-steps-panel relative overflow-hidden rounded-2xl border border-sky-100 bg-white/95 p-2.5 shadow-sm backdrop-blur mb-3 w-full max-w-6xl mx-auto sm:p-4 sm:mb-5">
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
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
              {steps.map((step, idx) => {
                const isActive = idx === currentStep;
                const isCompleted = idx < currentStep;
                return (
                  <React.Fragment key={step}>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className={cn('w-7 h-7 rounded-xl font-bold flex items-center justify-center text-[11px] border transition-all duration-300 sm:h-8 sm:w-8 sm:text-xs', isActive ? 'bg-primary text-white border-primary shadow-sky-sm scale-105' : isCompleted ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-bg-section border-bg-border text-text-tertiary')}>
                        {isCompleted ? <CheckCircle className="w-4 h-4 text-white" /> : <span>{idx + 1}</span>}
                      </div>
                      <span className={cn('max-w-[76px] truncate text-[11px] font-bold transition-all duration-300 sm:max-w-none sm:text-xs', isActive ? 'text-primary scale-102' : isCompleted ? 'text-emerald-600 font-bold' : 'text-text-tertiary')}>{step}</span>
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

        <div ref={contentTopRef} className="booking-content-panel w-full max-w-6xl mx-auto overflow-hidden rounded-[1.35rem] border border-sky-100 bg-white shadow-[0_20px_60px_rgba(14,165,233,0.10)] sm:rounded-3xl">
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} variants={slideVariants} initial="initial" animate="animate" exit="exit" className="p-4 sm:p-6 md:p-10">
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export { BookingLayout };
