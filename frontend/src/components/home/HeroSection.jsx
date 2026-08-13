'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, CheckCircle, Clock, HardHat, Headphones, House, MapPinned, ShieldCheck, Star, Truck } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { PAGE_TRANSLATIONS } from '@/data/translations';
import { useSiteSetting } from '@/hooks/useSiteSetting';
import { useLanguageStore } from '@/store/languageStore';

export default function HeroSection() {
  const { language } = useLanguageStore();
  const t = PAGE_TRANSLATIONS[language] || PAGE_TRANSLATIONS.en;
  const { data: site = {} } = useSiteSetting();

  const stats = [
    { value: site.stats?.successfulMoves ?? 0, suffix: '+', label: t.statHappyMoves || 'Happy Moves', icon: House },
    { value: site.stats?.citiesCovered ?? 0, suffix: '+', label: t.statCities || 'Cities Served', icon: MapPinned },
    { value: site.stats?.yearsExperience ?? 0, suffix: '+', label: t.statYears || 'Years Trust', icon: ShieldCheck },
    { value: site.stats?.customerSatisfaction ?? 0, suffix: '%', label: t.statSupport || 'Support', icon: Headphones },
  ];

  const services = [
    { name: site.serviceLabels?.local_shifting || t.localShifting , path: '/website/book/local-shifting', color: '#0EA5E9', bg: '#E0F2FE', icon: Building2 },
    { name: site.serviceLabels?.intercity_moving || t.intercityMoving, path: '/website/book/intercity-moving', color: '#0284C7', bg: '#BAE6FD', icon: Truck },
    { name: site.serviceLabels?.porter_labour_service || t.labourService , path: '/website/book/labour-service', color: '#38BDF8', bg: '#E0F2FE', icon: HardHat },
  ];

  const trustBadges = [
    { text: t.badgeLicensed || 'Licensed & Insured', icon: ShieldCheck },
    { text: t.badgeZeroHidden || 'Zero Hidden Charges', icon: CheckCircle },
    { text: t.badge2HrQuote || '2-Hour Quote', icon: Clock },
  ];

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 26 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 92, damping: 18 },
    },
  };

  return (
    <section className="relative z-20 overflow-x-clip overflow-y-visible bg-hero-gradient pt-24 pb-16 sm:pt-24 sm:pb-20 lg:min-h-[86svh] lg:pt-28 lg:pb-20">
      <div className="absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none" />
      <div className="absolute inset-0 pattern-dots opacity-60 pointer-events-none" />

      <div className="relative z-20 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.78fr)] lg:gap-10 lg:px-8">
        <motion.div
          className="flex max-w-3xl flex-col items-center gap-4 text-center lg:items-start lg:text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2">
            <span className="section-label max-w-[300px] justify-center whitespace-normal px-2.5 text-center text-[9px] leading-snug tracking-[0.08em] sm:max-w-[calc(100vw-2rem)] sm:px-3.5 sm:text-[13px] sm:tracking-[0.12em]">
              <ShieldCheck className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
              {t.heroBadge || '#1 Packers & Movers in Surat, Gujarat'}
            </span>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm font-bold text-text-primary">4.9</span>
            <span className="text-sm text-text-secondary">234 {t.verifiedReviews || 'verified reviews'}</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="max-w-full text-3xl font-black leading-[1.05] tracking-tight text-text-primary sm:text-5xl md:text-6xl xl:text-7xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {t.heroTitle1 || 'Trusted Packers & '}
            <span className="gradient-text block sm:inline">{t.heroTitle2 || 'Movers in Surat'}</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="w-full max-w-[300px] text-base font-medium leading-7 text-text-secondary sm:max-w-2xl md:text-lg">
            {t.heroSubheadline || (
              <>
                Book your local or intercity move in <span className="font-bold text-primary">2 minutes</span>. Transparent pricing, zero hidden charges, and professional support across India.
              </>
            )}
          </motion.p>

          <motion.div variants={itemVariants} className="flex w-full max-w-[270px] flex-wrap justify-center gap-2 sm:max-w-none sm:gap-2.5 lg:justify-start">
            {trustBadges.map(({ text, icon: Icon }) => (
              <div key={text} className="flex items-center gap-1 rounded-full border border-bg-border bg-white px-2 py-1.5 text-[10px] font-semibold text-text-secondary shadow-xs sm:gap-1.5 sm:px-3 sm:text-sm">
                <Icon className="h-3.5 w-3.5 text-primary" />
                {text}
              </div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <Link href="/website/book/local-shifting" className="w-full sm:w-auto">
              <button className="btn-orange flex w-full items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-base font-bold tracking-wide sm:w-auto">
                {t.btnQuote || 'Get Free Quote'}
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
            <Link href="/website/my-bookings" className="w-full sm:w-auto">
              <button className="w-full rounded-2xl border-2 border-bg-border bg-white px-7 py-3.5 text-base font-bold text-text-primary shadow-xs transition-all hover:border-primary/30 hover:text-primary sm:w-auto">
                {t.btnTrack || 'Track My Booking'}
              </button>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="grid w-full max-w-[520px] grid-cols-2 gap-2 border-t border-bg-border pt-3 sm:gap-3 lg:max-w-[480px]">
            {stats.map((stat) => (
              <div key={stat.label} className="group flex min-w-0 items-center gap-2 rounded-2xl bg-white/80 px-3 py-2.5 text-left ring-1 ring-sky-100/80 transition-all duration-300 hover:-translate-y-0.5 hover:ring-sky-300 active:scale-[.99]">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/5 text-primary transition-all duration-300 group-hover:bg-sky-900 group-hover:text-sky-200 group-hover:shadow-[0_12px_24px_rgba(3,105,161,.20)]">
                  {React.createElement(stat.icon, { className: 'h-4 w-4', strokeWidth: 1.8 })}
                </div>
                <div className="min-w-0">
                  <span className="block text-lg font-black leading-none text-text-primary sm:text-xl" style={{ fontFamily: 'var(--font-heading)' }}>
                    <AnimatedCounter value={String(stat.value)} suffix={stat.suffix} />
                  </span>
                  <span className="mt-0.5 block truncate text-[9px] font-semibold uppercase leading-tight tracking-wide text-text-tertiary sm:text-[10px]">{stat.label}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="pointer-events-none relative hidden min-h-[360px] lg:block">
          <Image
            src="/truck.png"
            alt="Tithi Packers and Movers truck"
            width={920}
            height={660}
            priority
            sizes="(min-width: 1280px) 560px, 46vw"
            className="absolute -bottom-44 right-[-12%] z-10 w-[118%] max-w-[660px] object-contain drop-shadow-[0_24px_34px_rgba(15,23,42,0.22)]"
          />
        </div>
      </div>

      <div className="relative z-20 mt-6 w-full px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-2 sm:gap-4">
          {services.map((service) => (
            <Link key={service.name} href={service.path}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ scale: { type: 'spring', stiffness: 300, damping: 20 } }}
                className="hero-service-card group flex min-h-[94px] cursor-pointer flex-col items-center justify-between gap-2 rounded-2xl border border-orange-100/80 bg-white/90 p-3 text-center shadow-card transition-all duration-300 hover:border-primary/25 hover:shadow-lg active:shadow-md sm:min-h-[118px] sm:gap-3 sm:p-4"
                style={{ '--hover-color': service.color }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-3deg] group-hover:bg-sky-900 group-hover:text-sky-200 group-hover:shadow-[0_12px_24px_rgba(3,105,161,.20)] sm:h-12 sm:w-12" style={{ backgroundColor: service.bg, color: service.color }}>
                  {React.createElement(service.icon, { className: 'h-5 w-5 transition-colors group-hover:text-sky-800 sm:h-6 sm:w-6', strokeWidth: 1.9 })}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[11px] font-bold leading-tight text-text-primary transition-colors group-hover:text-primary sm:text-sm">{service.name}</span>
                  <span className="text-[10px] font-bold text-orange-500 transition-transform group-hover:translate-x-0.5 sm:text-xs">{t.bookNow || 'Book Now'}</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      <Image
        src="/front_truck.png"
        alt=""
        width={620}
        height={360}
        sizes="(min-width: 768px) 520px, 82vw"
        className="pointer-events-none absolute bottom-[-15%] right-[-15%] z-50 w-[84vw] max-w-[420px] object-contain drop-shadow-[0_20px_28px_rgba(15,23,42,0.20)] sm:-bottom-52 sm:right-[-10%] sm:max-w-[500px] md:-bottom-52 md:max-w-[500px] lg:hidden"
      />
    </section>
  );
}

