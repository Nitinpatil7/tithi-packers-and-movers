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
    <section className="py-24 md:py-32 bg-bg-section relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-bg-border to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="flex flex-col items-center text-center mb-16 md:mb-20 gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">
            <ArrowRight className="w-3.5 h-3.5" />
            {t.processLabel || 'Simple Process'}
          </span>
          <h2 className="text-display-md md:text-display-lg font-black text-text-primary mt-2">
            {t.processTitle || 'Book Your Move in '}{' '}
            <span className="gradient-text">{t.processTitleHighlight || '3 Simple Steps'}</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-xl leading-relaxed font-medium">
            {t.processSubhead || 'No long phone calls or back-and-forth negotiations. Start your stress-free move right now.'}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
          {/* Desktop connecting line */}
          <div className="hidden md:block absolute top-[52px] left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-0.5 z-0">
            <div className="h-full bg-gradient-to-r from-service-local via-service-intercity to-service-packing opacity-30" />
            {/* Animated dash */}
            <div className="absolute top-0 left-0 right-0 h-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-transparent via-primary/60 to-transparent w-1/3 animate-shimmer" />
            </div>
          </div>

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                className="flex flex-col items-center text-center relative z-10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.18 }}
              >
                <motion.div
                  className="bg-white rounded-3xl p-8 border border-bg-border shadow-card hover:shadow-md w-full transition-all duration-300"
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {/* Step number + icon */}
                  <div className="relative mb-6 mx-auto w-fit">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-sm"
                      style={{ backgroundColor: step.bg }}
                    >
                      <Icon className="h-7 w-7 text-primary" strokeWidth={1.7} />
                    </div>
                    <div
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shadow-md"
                      style={{ backgroundColor: step.color }}
                    >
                      {step.num}
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-text-primary mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed font-medium">
                    {step.desc}
                  </p>

                  {idx === 0 && (
                    <Link href="/book/local-shifting">
                      <div
                        className="inline-flex items-center gap-1 mt-5 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all hover:shadow-sm"
                        style={{ backgroundColor: step.bg, color: step.color }}
                      >
                        {t.startHere || 'Start Here'} →
                      </div>
                    </Link>
                  )}
                </motion.div>

                {/* Mobile arrow connector */}
                {idx < steps.length - 1 && (
                  <div className="md:hidden flex items-center justify-center my-4">
                    <ArrowRight className="w-6 h-6 rotate-90 text-text-tertiary" />
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
