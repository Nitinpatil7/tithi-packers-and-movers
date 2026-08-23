'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Truck, Navigation, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { useSiteSetting } from '@tithi/hooks/useSiteSetting';

export default function ServicesSection() {
  const { data: site = {} } = useSiteSetting();
  const [hydrated, setHydrated] = useState(false);
  const stableSite = hydrated ? site : {};

  useEffect(() => {
    setHydrated(true);
  }, []);

  const services = [
    {
      id: 'local',
      title: 'Local Shifting',
      description: 'Home or office relocation within Surat. Same-day shifting, flexible schedules with expert packers.',
      icon: Truck,
      color: '#0EA5E9',
      softBg: '#E0F2FE',
      path: '/book/local-shifting',
      features: ['Same-day available', 'Trained crew', 'Floor-to-floor service'],
    },
    {
      id: 'intercity',
      title: 'Intercity Moving',
      description: 'Seamless shifting from Surat to anywhere in India. Full container or economical part-loads with GPS tracking.',
      icon: Navigation,
      color: '#0284C7',
      softBg: '#BAE6FD',
      path: '/book/intercity-moving',
      features: ['Pan-India routes', 'GPS tracking', 'Cargo insurance'],
    },
    {
      id: 'labour',
      title: 'Labour & Porter Service',
      description: 'Expert manpower only, no truck needed. Lifting, shifting, or arranging heavy items. Charged per hour.',
      icon: Users,
      color: '#38BDF8',
      softBg: '#E0F2FE',
      path: '/book/labour-service',
      features: ['1-5 workers', 'Hourly pricing', 'Quick deployment'],
    },
  ];
  const serviceTitleById = {
    local: stableSite.serviceLabels?.local_shifting,
    intercity: stableSite.serviceLabels?.intercity_moving,
    labour: stableSite.serviceLabels?.porter_labour_service,
  };
  const [activeServiceId, setActiveServiceId] = useState('local');
  const [mobileServiceIndex, setMobileServiceIndex] = useState(0);
  const mobileTrackRef = useRef(null);
  const activeService = services.find((service) => service.id === activeServiceId) || services[0];
  const ActiveIcon = activeService.icon;

  const updateMobileServiceIndex = () => {
    const track = mobileTrackRef.current;
    if (!track) return;
    const cards = Array.from(track.children);
    const center = track.scrollLeft + track.clientWidth / 2;
    const nearest = cards.reduce((best, card, index) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(center - cardCenter);
      return distance < best.distance ? { index, distance } : best;
    }, { index: 0, distance: Number.POSITIVE_INFINITY });
    setMobileServiceIndex(nearest.index);
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 80, damping: 15 },
    },
  };

  return (
    <section id="services" className="relative z-10 overflow-x-clip overflow-y-visible bg-hero-gradient pt-28 pb-14 md:pt-28 md:pb-24">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-bg-border to-transparent" />
      <div className="absolute inset-0 pattern-dots opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <motion.div
          className="flex flex-col items-center text-center mb-10 gap-3 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label text-[13px]">
            <Truck className="w-3.5 h-3.5" />
            Our Services
          </span>
          <h2 className="text-display-md md:text-display-lg font-black text-text-primary">
            Everything You Need to{' '}
            <span className="gradient-text">
              Move Hassle-Free
            </span>
          </h2>
          <p className="max-w-xl text-base font-medium leading-7 text-text-secondary dark:text-text-primary md:text-lg">
            Local, intercity, or just manpower - three specialized services tailored to exactly what you need.
          </p>
        </motion.div>

        {/* Services discovery */}
        <motion.div
          className="hidden grid-cols-[0.86fr_1.14fr] gap-6 md:grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className="flex flex-col gap-3">
            {services.map((service, index) => {
              const Icon = service.icon;
              const isActive = activeService.id === service.id;
              return (
                <motion.button
                  key={service.id}
                  type="button"
                  variants={cardVariants}
                  onMouseEnter={() => setActiveServiceId(service.id)}
                  onFocus={() => setActiveServiceId(service.id)}
                  onClick={() => setActiveServiceId(service.id)}
                  className={`service-hover-card group rounded-3xl border p-4 text-left shadow-card transition-all duration-300 will-change-transform ${isActive ? 'border-sky-300 bg-white shadow-[0_24px_56px_rgba(3,105,161,.16)]' : 'border-sky-100 bg-white/82 hover:border-sky-300 hover:bg-white'}`}
                  whileHover={{ y: -6, rotateX: 1.4, rotateY: -1.8 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <span className="icon-surface h-14 w-14 rounded-2xl" data-active={isActive ? 'true' : undefined}>
                      <Icon className="h-7 w-7" strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-orange-500">0{index + 1}</span>
                      <span className="mt-1 block text-lg font-black text-text-primary transition-colors group-hover:text-sky-900 dark:group-hover:text-text-primary">
                        {serviceTitleById[service.id] || service.title}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-sm font-medium leading-6 text-text-secondary dark:text-text-primary">
                        {service.description}
                      </span>
                    </span>
                    <ArrowRight className="h-5 w-5 shrink-0 text-primary transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </motion.button>
              );
            })}
          </div>

          <motion.div
            key={activeService.id}
            initial={{ opacity: 0, x: 24, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="services-detail-card relative overflow-visible rounded-[32px] border border-sky-100 bg-white p-7 shadow-[0_28px_80px_rgba(3,105,161,.16)]"
          >
            <div className="absolute inset-0 services-panel-route opacity-90" />
            <div className="relative z-10 grid grid-cols-[0.95fr_1.05fr] items-center gap-6">
              <div>
                <span className="services-active-badge inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-primary ring-1 ring-sky-100">
                  <ActiveIcon className="h-3.5 w-3.5" />
                  Active service
                </span>
                <h3 className="mt-5 text-3xl font-black leading-tight text-text-primary">
                  {serviceTitleById[activeService.id] || activeService.title}
                </h3>
                <p className="mt-4 text-base font-medium leading-7 text-text-secondary dark:text-text-primary">
                  {activeService.description}
                </p>
                <div className="mt-6 flex flex-col gap-2">
                  {activeService.features.map((feat, index) => (
                    <motion.div
                      key={feat}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06, duration: 0.25 }}
                      className="services-feature-pill flex items-center gap-2 rounded-2xl bg-sky-50/80 px-3 py-2 text-sm font-bold text-sky-900 ring-1 ring-sky-100"
                    >
                      <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                      {feat}
                    </motion.div>
                  ))}
                </div>
                <Link
                  href={activeService.path}
                  className="btn-sky group/btn mt-7 inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black"
                >
                  Book Service
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>

              <div className="relative grid min-h-[300px] place-items-center">
                <motion.div
                  className="services-orbit absolute h-64 w-64 rounded-full border border-dashed border-orange-300/70"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="services-icon-aura absolute h-44 w-44 rounded-full bg-sky-100/80"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="icon-surface relative h-32 w-32 rounded-[28px]" data-active="true">
                  <ActiveIcon className="h-14 w-14 text-sky-100" strokeWidth={1.6} />
                </div>
                <div className="services-fast-quote absolute bottom-4 right-0 rounded-2xl border border-orange-100 bg-white px-4 py-3 text-xs font-black uppercase tracking-wider text-orange-600 shadow-card">
                  Fast quote
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="md:hidden">
          <div className="scroll-hint-fade relative -mx-4">
            <div ref={mobileTrackRef} onScroll={updateMobileServiceIndex} className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Link key={service.id} href={service.path} className="block w-[88vw] max-w-[430px] shrink-0 snap-center">
                  <motion.div
                    className="service-hover-card group flex h-auto flex-col justify-between rounded-3xl border border-sky-100 bg-white p-6 shadow-[0_22px_56px_rgba(3,105,161,.13)] will-change-transform"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ delay: index * 0.08, duration: 0.45 }}
                    whileTap={{ scale: 0.985, y: -3 }}
                  >
                    <div className="relative z-10">
                      <div className="flex items-start justify-between">
                        <div className="icon-surface h-14 w-14 rounded-2xl" data-active="true">
                          <Icon className="h-7 w-7" strokeWidth={1.8} />
                        </div>
                        <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black text-orange-600 ring-1 ring-orange-100 dark:bg-orange-400/15 dark:text-orange-200 dark:ring-orange-300/20">0{index + 1}</span>
                      </div>
                      <h3 className="mt-5 text-xl font-black text-text-primary">{serviceTitleById[service.id] || service.title}</h3>
                      <p className="mt-3 text-sm font-medium leading-7 text-text-secondary dark:text-text-primary">{service.description}</p>
                      <div className="mt-5 flex flex-col gap-2">
                        {service.features.map((feat) => (
                          <span key={feat} className="rounded-2xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-900 ring-1 ring-sky-100 dark:bg-sky-400/15 dark:text-text-primary dark:ring-sky-300/20">
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="relative z-10 mt-6 inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider text-primary">
                      Book Service
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </motion.div>
                </Link>
              );
            })}
            </div>
          </div>
          <div className="mt-2 flex justify-center gap-2" aria-label="Service slide progress">
            {services.map((service, index) => (
              <span key={service.id} className={`h-2 rounded-full transition-all duration-300 ${index === mobileServiceIndex ? 'w-8 bg-primary' : 'w-2 bg-sky-200'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

