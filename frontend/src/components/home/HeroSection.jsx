'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShieldCheck, Truck, Star, ArrowRight, Clock, MapPin, Package, CheckCircle, House, MapPinned, Headphones, Building2, HardHat } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { useLanguageStore } from '@/store/languageStore';
import { PAGE_TRANSLATIONS } from '@/data/translations';
import { useSiteSetting } from '@/hooks/useSiteSetting';

export default function HeroSection() {
  const { language } = useLanguageStore();
  const t = PAGE_TRANSLATIONS[language] || PAGE_TRANSLATIONS['en'];
  const { data: site = {} } = useSiteSetting();

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 90, damping: 18 },
    },
  };

  const stats = [
    { value: site.stats?.successfulMoves ?? 0, suffix: '+', label: t.statHappyMoves || 'Happy Moves', icon: House },
    { value: site.stats?.citiesCovered ?? 0, suffix: '+', label: t.statCities || 'Cities Served', icon: MapPinned },
    { value: site.stats?.yearsExperience ?? 0, suffix: '+', label: t.statYears || 'Years Trust', icon: ShieldCheck },
    { value: site.stats?.customerSatisfaction ?? 0, suffix: '%', label: t.statSupport || 'Customer Satisfaction', icon: Headphones },
  ];
  const services = [
    { name: site.serviceLabels?.local_shifting || t.localShifting || 'Local Shifting', path: '/book/local-shifting', color: '#0EA5E9', bg: '#E0F2FE', icon: Building2 },
    { name: site.serviceLabels?.intercity_moving || t.intercityMoving || 'Intercity Moving', path: '/book/intercity-moving', color: '#0284C7', bg: '#BAE6FD', icon: Truck },
    { name: site.serviceLabels?.porter_labour_service || t.labourService || 'Labour & Porter', path: '/book/labour-service', color: '#38BDF8', bg: '#E0F2FE', icon: HardHat },
  ];

  const trustBadges = [
    { text: t.badgeLicensed || 'Licensed & Insured', icon: ShieldCheck },
    { text: t.badgeZeroHidden || 'Zero Hidden Charges', icon: CheckCircle },
    { text: t.badge2HrQuote || '2-Hour Quote', icon: Clock },
  ];

  return (
    <section className="relative min-h-screen bg-hero-gradient flex flex-col items-center justify-center pt-32 md:pt-36 pb-0 overflow-hidden">
      {/* Soft background orbs */}
      <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-primary/6 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-service-local/5 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Dot pattern */}
      <div className="absolute inset-0 pattern-dots opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column */}
        <motion.div
          className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Trust badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2">
            <span className="section-label">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t.heroBadge || '#1 Packers & Movers in Surat, Gujarat'}
            </span>
          </motion.div>

          {/* Rating row */}
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm font-bold text-text-primary">4.9</span>
            <span className="text-sm text-text-secondary">• 234 {t.verifiedReviews || 'verified reviews'}</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.0] text-text-primary"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {t.heroTitle1 || 'Trusted Packers & '}{' '}
            <span className="gradient-text block sm:inline">
              {t.heroTitle2 || 'Movers in Surat'}
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-text-secondary max-w-xl leading-relaxed font-medium"
          >
            {t.heroSubheadline || (
              <>
                Book your local or intercity move in{' '}
                <span className="text-primary font-bold">2 minutes</span>. Transparent pricing, zero hidden charges, and professional support across India.
              </>
            )}
          </motion.p>

          {/* Trust badges */}
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center lg:justify-start gap-3">
            {trustBadges.map(({ text, icon: Icon }) => (
              <div
                key={text}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white rounded-full border border-bg-border shadow-xs text-sm font-semibold text-text-secondary"
              >
                <Icon className="w-3.5 h-3.5 text-primary" />
                {text}
              </div>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link href="/book/local-shifting" className="w-full sm:w-auto">
              <button className="btn-orange w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2 tracking-wide">
                {t.btnQuote || 'Get Free Quote'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/my-bookings" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold border-2 border-bg-border bg-white text-text-primary hover:border-primary/30 hover:text-primary transition-all shadow-xs">
                {t.btnTrack || 'Track My Booking'}
              </button>
            </Link>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 sm:grid-cols-4 gap-0 pt-6 border-t-2 border-bg-border w-full"
          >
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center lg:items-start py-4 px-3 ${i > 0 ? 'border-l border-bg-border' : ''}`}
              >
                <div className="mb-2 grid h-9 w-9 place-items-center rounded-xl border border-primary/15 bg-primary/5 text-primary transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary hover:text-white">{React.createElement(stat.icon, { className: 'h-[18px] w-[18px]', strokeWidth: 1.8 })}</div>
                <span className="text-2xl md:text-3xl font-black text-text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                  <AnimatedCounter value={String(stat.value)} suffix={stat.suffix} />
                </span>
                <span className="text-xs text-text-tertiary font-semibold mt-0.5 uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Column: Truck SVG */}
        <div className="hero-truck-wrap group hidden lg:col-span-5 lg:flex items-center justify-center relative">
          <motion.div
            animate={{ y: [0, -5, 0], x: [0, 2, 0] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full relative transition-transform duration-500 group-hover:scale-[1.025]"
          >
            {/* Glow behind truck */}
            <div className="absolute inset-0 m-auto w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <svg
              viewBox="0 0 520 380"
              className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--truck-body-start)" />
                  <stop offset="100%" stopColor="var(--truck-body-end)" />
                </linearGradient>
                <linearGradient id="skyStripe" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0EA5E9" />
                  <stop offset="100%" stopColor="#0284C7" />
                </linearGradient>
                <linearGradient id="cabinGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--truck-cabin-start)" />
                  <stop offset="100%" stopColor="var(--truck-cabin-end)" />
                </linearGradient>
                <linearGradient id="windowGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#90CAF9" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#42A5F5" stopOpacity="0.6" />
                </linearGradient>
                <filter id="truckShadow">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="var(--truck-shadow)" floodOpacity="0.12" />
                </filter>
              </defs>

              {/* Road shadow */}
              <ellipse cx="260" cy="340" rx="200" ry="14" fill="#0EA5E9" opacity="0.10" />
              <motion.path d="M55 346 H145 M180 346 H270 M305 346 H405" stroke="#0EA5E9" strokeWidth="3" strokeLinecap="round" strokeDasharray="18 14" initial={{ pathOffset: 0 }} animate={{ pathOffset: -1 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} opacity=".35" />

              {/* Container body */}
              <rect x="40" y="80" width="300" height="200" rx="14" fill="url(#bodyGrad)" stroke="var(--truck-outline)" strokeWidth="2.4" filter="url(#truckShadow)" />

              {/* Horizontal panel lines */}
              <line x1="40" y1="140" x2="340" y2="140" stroke="#E0E0E0" strokeWidth="1.5" />
              <line x1="40" y1="200" x2="340" y2="200" stroke="#E0E0E0" strokeWidth="1.5" />
              <line x1="40" y1="255" x2="340" y2="255" stroke="#E0E0E0" strokeWidth="1.5" />

              {/* Vertical door seam */}
              <line x1="200" y1="80" x2="200" y2="255" stroke="#E0E0E0" strokeWidth="2" />

              {/* Sky blue stripe bottom */}
              <rect x="40" y="255" width="300" height="24" rx="0" fill="url(#skyStripe)" />
              <rect x="40" y="268" width="300" height="11" rx="0" fill="#0284C7" opacity="0.3" />

              {/* TITHI branding on container */}
              <text x="185" y="180" fill="var(--truck-brand)" fontSize="32" fontWeight="900" textAnchor="middle" letterSpacing="6" fontFamily="Outfit, sans-serif">TITHI</text>
              <text x="185" y="215" fill="var(--truck-subbrand)" fontSize="11" fontWeight="800" textAnchor="middle" letterSpacing="3" fontFamily="Outfit, sans-serif">PACKERS & MOVERS</text>

              {/* Rear door handle */}
              <rect x="195" y="195" width="10" height="30" rx="5" fill="#BDBDBD" />
              <rect x="195" y="210" width="10" height="10" rx="2" fill="#9E9E9E" />

              {/* Cabin */}
              <path d="M340 120 H430 L465 185 V280 H340 Z" fill="url(#cabinGrad)" stroke="var(--truck-outline)" strokeWidth="2.4" filter="url(#truckShadow)" />

              {/* Sky blue cabin stripe */}
              <path d="M340 255 L464 255" stroke="url(#skyStripe)" strokeWidth="8" />

              {/* Cabin window */}
              <path d="M350 132 H415 L450 182 H350 Z" fill="url(#windowGrad)" opacity="0.9" />
              <path d="M350 132 H415 L450 182 H350 Z" stroke="#90CAF9" strokeWidth="2" fill="none" opacity="0.5" />

              {/* Side mirror */}
              <rect x="460" y="168" width="14" height="20" rx="4" fill="#BDBDBD" stroke="#E0E0E0" strokeWidth="1" />

              {/* Headlight */}
              <rect x="458" y="215" width="14" height="22" rx="4" fill="#FFF9C4" stroke="#FDD835" strokeWidth="1.5" />
              <polygon points="472,218 510,200 510,240 472,234" fill="#FDD835" opacity="0.25" />

              {/* Wheel arches */}
              <path d="M80 270 A38 38 0 0 1 156 270" stroke="#E0E0E0" strokeWidth="4" fill="none" />
              <path d="M226 270 A38 38 0 0 1 302 270" stroke="#E0E0E0" strokeWidth="4" fill="none" />
              <path d="M356 270 A38 38 0 0 1 432 270" stroke="#E0E0E0" strokeWidth="4" fill="none" />

              {/* Wheels */}
              {[118, 264, 394].map((cx, i) => (
                <g key={i}>
                  <circle cx={cx} cy={288} r="32" fill="#37474F" />
                  <circle cx={cx} cy={288} r="22" fill="#546E7A" />
                  <circle cx={cx} cy={288} r="10" fill="#78909C" />
                  <circle cx={cx} cy={288} r="4" fill="#B0BEC5" />
                  {/* Lug nuts */}
                  {[0, 72, 144, 216, 288].map((angle) => (
                    <circle
                      key={angle}
                      cx={cx + 15 * Math.cos((angle * Math.PI) / 180)}
                      cy={288 + 15 * Math.sin((angle * Math.PI) / 180)}
                      r="2.5"
                      fill="#90A4AE"
                    />
                  ))}
                </g>
              ))}

              {/* Exhaust pipe */}
              <rect x="334" y="220" width="8" height="60" rx="4" fill="#9E9E9E" />
              {/* Exhaust smoke */}
              {[0, 1, 2].map((i) => (
                <ellipse key={i} cx={330 - i * 6} cy={210 - i * 12} rx={4 + i * 2} ry={3 + i} fill="#E0E0E0" opacity={0.3 - i * 0.08} />
              ))}
            </svg>
          </motion.div>

          {/* Floating service cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, type: 'spring', stiffness: 80 }}
            className="absolute top-10 right-0 bg-white rounded-2xl shadow-lg border border-bg-border p-3.5 min-w-[160px]"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-sm">✓</span>
              <span className="text-xs font-bold text-text-primary">{t.confirmedCardTitle || 'Booking Confirmed'}</span>
            </div>
            <p className="text-[10px] text-text-tertiary leading-snug">{t.confirmedCardSub || 'Move scheduled for tomorrow'}</p>
            <div className="mt-2 flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-[10px] text-text-tertiary ml-1">4.9</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1, type: 'spring', stiffness: 80 }}
            className="absolute bottom-24 left-0 bg-white rounded-2xl shadow-lg border border-bg-border p-3.5 min-w-[150px]"
          >
            <div className="text-xs text-text-tertiary mb-1 font-semibold uppercase tracking-wider">{t.trackingCardTitle || 'Live Tracking'}</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-bold text-text-primary">{t.trackingCardSub || 'On the way'}</span>
            </div>
            <div className="text-[11px] text-text-secondary mt-1">{t.trackingEta || 'ETA: 45 minutes'}</div>
          </motion.div>
        </div>
      </div>

      {/* Service Quick-links bar */}
      <div className="w-full mt-12 lg:mt-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 pb-10 max-w-4xl mx-auto">
            {services.map((service) => (
              <Link key={service.name} href={service.path}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-bg-border shadow-card hover:shadow-lg hover:border-primary/25 group cursor-pointer transition-all duration-300"
                  style={{ '--hover-color': service.color }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-3deg]"
                    style={{ backgroundColor: service.bg }}
                  >
                    {React.createElement(service.icon, { className: 'h-6 w-6', strokeWidth: 1.8, style: { color: service.color } })}
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors text-center leading-tight">
                      {service.name}
                    </span>
                    <span className="text-xs text-text-tertiary font-medium">{t.bookNow || 'Book Now'} →</span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
