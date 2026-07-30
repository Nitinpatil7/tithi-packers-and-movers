'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Layers, ClipboardList, PhoneCall, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguageStore } from '@/store/languageStore';
import { PAGE_TRANSLATIONS } from '@/data/translations';

export default function HowItWorksSection() {
  const { language } = useLanguageStore();
  const t = PAGE_TRANSLATIONS[language] || PAGE_TRANSLATIONS['en'];

  const steps = [
    {
      num: '01',
      title: t.step1Title || 'Choose Your Service',
      desc: t.step1Desc || 'Select from Local Shifting, Intercity Moving, Commercial Relocation, or Packing Service to get started.',
      icon: Layers,
      color: '#1E88E5',
      bg: '#E3F2FD',
    },
    {
      num: '02',
      title: t.step2Title || 'Fill Moving Details',
      desc: t.step2Desc || 'Enter your pickup & drop addresses, preferred date and time, inventory checklist, and verify with OTP.',
      icon: ClipboardList,
      color: '#7B3FA0',
      bg: '#F3E5F5',
    },
    {
      num: '03',
      title: t.step3Title || 'Get Your Custom Quote',
      desc: t.step3Desc || 'Receive an instant estimation, or a detailed WhatsApp quote from our moving experts within 2 hours.',
      icon: PhoneCall,
      color: '#00897B',
      bg: '#E0F2F1',
    },
  ];

  return (
    <section className="theme-dark-flow py-20 md:py-32 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="flex flex-col items-center text-center mb-16 md:mb-20 gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label border-white/10 bg-white/10 text-white">
            <ArrowRight className="w-3.5 h-3.5" />
            {t.processLabel || 'Simple Process'}
          </span>
          <h2 className="text-display-md md:text-display-lg font-black text-white mt-2">
            {t.processTitle || 'Book Your Move in '}{' '}
            <span className="text-orange-500">{t.processTitleHighlight || '3 Simple Steps'}</span>
          </h2>
          <p className="text-lg text-white/80 max-w-xl leading-relaxed font-medium">
            {t.processSubhead || 'No long phone calls or back-and-forth negotiations. Start your stress-free move right now.'}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-7 relative">
          {/* Desktop connecting line */}
          <div className="hidden md:block process-connector absolute top-[64px] left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-1 rounded-full z-0">
            {/* Animated dash */}
            <div className="absolute top-0 left-0 right-0 h-full overflow-hidden">
              <div className="process-flow-light h-full w-1/3 bg-gradient-to-r from-transparent via-white to-transparent" />
              <div className="process-route-spark absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-orange-400 shadow-[0_0_18px_rgba(249,115,22,.55)]" />
            </div>
          </div>
          <div className="md:hidden process-connector absolute left-8 top-16 bottom-16 w-1 rounded-full z-0">
            <div className="process-flow-light h-20 w-full bg-gradient-to-b from-transparent via-white to-transparent" />
          </div>

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                className="flex flex-col items-center text-left md:text-center relative z-10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.18 }}
              >
                <motion.div
                  className="group grid w-full grid-cols-[96px_1fr] gap-4 rounded-3xl border border-white/10 bg-transparent p-0 text-white transition-all duration-300 active:scale-[.99] md:flex md:flex-col md:items-center md:p-4"
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {/* Step number + icon */}
                  <motion.div
                    className="process-step-aura relative mx-auto w-fit md:mb-6"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 3.4 + idx * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <div
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-4xl bg-orange-500 text-white shadow-[0_18px_45px_rgba(249,81,30,.28)] ring-1 ring-white/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_24px_60px_rgba(249,81,30,.42)]"
                    >
                      <Icon className="h-9 w-9 md:h-11 md:w-11 transition-colors" strokeWidth={1.7} />
                    </div>
                    <div
                      className="absolute -bottom-3 left-1/2 w-10 h-10 -translate-x-1/2 rounded-full flex items-center justify-center bg-white text-orange-500 text-sm font-black shadow-md ring-2 ring-white"
                    >
                      {step.num}
                    </div>
                  </motion.div>

                  <div className="min-w-0 md:w-full">
                    <h3 className="text-lg md:text-xl font-black text-white mb-2 md:mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-white/80 leading-relaxed font-medium">
                      {step.desc}
                    </p>

                    {idx === 0 && (
                      <Link href="/book/local-shifting">
                        <div
                          className="inline-flex items-center gap-1 mt-5 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full bg-white text-orange-600 transition-all hover:bg-sky-900 hover:text-sky-200 hover:shadow-sm"
                        >
                          {t.startHere || 'Start Here'} <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </Link>
                    )}
                  </div>
                </motion.div>

                {/* Mobile arrow connector */}
                {idx < steps.length - 1 && (
                  <div className="md:hidden flex items-center justify-center my-4">
                    <ArrowRight className="w-6 h-6 rotate-90 text-orange-500" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
