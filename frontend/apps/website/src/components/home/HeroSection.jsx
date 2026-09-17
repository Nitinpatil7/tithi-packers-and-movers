'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Clock, Headphones, Heart, House, MapPinned, ShieldCheck, Star, Truck, Users } from 'lucide-react';
import AnimatedCounter from '@tithi/ui/AnimatedCounter';
import StarRating from '@tithi/ui/StarRating';
import { PAGE_TRANSLATIONS } from '@/data/translations';
import { useSiteSetting } from '@tithi/hooks/useSiteSetting';
import { usePublicTestimonials } from '@tithi/hooks/useTestimonials';
import { useLanguageStore } from '@tithi/store/languageStore';

export default function HeroSection() {
  const [hydrated, setHydrated] = useState(false);
  const { language } = useLanguageStore();
  const t = PAGE_TRANSLATIONS[language] || PAGE_TRANSLATIONS.en;
  const { data: site = {} } = useSiteSetting();
  const { data: testimonialData = [] } = usePublicTestimonials({});
  const testimonials = hydrated && Array.isArray(testimonialData) ? testimonialData : [];
  const stableSite = hydrated ? site : {};
  const averageRating = testimonials.length
    ? (
        testimonials.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
        testimonials.length
      ).toFixed(1)
    : '5.0';
  const verifiedReviewCount = testimonials.length + 50;

  const stats = [
    { value: stableSite.stats?.successfulMoves ?? 0, suffix: '+', label: t.statHappyMoves || 'Happy Moves', icon: House },
    { value: stableSite.stats?.citiesCovered ?? 0, suffix: '+', label: t.statCities || 'Cities Served', icon: MapPinned },
    { value: stableSite.stats?.yearsExperience ?? 0, suffix: '+', label: t.statYears || 'Years Trust', icon: ShieldCheck },
    { value: stableSite.stats?.customerSatisfaction ?? 0, suffix: '%', label: t.statSupport || 'Support', icon: Headphones },
  ];

  useEffect(() => {
    setHydrated(true);
  }, []);

  const trustBadges = [
    { text: t.badgeLicensed || 'Licensed & Insured', icon: ShieldCheck },
    { text: t.badgeZeroHidden || 'Zero Hidden Charges', icon: CheckCircle },
    { text: t.badge2HrQuote || '2-Hour Quote', icon: Clock },
  ];

  const heroFloatingCards = [
    { text: 'Local & Intercity Moves', icon: House },
    { text: 'Professional Team', icon: Users },
    { text: 'Safe & Secure Handling', icon: ShieldCheck },
  ];

  const heroTrustRow = [
    { text: 'On-Time Delivery', icon: Truck },
    { text: 'Your Belongings, Our Responsibility', icon: Heart },
    { text: 'Trusted Across Gujarat & Beyond', icon: Star },
  ];

  return (
    <section className="hero-scene-section relative z-20 overflow-x-clip overflow-y-visible bg-hero-gradient pt-24 pb-16 sm:pt-24 sm:pb-18 lg:h-screen lg:min-h-[720px] lg:overflow-hidden lg:pt-[92px] lg:pb-0">
      <div className="hero-scene-bg absolute inset-0 pointer-events-none" />
      <div className="absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none" />
      <div className="absolute inset-0 pattern-dots opacity-60 pointer-events-none" />

      <div className="relative z-20 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:h-[calc(100vh-92px)] lg:min-h-[628px] lg:grid-cols-[minmax(560px,0.88fr)_minmax(0,1.12fr)] lg:items-start lg:gap-0 lg:px-8 lg:pt-14 xl:pt-16">
        <div
          className="relative z-20 flex max-w-3xl flex-col items-center gap-4 text-center lg:max-w-[650px] lg:items-start lg:gap-3 lg:text-left"
        >
          <div className="inline-flex items-center gap-2">
            <span className="section-label max-w-[300px] justify-center whitespace-normal px-2.5 text-center text-[9px] leading-snug tracking-[0.08em] sm:max-w-[calc(100vw-2rem)] sm:px-3.5 sm:text-[13px] sm:tracking-[0.12em]">
              <ShieldCheck className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
              {t.heroBadge || '#1 Packers & Movers in Surat, Gujarat'}
            </span>
          </div>

          <h1
            className="max-w-full text-3xl font-black leading-[1.02] tracking-tight text-text-primary sm:text-5xl md:text-6xl lg:text-[4.05rem] xl:text-[4.45rem]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <span className="block whitespace-nowrap">{t.heroTitle1 || 'Trusted Packers &'}</span>
            <span className="gradient-text block whitespace-nowrap">{t.heroTitle2 || 'Movers in Surat'}</span>
          </h1>

          <div className="flex items-center gap-3">
            <StarRating rating={averageRating} size="sm" />
            <span className="text-sm font-bold text-text-primary">{averageRating}</span>
            <span className="text-sm text-text-secondary dark:text-text-primary">{verifiedReviewCount} {t.verifiedReviews || 'verified reviews'}</span>
          </div>

          <p className="w-full max-w-[300px] text-base font-medium leading-7 text-text-secondary sm:max-w-2xl md:text-lg lg:max-w-[560px] lg:text-base lg:leading-7">
            {t.heroSubheadline || (
              <>
                Book your local or intercity move in <span className="font-bold text-primary">2 minutes</span>. Transparent pricing, zero hidden charges, and professional support across India.
              </>
            )}
          </p>

          <div className="flex w-full max-w-[270px] flex-wrap justify-center gap-2 sm:max-w-none sm:gap-2.5 lg:justify-start">
            {trustBadges.map(({ text, icon: Icon }) => (
              <div key={text} className="flex items-center gap-1 rounded-full border border-bg-border bg-white/90 px-2 py-1.5 text-[10px] font-semibold text-text-secondary shadow-xs dark:border-sky-300/20 dark:bg-sky-400/10 dark:text-text-primary sm:gap-1.5 sm:px-3 sm:text-sm">
                <Icon className="h-3.5 w-3.5 text-primary" />
                {text}
              </div>
            ))}
          </div>

          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <Link href="/book/local-shifting" className="w-full sm:w-auto">
              <button className="btn-orange flex w-full items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-base font-bold tracking-wide sm:w-auto lg:px-8">
                {t.btnQuote || 'Get Free Quote'}
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
            <Link href="/my-bookings" className="w-full sm:w-auto">
              <button className="w-full rounded-2xl border-2 border-primary/40 bg-white/90 px-7 py-3.5 text-base font-bold text-text-primary shadow-xs transition-all hover:border-primary/70 hover:text-primary dark:bg-sky-400/10 dark:text-white sm:w-auto lg:px-8">
                {t.btnTrack || 'Track My Booking'}
              </button>
            </Link>
          </div>

          <div className="grid w-full max-w-[520px] grid-cols-2 gap-2 border-t border-bg-border pt-3 sm:gap-3 lg:max-w-[500px] lg:grid-cols-4 lg:gap-2 lg:pt-2">
            {stats.map((stat) => (
              <div key={stat.label} className="group flex h-[82px] min-w-0 flex-col justify-center rounded-2xl bg-white/80 px-3 py-3 text-left ring-1 ring-sky-100/80 dark:bg-sky-400/10 dark:ring-sky-300/20 sm:h-[96px] sm:px-4 lg:h-[86px] lg:px-3">
                <span className="mb-2 block w-full text-center text-[9px] font-black uppercase leading-tight tracking-wide text-text-tertiary sm:text-[10px] lg:text-[9px]">
                  {stat.label}
                </span>
                <div className="flex min-w-0 items-center justify-center gap-2">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/5 text-primary sm:h-11 sm:w-11 lg:h-9 lg:w-9">
                    {React.createElement(stat.icon, { className: 'h-5 w-5 sm:h-5 sm:w-5', strokeWidth: 1.8 })}
                  </div>
                  <span className="block text-xl font-black leading-none text-text-primary sm:text-2xl lg:text-[1.45rem]" style={{ fontFamily: 'var(--font-heading)' }}>
                    <AnimatedCounter value={String(stat.value)} suffix={stat.suffix} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-y-0 z-10 hidden w-[58vw] overflow-hidden lg:right-[calc((100vw-100%)/-2)] lg:block">
          <div className="absolute inset-y-0 left-0 z-30 w-[22%] bg-gradient-to-r from-[#effaff] via-[#effaff]/85 to-transparent dark:from-[#06101d] dark:via-[#06101d]/88" />
          <div className="absolute inset-y-0 left-[10%] z-30 w-[14%] bg-gradient-to-r from-[#effaff]/45 to-transparent dark:from-[#06101d]/55" />
          <Image
            src="/truck.png"
            alt="Tithi Packers and Movers truck"
            width={920}
            height={660}
            priority
            loading="eager"
            unoptimized
            sizes="58vw"
            className="hero-truck-art absolute inset-0 z-10 h-full w-full max-w-none object-cover object-right"
          />
          <div className="absolute right-8 top-[13%] z-30 flex w-56 flex-col gap-3 xl:right-12">
            {heroFloatingCards.map(({ text, icon: Icon }) => (
              <div key={text} className="ml-auto flex h-14 w-56 items-center justify-start gap-3 rounded-xl border border-sky-100 bg-white/95 px-4 text-[11px] font-black leading-tight text-text-primary shadow-[0_10px_24px_rgba(3,105,161,.10)] dark:border-sky-300/20 dark:bg-sky-950/90 dark:text-white">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary dark:bg-sky-300/15 dark:text-sky-200">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-left">{text}</span>
              </div>
            ))}
          </div>
          <div className="absolute bottom-8 right-10 z-30 flex items-center justify-end gap-7 text-primary xl:right-16">
            {heroTrustRow.map(({ text, icon: Icon }) => (
              <div key={text} className="flex max-w-[210px] items-center gap-2 text-sm font-bold text-text-secondary dark:text-text-primary">
                <Icon className="h-6 w-6 shrink-0 text-primary" strokeWidth={1.8} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        :global(.hero-scene-section) {
          background:
            linear-gradient(105deg, #effaff 0%, #edf9ff 34%, #d8f1ff 68%, #bce8fb 100%);
        }

        :global(.dark .hero-scene-section) {
          background:
            linear-gradient(105deg, #06101d 0%, #071a2d 38%, #09233a 68%, #082c43 100%);
        }

        .hero-scene-bg {
          background:
            radial-gradient(circle at 80% 8%, rgba(186, 230, 253, 0.72), transparent 42%),
            linear-gradient(90deg, rgba(255, 255, 255, 0.45), transparent 58%);
        }

        :global(.dark) .hero-scene-bg {
          background:
            radial-gradient(circle at 80% 8%, rgba(14, 116, 144, 0.32), transparent 42%),
            linear-gradient(90deg, rgba(2, 6, 23, 0.45), transparent 58%);
        }

        :global(.hero-truck-art) {
          transform: translateZ(0);
          will-change: auto;
        }

        :global(.dark .hero-truck-art) {
          filter: none;
        }
      `}</style>
    </section>
  );
}
