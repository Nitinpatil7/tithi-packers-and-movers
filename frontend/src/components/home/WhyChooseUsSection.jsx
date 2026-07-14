'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Award, Compass, Truck, Users2, Zap, HeartHandshake, Star, Home, Map, ShieldCheck } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { useLanguageStore } from '@/store/languageStore';
import { PAGE_TRANSLATIONS } from '@/data/translations';
import { useSiteSetting } from '@/hooks/useSiteSetting';

export default function WhyChooseUsSection() {
  const { language } = useLanguageStore();
  const t = PAGE_TRANSLATIONS[language] || PAGE_TRANSLATIONS['en'];
  const { data: site = {} } = useSiteSetting();

  const stats = [
    { value: String(site.stats?.successfulMoves ?? 0), suffix: '+', label: t.happyRelocations || 'Happy Relocations', icon: Home },
    { value: String(site.stats?.citiesCovered ?? 0), suffix: '+', label: t.citiesReached || 'Cities Reached', icon: Map },
    { value: String(site.stats?.yearsExperience ?? 0), suffix: '+', label: t.yearsOfService || 'Years of Service', icon: Star },
    { value: String(site.stats?.customerSatisfaction ?? 0), suffix: '%', label: t.safetyRating || 'Safety Rating', icon: ShieldCheck },
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

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-bg-border to-transparent" />
      
      {/* BG decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/4 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/4 pointer-events-none" />

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16 md:mb-20">
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
                className="bg-white border border-bg-border rounded-3xl p-6 md:p-8 text-center shadow-card hover:shadow-md transition-all cursor-default"
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                  style={{ backgroundColor: stat.bg }}
                >
                  <StatIcon className="h-6 w-6 text-primary" strokeWidth={1.7} />
                </div>
                <div
                  className="text-4xl md:text-5xl font-black mb-2"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-text-secondary font-semibold uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            </motion.div>);
          })}
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
              >
                <motion.div
                  className="bg-bg-section border border-bg-border rounded-2xl p-7 flex flex-col gap-4 h-full hover:bg-bg-white hover:shadow-md transition-all duration-300"
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ backgroundColor: benefit.bg }}
                    >
                      <Icon className="h-6 w-6 text-primary" strokeWidth={1.7} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-text-primary mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed font-medium">
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
