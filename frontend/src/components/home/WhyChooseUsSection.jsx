'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Award, Compass, Truck, Users2, Zap, HeartHandshake, Star, Home, Map, ShieldCheck, ArrowRight } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { useLanguageStore } from '@/store/languageStore';
import { PAGE_TRANSLATIONS } from '@/data/translations';
import { useSiteSetting } from '@/hooks/useSiteSetting';

export default function WhyChooseUsSection() {
  const { language } = useLanguageStore();
  const t = PAGE_TRANSLATIONS[language] || PAGE_TRANSLATIONS['en'];
  const { data: site = {} } = useSiteSetting();
  const prefersReducedMotion = useReducedMotion();

  const stats = [
    { value: String(site.stats?.successfulMoves ?? 0), suffix: '+', label: t.happyRelocations || 'Happy Relocations', icon: Home, bg: '#E0F2FE' },
    { value: String(site.stats?.citiesCovered ?? 0), suffix: '+', label: t.citiesReached || 'Cities Reached', icon: Map, bg: '#FFF7ED' },
    { value: String(site.stats?.yearsExperience ?? 0), suffix: '+', label: t.yearsOfService || 'Years of Service', icon: Star, bg: '#ECFDF5' },
    { value: String(site.stats?.customerSatisfaction ?? 0), suffix: '%', label: t.safetyRating || 'Safety Rating', icon: ShieldCheck, bg: '#F0F9FF' },
  ];

  const benefits = [
    {
      title: t.expertTitle || 'Expert Trained Movers',
      desc: t.expertDesc || 'Our staff undergoes thorough training in handling delicate glassware, heavy furniture, and expensive electronics with care.',
      icon: Users2,
      color: '#1E88E5',
      bg: '#E3F2FD',
    },
    {
      title: t.gpsTitle || 'GPS Live Tracking',
      desc: t.gpsDesc || 'Stay informed at every step with real-time GPS coordinates and automated SMS updates directly to your mobile.',
      icon: Compass,
      color: '#7B3FA0',
      bg: '#F3E5F5',
    },
    {
      title: t.materialsTitle || 'Safe Packing Materials',
      desc: t.materialsDesc || 'We use multi-layer bubble wrap, moisture-resistant sheets, and heavy-duty corrugated boxes for maximum protection.',
      icon: Award,
      color: '#00897B',
      bg: '#E0F2F1',
    },
    {
      title: t.timeTitle || 'On-Time Guarantee',
      desc: t.timeDesc || 'Prompt scheduling. Our drivers choose optimized routes to complete transit within the planned timeline — or we compensate.',
      icon: Truck,
      color: '#F57C00',
      bg: '#FFF3E0',
    },
    {
      title: t.zeroTitle || 'Zero Hidden Charges',
      desc: t.zeroDesc || 'Full transparency from quote to final bill. What you see is what you pay — no surprises on moving day.',
      icon: Zap,
      color: '#F4511E',
      bg: '#FBE9E7',
    },
    {
      title: t.supportTitle || 'Dedicated Support',
      desc: t.supportDesc || 'A dedicated moving coordinator available from booking to delivery — call, WhatsApp, or chat any time.',
      icon: HeartHandshake,
      color: '#E91E63',
      bg: '#FCE4EC',
    },
  ];

  const [activeBenefit, setActiveBenefit] = useState(0);
  const active = benefits[activeBenefit] || benefits[0];
  const ActiveIcon = active.icon;

  return (
    <section className="why-choice-bg py-20 md:py-32 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-bg-border to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-orange-400/30 to-transparent" />
      <motion.div
        className="pointer-events-none absolute right-[8%] top-24 hidden text-sky-100 lg:block"
        animate={prefersReducedMotion ? undefined : { y: [0, -16, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ShieldCheck className="h-28 w-28" strokeWidth={1.1} />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute left-[6%] bottom-24 hidden text-orange-100 lg:block"
        animate={prefersReducedMotion ? undefined : { y: [0, 18, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Map className="h-24 w-24" strokeWidth={1.1} />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Title */}
        <motion.div
          className="flex flex-col items-center text-center mb-16 md:mb-20 gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">
            <Star className="w-3.5 h-3.5" />
            {language === 'gu' ? 'શા માટે પસંદ કરો' : language === 'hi' ? 'हमें क्यों चुनें' : 'Why Choose Us'}
          </span>
          <h2 className="text-display-md md:text-display-lg font-black text-text-primary mt-2">
            {t.whyTitle || 'Why Surat Families '}{' '}
            <span className="gradient-text">{t.whyTitleHighlight || 'Trust Tithi'}</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-xl leading-relaxed font-medium">
            {t.whySubhead || 'Delivering consistency, safety, and modern convenience to home movers across Gujarat and India.'}
          </p>
        </motion.div>

        {/* Stats Strip */}
        <div className="why-stats-strip relative mb-10 grid grid-cols-2 overflow-hidden rounded-[28px] border border-sky-100 bg-white/90 shadow-card backdrop-blur-sm md:mb-14 md:grid-cols-4">
          {stats.map((stat, idx) => {
            const StatIcon = stat.icon;
            return (
            <motion.div
              key={stat.label}
              className="relative min-h-[112px] border-sky-100 px-3 py-4 text-center odd:border-r md:min-h-[132px] md:border-r md:last:border-r-0 md:px-5"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <div className="group flex h-full flex-col items-center justify-center">
                <div className="icon-surface mb-2 h-9 w-9 rounded-xl md:mb-3 md:h-11 md:w-11">
                  <StatIcon className="h-4 w-4 md:h-5 md:w-5" strokeWidth={1.7} />
                </div>
                <div
                  className="mb-1 text-2xl font-black leading-none text-text-primary md:text-4xl"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[10px] font-semibold uppercase leading-tight tracking-wide text-text-secondary md:text-xs md:tracking-wider">
                  {stat.label}
                </div>
              </div>
            </motion.div>);
          })}
        </div>

        {/* Benefits Proof System */}
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
          <motion.div
            key={active.title}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            whileHover={{ y: -5, scale: 1.015, rotateX: 1, rotateY: -1.2 }}
            whileTap={{ scale: 0.995 }}
            className="group relative overflow-hidden rounded-[32px] border border-sky-100 bg-white/92 p-6 shadow-[0_26px_70px_rgba(3,105,161,.12)] backdrop-blur-sm transition-all duration-300 hover:border-sky-300 md:p-8"
          >
            <div className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-orange-100/60" />
            <div className="pointer-events-none absolute inset-0 services-panel-route opacity-55" />
            <div className="pointer-events-none absolute bottom-5 right-5 hidden h-32 w-32 place-items-center md:grid">
              <motion.div
                className="why-3d-orbit absolute inset-0 rounded-full"
                animate={prefersReducedMotion ? undefined : { rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="h-16 w-16 rounded-2xl border border-sky-100 bg-white/80 shadow-card"
                animate={prefersReducedMotion ? undefined : { rotateX: [0, 8, 0], rotateY: [0, -10, 0], y: [0, -5, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformStyle: 'preserve-3d' }}
              />
            </div>
            <div className="relative z-10 flex items-start gap-4">
              <motion.div
                className="icon-surface h-16 w-16 rounded-2xl"
                animate={prefersReducedMotion ? undefined : { rotate: [0, -2, 2, 0], y: [0, -3, 0] }}
                transition={{ duration: 3.3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ActiveIcon className="h-7 w-7" strokeWidth={1.7} />
              </motion.div>
              <div>
                <h3 className="text-2xl font-black text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                  {active.title}
                </h3>
                <p className="mt-3 text-sm font-medium leading-7 text-text-secondary md:text-base">
                  {active.desc}
                </p>
              </div>
            </div>
            <div className="relative z-10 mt-6 grid grid-cols-2 gap-2">
              {[benefits[0]?.title, benefits[5]?.title].filter(Boolean).map((label) => (
                <div key={label} className="rounded-2xl border border-sky-100 bg-sky-50/80 px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-primary">
                  {label}
                </div>
              ))}
            </div>
          </motion.div>

          <div className="lg:hidden">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Explore trust points</span>
              <motion.span
                className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-white/80 px-3 py-1 text-[10px] font-bold text-text-secondary shadow-xs"
                animate={prefersReducedMotion ? undefined : { x: [0, 5, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                Swipe <ArrowRight className="h-3 w-3" />
              </motion.span>
            </div>
            <div className="scrollbar-none scroll-hint-fade -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4">
              {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              const isActive = activeBenefit === idx;
              return (
                <motion.button
                  key={benefit.title}
                  type="button"
                  data-active={isActive ? 'true' : 'false'}
                  onClick={() => setActiveBenefit(idx)}
                  className={`why-tab-card group min-h-[176px] w-[82vw] max-w-[360px] shrink-0 snap-center rounded-2xl border bg-white/95 p-4 text-left shadow-card transition-all duration-300 active:scale-[.99] ${isActive ? 'border-sky-300 ring-1 ring-sky-100' : 'border-sky-100'}`}
                  whileTap={{ scale: 0.985, y: -3 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="icon-surface h-11 w-11 rounded-xl" data-active={isActive ? 'true' : undefined}>
                      <Icon className="h-5 w-5" strokeWidth={1.7} />
                    </div>
                    <div className="min-w-0">
                      <h3 className={`text-sm font-black leading-snug transition-colors md:text-base ${isActive ? 'text-primary' : 'text-text-primary'}`} style={{ fontFamily: 'var(--font-heading)' }}>
                        {benefit.title}
                      </h3>
                      <p className="mt-1 line-clamp-3 text-xs font-medium leading-5 text-text-secondary">
                        {benefit.desc}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary">
                        Tap to feature <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
            </div>
          </div>

          <div className="hidden grid-cols-2 gap-3 lg:grid">
            {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            const isActive = activeBenefit === idx;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
              >
                <motion.button
                  type="button"
                  data-active={isActive ? 'true' : 'false'}
                  onClick={() => setActiveBenefit(idx)}
                  className={`why-tab-card group h-full w-full rounded-2xl border bg-white/95 p-4 text-left shadow-card transition-all duration-300 active:scale-[.99] ${isActive ? 'border-sky-300 ring-1 ring-sky-100' : 'border-sky-100 hover:border-sky-300 hover:bg-bg-white hover:shadow-md'}`}
                  whileHover={{ y: -5, scale: 1.015 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="icon-surface h-11 w-11 rounded-xl"
                      data-active={isActive ? 'true' : undefined}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.7} />
                    </div>
                    <div className="min-w-0">
                      <h3 className={`text-sm font-black leading-snug transition-colors md:text-base ${isActive ? 'text-primary' : 'text-text-primary group-hover:text-primary'}`} style={{ fontFamily: 'var(--font-heading)' }}>
                        {benefit.title}
                      </h3>
                      <p className={`mt-1 line-clamp-2 text-xs font-medium leading-5 text-text-secondary transition-all duration-300 sm:line-clamp-2 ${isActive ? 'opacity-100' : 'opacity-90 sm:opacity-75 sm:group-hover:opacity-100'}`}>
                        {benefit.desc}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary opacity-80 transition-all group-hover:translate-x-1 group-hover:opacity-100">
                        Detail <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </motion.button>
              </motion.div>
            );
          })}
          </div>
        </div>
      </div>
    </section>
  );
}
