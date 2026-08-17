'use client';

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Award, Compass, Truck, Users2, Zap, HeartHandshake, Star, Home, Map, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import AnimatedCounter from '@tithi/ui/AnimatedCounter';
import { useLanguageStore } from '@tithi/store/languageStore';
import { PAGE_TRANSLATIONS } from '@/data/translations';
import { useSiteSetting } from '@tithi/hooks/useSiteSetting';

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
  const selectBenefit = (index) => setActiveBenefit((index + benefits.length) % benefits.length);
  const previousBenefit = () => selectBenefit(activeBenefit - 1);
  const nextBenefit = () => selectBenefit(activeBenefit + 1);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const timer = window.setInterval(() => {
      setActiveBenefit((current) => (current + 1) % benefits.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, benefits.length]);

  const desktopPeekX = (offset) => {
    if (offset === 0) return '-50%';
    return `calc(-50% ${offset > 0 ? '+' : '-'} clamp(250px, 28vw, 330px))`;
  };

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
            <div className="relative overflow-hidden rounded-[30px] border border-sky-100 bg-white/85 p-4 shadow-[0_22px_60px_rgba(3,105,161,.12)] backdrop-blur-sm sm:p-5">
              <div className="pointer-events-none absolute inset-0 services-panel-route opacity-55" />
              <motion.div
                className="why-3d-orbit pointer-events-none absolute -right-10 top-12 h-36 w-36 rounded-full opacity-70 sm:right-4 sm:h-44 sm:w-44"
                animate={prefersReducedMotion ? undefined : { rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              />
              <div className="relative z-10 flex items-center justify-end gap-3">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={previousBenefit} className="grid h-9 w-9 place-items-center rounded-2xl border border-sky-100 bg-white text-primary shadow-xs transition active:scale-95" aria-label="Previous trust point">
                    <ChevronLeft className="h-4.5 w-4.5" />
                  </button>
                  <button type="button" onClick={nextBenefit} className="grid h-9 w-9 place-items-center rounded-2xl border border-sky-100 bg-white text-primary shadow-xs transition active:scale-95" aria-label="Next trust point">
                    <ChevronRight className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              <div className="trust-carousel-stage relative z-10 mt-5 h-[300px] overflow-hidden sm:h-[320px]">
                {benefits.map((benefit, idx) => {
                  const Icon = benefit.icon;
                  const rawOffset = (idx - activeBenefit + benefits.length) % benefits.length;
                  const offset = rawOffset > benefits.length / 2 ? rawOffset - benefits.length : rawOffset;
                  const visible = Math.abs(offset) <= 1;
                  return (
                    <motion.button
                      key={benefit.title}
                      type="button"
                      onClick={() => selectBenefit(idx)}
                      className={`trust-card-3d group absolute left-1/2 top-3 flex min-h-[238px] w-[82vw] max-w-[350px] flex-col rounded-[26px] border bg-white/95 p-4 text-left shadow-card transition-colors ${offset === 0 ? 'border-sky-300' : 'border-sky-100'}`}
                      animate={{
                        x: `calc(-50% + ${offset * 72}px)`,
                        y: Math.abs(offset) * 22,
                        rotateY: offset * -12,
                        rotateZ: offset * -1.2,
                        scale: offset === 0 ? 1 : 0.88,
                        opacity: visible ? (offset === 0 ? 1 : 0.46) : 0,
                        zIndex: 10 - Math.abs(offset),
                      }}
                      whileTap={{ scale: offset === 0 ? 0.985 : 0.9 }}
                      transition={{ type: 'spring', stiffness: 130, damping: 26, mass: 0.85 }}
                      style={{ pointerEvents: visible ? 'auto' : 'none' }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="icon-surface h-12 w-12 rounded-2xl" data-active={offset === 0 ? 'true' : undefined}>
                          <Icon className="h-5 w-5" strokeWidth={1.7} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-base font-black leading-snug text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                            {benefit.title}
                          </h4>
                          <p className="mt-2 line-clamp-5 text-sm font-medium leading-6 text-text-secondary">
                            {benefit.desc}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <div className="relative z-10 mt-2 flex justify-center gap-2" aria-label="Trust point mobile carousel progress">
                {benefits.map((benefit, index) => (
                  <button key={benefit.title} type="button" onClick={() => selectBenefit(index)} className={`h-2 rounded-full transition-all duration-300 ${index === activeBenefit ? 'w-8 bg-primary' : 'w-2 bg-sky-200'}`} aria-label={`Show ${benefit.title}`} />
                ))}
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative min-h-[430px] overflow-hidden rounded-[32px] border border-sky-100 bg-white/85 p-5 shadow-[0_26px_70px_rgba(3,105,161,.12)] backdrop-blur-sm">
              <div className="pointer-events-none absolute inset-0 services-panel-route opacity-60" />
              <motion.div
                className="why-3d-orbit pointer-events-none absolute right-10 top-16 h-56 w-56 rounded-full"
                animate={prefersReducedMotion ? undefined : { rotate: 360 }}
                transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
              />
              <div className="relative z-10 flex items-center justify-end gap-4">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={previousBenefit} className="grid h-10 w-10 place-items-center rounded-2xl border border-sky-100 bg-white text-primary shadow-xs transition hover:border-sky-300 hover:bg-sky-50 active:scale-95" aria-label="Previous trust point">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button type="button" onClick={nextBenefit} className="grid h-10 w-10 place-items-center rounded-2xl border border-sky-100 bg-white text-primary shadow-xs transition hover:border-sky-300 hover:bg-sky-50 active:scale-95" aria-label="Next trust point">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="trust-carousel-stage relative z-10 mt-8 h-[318px] overflow-hidden">
                {benefits.map((benefit, idx) => {
                  const Icon = benefit.icon;
                  const rawOffset = (idx - activeBenefit + benefits.length) % benefits.length;
                  const offset = rawOffset > benefits.length / 2 ? rawOffset - benefits.length : rawOffset;
                  const visible = Math.abs(offset) <= 1;
                  return (
                    <motion.button
                      key={benefit.title}
                      type="button"
                      onClick={() => selectBenefit(idx)}
                      className={`trust-card-3d group absolute left-1/2 top-4 flex min-h-[242px] w-[min(72%,430px)] flex-col rounded-[28px] border bg-white/95 p-5 text-left shadow-card transition-colors ${offset === 0 ? 'border-sky-300' : 'border-sky-100 hover:border-sky-300'}`}
                      animate={{
                        x: desktopPeekX(offset),
                        y: Math.abs(offset) * 22,
                        rotateY: offset * -14,
                        scale: offset === 0 ? 1 : 0.9,
                        opacity: visible ? (offset === 0 ? 1 : 0.62) : 0,
                        zIndex: 10 - Math.abs(offset),
                      }}
                      whileHover={offset === 0 ? { y: -4, scale: 1.02 } : { scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 135, damping: 28, mass: 0.85 }}
                      style={{ pointerEvents: visible ? 'auto' : 'none' }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="icon-surface h-12 w-12 rounded-2xl" data-active={offset === 0 ? 'true' : undefined}>
                          <Icon className="h-5.5 w-5.5" strokeWidth={1.7} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-base font-black leading-snug text-text-primary group-hover:text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                            {benefit.title}
                          </h4>
                          <p className="mt-2 line-clamp-4 text-sm font-medium leading-6 text-text-secondary">
                            {benefit.desc}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <div className="relative z-10 mt-3 flex justify-center gap-2" aria-label="Trust point carousel progress">
                {benefits.map((benefit, index) => (
                  <button key={benefit.title} type="button" onClick={() => selectBenefit(index)} className={`h-2 rounded-full transition-all duration-300 ${index === activeBenefit ? 'w-8 bg-primary' : 'w-2 bg-sky-200 hover:bg-sky-300'}`} aria-label={`Show ${benefit.title}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
