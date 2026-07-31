'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Building2, CheckCircle, Clock, HardHat, Headphones, House, MapPinned, ShieldCheck, Star, Truck } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { PAGE_TRANSLATIONS } from '@/data/translations';
import { useSiteSetting } from '@/hooks/useSiteSetting';
import { useLanguageStore } from '@/store/languageStore';

export default function HeroSection() {
  const { language } = useLanguageStore();
  const t = PAGE_TRANSLATIONS[language] || PAGE_TRANSLATIONS.en;
  const { data: site = {} } = useSiteSetting();
  const [hydrated, setHydrated] = useState(false);
  const stableSite = hydrated ? site : {};
  const heroRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 110, damping: 18, mass: 0.35 });
  const smoothY = useSpring(pointerY, { stiffness: 110, damping: 18, mass: 0.35 });
  const truckRotateY = useTransform(smoothX, [-0.5, 0.5], [4, -4]);
  const truckRotateX = useTransform(smoothY, [-0.5, 0.5], [-3, 3]);
  const truckTranslateX = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);
  const truckTranslateY = useTransform(smoothY, [-0.5, 0.5], [-7, 7]);
  const visualBgX = useTransform(smoothX, [-0.5, 0.5], [8, -8]);
  const visualBgY = useTransform(smoothY, [-0.5, 0.5], [6, -6]);
  const shadowX = useTransform(smoothX, [-0.5, 0.5], [-6, 6]);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const mobileTruckX = useTransform(scrollYProgress, [0, 1], [0, -34]);
  const mobileTruckRotate = useTransform(scrollYProgress, [0, 1], [0, -1.8]);
  const mobileBgX = useTransform(scrollYProgress, [0, 1], [0, 18]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const stats = [
    { value: stableSite.stats?.successfulMoves ?? 0, suffix: '+', label: t.statHappyMoves || 'Happy Moves', icon: House },
    { value: stableSite.stats?.citiesCovered ?? 0, suffix: '+', label: t.statCities || 'Cities Served', icon: MapPinned },
    { value: stableSite.stats?.yearsExperience ?? 0, suffix: '+', label: t.statYears || 'Years Trust', icon: ShieldCheck },
    { value: stableSite.stats?.customerSatisfaction ?? 0, suffix: '%', label: t.statSupport || 'Support', icon: Headphones },
  ];

  const services = [
    { name: stableSite.serviceLabels?.local_shifting || t.localShifting || 'Local Shifting', path: '/book/local-shifting', color: '#0EA5E9', bg: '#E0F2FE', icon: Building2 },
    { name: stableSite.serviceLabels?.intercity_moving || t.intercityMoving || 'Intercity Moving', path: '/book/intercity-moving', color: '#0284C7', bg: '#BAE6FD', icon: Truck },
    { name: stableSite.serviceLabels?.porter_labour_service || t.labourService || 'Labour Service', path: '/book/labour-service', color: '#38BDF8', bg: '#E0F2FE', icon: HardHat },
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
  const handleTruckPointerMove = (event) => {
    if (prefersReducedMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  const resetTruckPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <section ref={heroRef} className="relative z-20 overflow-x-clip overflow-y-visible bg-hero-gradient pt-32 pb-16 sm:pt-24 sm:pb-20 lg:min-h-[86svh] lg:pt-28 lg:pb-20">
      <div className="absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none" />
      <motion.div style={prefersReducedMotion ? undefined : { x: mobileBgX }} className="absolute inset-0 pattern-dots opacity-60 pointer-events-none" />

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
            <Link
              href="/book/local-shifting"
              className="btn-orange flex w-full items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-base font-bold tracking-wide sm:w-auto"
            >
              {t.btnQuote || 'Get Free Quote'}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/my-bookings"
              className="w-full rounded-2xl border-2 border-bg-border bg-white px-7 py-3.5 text-center text-base font-bold text-text-primary shadow-xs transition-all hover:border-primary/30 hover:text-primary sm:w-auto"
            >
              {t.btnTrack || 'Track My Booking'}
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="grid w-full max-w-[520px] grid-cols-2 gap-2 border-t border-bg-border pt-3 sm:gap-3 lg:max-w-[480px]">
            {stats.map((stat) => (
              <div key={stat.label} className="group flex min-w-0 items-center gap-2 rounded-2xl bg-white/80 px-3 py-2.5 text-left ring-1 ring-sky-100/80 transition-all duration-300 hover:-translate-y-0.5 hover:ring-sky-300 active:scale-[.99]">
                <div className="icon-surface h-8 w-8 rounded-xl">
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

        <div
          className="relative hidden min-h-[440px] lg:block"
          onPointerMove={handleTruckPointerMove}
          onPointerLeave={resetTruckPointer}
        >
          <motion.div style={prefersReducedMotion ? undefined : { x: visualBgX, y: visualBgY }} className="pointer-events-none absolute inset-0 rounded-[42px] bg-[radial-gradient(circle_at_58%_42%,rgba(14,165,233,.20),transparent_38%),radial-gradient(circle_at_75%_62%,rgba(249,115,22,.14),transparent_32%)]" />
          <svg className="pointer-events-none absolute left-4 top-12 h-[250px] w-[88%] text-sky-400/45" viewBox="0 0 520 260" fill="none" aria-hidden="true">
            <motion.path
              d="M18 210 C130 70 220 265 335 118 C390 48 448 64 500 22"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="8 14"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={prefersReducedMotion ? { pathLength: 1, opacity: 0.45 } : { pathLength: 1, opacity: 0.45 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            />
            {!prefersReducedMotion && (
              <motion.circle
                cx="18"
                cy="210"
                r="5"
                fill="#f97316"
                initial={{ opacity: 0 }}
                animate={{ x: [0, 112, 202, 317, 430, 482], y: [0, -140, 55, -92, -146, -188], opacity: [0, 1, 1, 1, 1, 0] }}
                transition={{ duration: 5.4, repeat: Infinity, repeatDelay: 2.2, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </svg>
          <motion.div
            className="pointer-events-none absolute -bottom-10 right-[-6%] z-10 w-[116%] max-w-[680px]"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: 80 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0, y: [0, -5, 0] }}
            transition={{ opacity: { duration: 0.55 }, x: { duration: 0.72, ease: [0.22, 1, 0.36, 1] }, y: { duration: 0.62, delay: 0.28, ease: [0.22, 1, 0.36, 1] } }}
            style={prefersReducedMotion ? undefined : { rotateX: truckRotateX, rotateY: truckRotateY, x: truckTranslateX, y: truckTranslateY, transformPerspective: 900 }}
          >
            <Image
              src="/truck.png"
              alt="Tithi Packers and Movers truck"
              width={920}
              height={660}
              priority
              sizes="(min-width: 1280px) 620px, 48vw"
              className="relative z-10 w-full object-contain drop-shadow-[0_24px_34px_rgba(15,23,42,0.22)]"
            />
            <motion.div
              className="absolute inset-x-[18%] bottom-5 h-8 rounded-full bg-slate-950/18 blur-xl"
              animate={prefersReducedMotion ? undefined : { scaleX: [0.9, 1.02, 0.9], opacity: [0.38, 0.24, 0.38] }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              style={prefersReducedMotion ? undefined : { x: shadowX }}
            />
          </motion.div>
          <motion.div
            className="pointer-events-none absolute right-4 top-16 z-20 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm font-black text-sky-900 shadow-card backdrop-blur-md"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.55 }}
          >
            Safe & Insured
          </motion.div>
          <motion.div
            className="pointer-events-none absolute bottom-20 left-4 z-20 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm font-black text-sky-900 shadow-card backdrop-blur-md"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.55 }}
          >
            4.9 Rating
          </motion.div>
        </div>
      </div>

      <div className="relative z-20 mt-6 w-full px-4 mb-10   sm:px-6 lg:px-8">
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
                <div className="icon-surface h-10 w-10 rounded-xl sm:h-12 sm:w-12">
                  {React.createElement(service.icon, { className: 'h-5 w-5 sm:h-6 sm:w-6', strokeWidth: 1.9 })}
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

      <motion.div
        className="pointer-events-none absolute bottom-[-14%] right-[-15%] z-50 w-[84vw] max-w-[420px] sm:-bottom-[18%] sm:right-[-10%] sm:max-w-[500px] md:-bottom-[20%] md:max-w-[500px] lg:hidden"
        style={prefersReducedMotion ? undefined : { x: mobileTruckX, rotate: mobileTruckRotate }}
      >
        <Image
          src="/front_truck.png"
          alt=""
          width={620}
          height={400}
          sizes="(min-width: 768px) 520px, 82vw"
          className="w-full object-contain drop-shadow-[0_20px_28px_rgba(15,23,42,0.20)]"
        />
      </motion.div>
    </section>
  );
}
