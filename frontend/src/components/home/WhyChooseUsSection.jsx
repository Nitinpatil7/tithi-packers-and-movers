'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Compass, Truck, Users2, Zap, HeartHandshake, Star, Home, Map, ShieldCheck } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { useLanguageStore } from '@/store/languageStore';
import { PAGE_TRANSLATIONS } from '@/data/translations';
import { useSiteSetting } from '@/hooks/useSiteSetting';

export default function WhyChooseUsSection() {
  const { language } = useLanguageStore();
  const t = PAGE_TRANSLATIONS[language] || PAGE_TRANSLATIONS['en'];
  const { data: site = {} } = useSiteSetting();

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
    <section className="motion-check-bg section-texture py-20 md:py-32 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-bg-border to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-orange-400/30 to-transparent" />

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

        {/* Stats Row */}
        <div className="mb-10 grid grid-cols-4 gap-2 md:mb-14 md:gap-5">
          {stats.map((stat, idx) => {
            const StatIcon = stat.icon;
            return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <motion.div
                className="group rounded-2xl border border-sky-100 bg-white/90 px-1.5 py-3 text-center shadow-card transition-all hover:border-orange-200 hover:shadow-md active:scale-[.99] md:rounded-3xl md:p-6"
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div
                  className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-xl text-2xl ring-4 ring-sky-50 transition-all group-hover:bg-orange-500 group-hover:text-white group-hover:rotate-3 md:mb-4 md:h-14 md:w-14 md:rounded-2xl"
                  style={{ backgroundColor: stat.bg }}
                >
                  <StatIcon className="h-4 w-4 text-primary transition-colors group-hover:text-white md:h-6 md:w-6" strokeWidth={1.7} />
                </div>
                <div
                  className="mb-1 text-xl font-black leading-none transition-colors md:mb-2 md:text-5xl"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[9px] font-semibold uppercase leading-tight tracking-wide text-text-secondary transition-colors group-hover:text-primary md:text-sm md:tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            </motion.div>);
          })}
        </div>

        {/* Benefits Tabs */}
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <motion.div
            key={active.title}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-3xl border border-orange-100 bg-white/95 p-6 shadow-card md:p-8"
          >
            <div className="flex items-start gap-4">
              <motion.div
                className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-primary shadow-sm ring-4 ring-orange-50"
                style={{ backgroundColor: active.bg }}
                animate={{ rotate: [0, -2, 2, 0], y: [0, -3, 0] }}
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
            <div className="mt-6 grid grid-cols-2 gap-2">
              {['Verified crew', 'Move support'].map((label) => (
                <div key={label} className="rounded-2xl border border-sky-100 bg-sky-50/70 px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-primary">
                  {label}
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
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
                  className={`why-tab-card group h-full w-full rounded-2xl border bg-white/95 p-4 text-left shadow-card transition-all duration-300 active:scale-[.99] ${isActive ? 'border-primary/25 ring-1 ring-primary/10' : 'border-sky-100 hover:border-orange-200 hover:bg-bg-white hover:shadow-md'}`}
                  whileHover={{ y: -5, scale: 1.015 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl shadow-xs ring-1 ring-transparent transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:ring-orange-100 group-hover:shadow-[0_14px_28px_rgba(249,115,22,.18)]"
                      style={{ backgroundColor: benefit.bg }}
                    >
                      <Icon className="h-5 w-5 text-primary transition-colors group-hover:text-white" strokeWidth={1.7} />
                    </div>
                    <div>
                      <h3 className={`text-sm font-black leading-snug transition-colors md:text-base ${isActive ? 'text-primary' : 'text-text-primary group-hover:text-primary'}`} style={{ fontFamily: 'var(--font-heading)' }}>
                        {benefit.title}
                      </h3>
                      <p className={`mt-1 hidden text-xs font-medium leading-5 transition-colors sm:line-clamp-2 sm:block ${isActive ? 'text-text-secondary' : 'text-text-secondary'}`}>
                        {benefit.desc}
                      </p>
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
