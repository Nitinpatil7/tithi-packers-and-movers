'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Boxes, CheckCircle2, Clock, MapPinned, Route, Sparkles, Truck, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getPublicPricingRules } from '@/lib/bookingPricingApi';
import { useSiteSetting } from '@/hooks/useSiteSetting';
import { formatCurrency } from '@/lib/utils';

const SERVICE_META = {
  local_shifting: { fallback: 'Local Shifting', href: '/book/local-shifting?basePackage=1', icon: Truck, tone: 'sky' },
  intercity_moving: { fallback: 'Intercity Moving', href: '/book/intercity-moving?basePackage=1', icon: Route, tone: 'blue' },
  porter_labour_service: { fallback: 'Labour & Porter', href: '/book/labour-service?basePackage=1', icon: Users, tone: 'emerald' },
};

const toneClass = {
  sky: 'from-sky-50 to-white border-sky-100 text-sky-700',
  blue: 'from-blue-50 to-white border-blue-100 text-blue-700',
  emerald: 'from-emerald-50 to-white border-emerald-100 text-emerald-700',
};

const serviceOrder = ['local_shifting', 'intercity_moving', 'porter_labour_service'];

export default function BasePricePackagesSection() {
  const [hydrated, setHydrated] = useState(false);
  const [activePackageIndex, setActivePackageIndex] = useState(0);
  const packageTrackRef = useRef(null);
  const { data: site = {} } = useSiteSetting();
  const { data: pricingRules = [], isLoading } = useQuery({
    queryKey: ['booking-pricing-rules', 'homepage-packages'],
    queryFn: () => getPublicPricingRules(),
    enabled: hydrated,
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    setHydrated(true);
  }, []);

  const rules = serviceOrder
    .map((serviceType) => (Array.isArray(pricingRules) ? pricingRules : []).find((rule) => rule.serviceType === serviceType))
    .filter(Boolean);

  const showLoading = !hydrated || isLoading;

  if (!showLoading && !rules.length) return null;

  const updatePackageIndex = () => {
    const track = packageTrackRef.current;
    if (!track) return;
    const cards = Array.from(track.children);
    const center = track.scrollLeft + track.clientWidth / 2;
    const nearest = cards.reduce((best, card, index) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(center - cardCenter);
      return distance < best.distance ? { index, distance } : best;
    }, { index: 0, distance: Number.POSITIVE_INFINITY });
    setActivePackageIndex(nearest.index);
  };

  return (
    <section className="section-texture relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-bg-border to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <span className="section-label">
            <Sparkles className="h-3.5 w-3.5" />
            Smart Starting Quotes
          </span>
          <h2 className="mt-5 text-display-md font-black text-text-primary md:text-display-lg">
            Pick a ready package, then book faster
          </h2>
          <p className="mt-4 text-base font-medium leading-7 text-text-secondary">
            See each service starting price and what is included in the base package. Select one, add pickup and drop details, review, verify, and confirm.
          </p>
        </motion.div>

        <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Swipe quote packages</span>
          <motion.span
            className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-white/80 px-3 py-1 text-[10px] font-bold text-text-secondary shadow-xs"
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            Drag <ArrowRight className="h-3 w-3" />
          </motion.span>
        </div>

        <div ref={packageTrackRef} onScroll={updatePackageIndex} className="scrollbar-none scroll-hint-fade -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0 lg:pb-0">
          {showLoading
            ? serviceOrder.map((serviceType) => <PackageSkeletonCard key={serviceType} serviceType={serviceType} />)
            : rules.map((rule, index) => (
              <PackageCard key={rule.serviceType} rule={rule} site={site} index={index} />
            ))}
        </div>

        {!showLoading && rules.length > 1 && (
          <div className="mt-1 flex justify-center gap-2 lg:hidden" aria-label="Quote package slide progress">
            {rules.map((rule, index) => (
              <span key={rule.serviceType} className={`h-2 rounded-full transition-all duration-300 ${index === activePackageIndex ? 'w-8 bg-primary' : 'w-2 bg-sky-200'}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PackageSkeletonCard({ serviceType }) {
  const meta = SERVICE_META[serviceType] || SERVICE_META.local_shifting;
  const Icon = meta.icon;

  return (
    <article className={`flex h-full min-h-[500px] w-[88vw] max-w-[430px] shrink-0 snap-center flex-col rounded-3xl border bg-gradient-to-br p-6 shadow-card lg:w-auto lg:max-w-none ${toneClass[meta.tone]}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="icon-surface h-14 w-14 rounded-2xl">
          <Icon className="h-7 w-7" strokeWidth={1.8} />
        </div>
        <span className="h-6 w-24 rounded-full bg-white/80 ring-1 ring-bg-border" />
      </div>
      <div className="mt-6 space-y-3">
        <div className="h-6 w-2/3 animate-pulse rounded-lg bg-white/80" />
        <div className="h-4 w-full animate-pulse rounded-lg bg-white/70" />
        <div className="h-4 w-4/5 animate-pulse rounded-lg bg-white/70" />
      </div>
      <div className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-bg-border">
        <div className="h-3 w-28 animate-pulse rounded bg-bg-muted" />
        <div className="mt-3 h-9 w-36 animate-pulse rounded-lg bg-bg-muted" />
      </div>
      <div className="mt-5 flex flex-1 flex-col gap-2">
        {[0, 1, 2].map((item) => (
          <div key={item} className="flex gap-3 rounded-2xl bg-white/75 p-3 ring-1 ring-white/80">
            <span className="h-9 w-9 shrink-0 rounded-xl bg-primary/10" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 animate-pulse rounded bg-bg-muted" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-bg-muted" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 h-12 rounded-2xl bg-primary/15" />
    </article>
  );
}

function PackageCard({ rule, site, index }) {
  const meta = SERVICE_META[rule.serviceType] || SERVICE_META.local_shifting;
  const Icon = meta.icon;
  const serviceName = site.serviceLabels?.[rule.serviceType] || meta.fallback;
  const inclusions = getInclusions(rule);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.99 }}
      className={`group relative flex h-full w-[88vw] max-w-[430px] shrink-0 snap-center flex-col overflow-hidden rounded-3xl border bg-gradient-to-br p-6 shadow-[0_22px_56px_rgba(3,105,161,.13)] transition-all duration-300 hover:border-orange-200 hover:shadow-lg lg:w-auto lg:max-w-none ${toneClass[meta.tone]}`}
    >
      {index === 0 && (
        <span className="absolute right-5 top-5 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
          Recommended
        </span>
      )}
      <Truck className="pointer-events-none absolute -right-10 bottom-24 h-20 w-20 text-sky-200/70 transition-transform duration-300 group-hover:-translate-x-4" strokeWidth={1.4} />
      <div className="flex items-start justify-between gap-4">
        <div className="icon-surface h-14 w-14 rounded-2xl">
          <Icon className="h-7 w-7" strokeWidth={1.8} />
        </div>
        <span className={`rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-text-tertiary ring-1 ring-bg-border ${index === 0 ? 'mt-8' : ''}`}>
          Starter quote
        </span>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-black text-text-primary">{serviceName}</h3>
        <p className="mt-2 text-sm font-medium leading-6 text-text-secondary">
          Start with this base package and customize later if needed.
        </p>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-bg-border transition-all duration-300 group-hover:ring-orange-100">
        <p className="text-xs font-black uppercase tracking-wider text-text-tertiary">Starting from</p>
        <div className="mt-1 flex items-end gap-2">
          <span className="text-3xl font-black text-text-primary">{formatCurrency(rule.basePrice || 0)}</span>
          <span className="pb-1 text-xs font-bold text-text-tertiary">base price</span>
        </div>
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-2">
        {inclusions.map(({ icon: ItemIcon, label, value }) => (
          <div key={label} className="flex gap-3 rounded-2xl bg-white/75 p-3 ring-1 ring-white/80 transition-all duration-300 hover:bg-white hover:ring-orange-100">
            <span className="icon-surface h-9 w-9 rounded-xl">
              <ItemIcon className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-text-tertiary">{label}</p>
              <p className="mt-0.5 text-sm font-bold text-text-primary">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <Link href={meta.href} className="mt-6">
        <button className="btn-sky flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-black active:scale-[.98] transition-transform">
          Select Package
          <ArrowRight className="h-4 w-4" />
        </button>
      </Link>
    </motion.article>
  );
}

function getInclusions(rule) {
  const isLabour = rule.serviceType === 'porter_labour_service';
  if (isLabour) {
    const truck = (rule.labourPricing?.trucks || []).find((item) => item.isFree);
    const employees = (rule.labourPricing?.employeeRates || []).filter((item) => item.isFree).sort((a, b) => Number(b.employees) - Number(a.employees))[0];
    const hours = (rule.labourPricing?.hourlyRates || []).filter((item) => item.isFree).sort((a, b) => Number(b.hours) - Number(a.hours))[0];
    return [
      { icon: Truck, label: 'Truck included', value: truck ? `${truck.name}${truck.capacityKg ? ` · ${truck.capacityKg} kg` : ''}` : 'Set in admin pricing' },
      { icon: Users, label: 'Workers included', value: employees ? `${employees.employees} employee(s)` : 'Set in admin pricing' },
      { icon: Clock, label: 'Time included', value: hours ? `${hours.hours} hour(s)` : 'Set in admin pricing' },
    ];
  }

  const freeItemCount = (rule.freeItemAllowance || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const freeDistance = (rule.distancePricing?.slabs || []).find((item) => item.isFree);
  const freeFloor = (rule.floorPricing?.slabs || []).find((item) => item.isFree);

  return [
    { icon: Boxes, label: 'Items included', value: freeItemCount ? `${freeItemCount} eligible inventory item(s)` : 'Base allowance managed in admin' },
    { icon: MapPinned, label: 'Distance included', value: freeDistance ? freeDistance.label || `${freeDistance.fromKm}-${freeDistance.toKm || '+'} km` : 'As per distance slabs' },
    { icon: CheckCircle2, label: 'Floor included', value: freeFloor ? freeFloor.label || `${freeFloor.fromFloor}-${freeFloor.toFloor || '+'} floor` : 'As per floor slabs' },
  ];
}
