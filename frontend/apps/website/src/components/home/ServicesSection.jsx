'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Truck } from 'lucide-react';
import { useSiteSetting } from '@tithi/hooks/useSiteSetting';

const SERVICE_IMAGES = {
  local: '/local.png',
  intercity: '/intercity.png',
  labour: '/labour.png',
};

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
      eyebrow: 'Within Your City',
      description: 'Fast • Safe • Hassle-Free',
      image: SERVICE_IMAGES.local,
      path: '/book/local-shifting',
      labelKey: 'local_shifting',
    },
    {
      id: 'intercity',
      title: 'Intercity Moving',
      eyebrow: 'Across India',
      description: 'Your Belongings, Our Care',
      image: SERVICE_IMAGES.intercity,
      path: '/book/intercity-moving',
      labelKey: 'intercity_moving',
    },
    {
      id: 'labour',
      title: 'Labour & Vehicle',
      eyebrow: 'On Demand',
      description: 'Skilled People • Modern Vehicles',
      image: SERVICE_IMAGES.labour,
      path: '/book/labour-service',
      labelKey: 'porter_labour_service',
    },
  ];

  const serviceTitleByKey = {
    local_shifting: stableSite.serviceLabels?.local_shifting,
    intercity_moving: stableSite.serviceLabels?.intercity_moving,
    porter_labour_service: stableSite.serviceLabels?.porter_labour_service,
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 92, damping: 18 },
    },
  };

  return (
    <section id="services" className="relative z-10 overflow-x-clip overflow-y-visible bg-hero-gradient py-14 sm:py-16 lg:py-20">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-bg-border to-transparent" />
      <div className="absolute inset-0 pattern-dots opacity-60 pointer-events-none" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto flex max-w-4xl flex-col items-center gap-3 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label text-[13px]">
            <Truck className="h-3.5 w-3.5" />
            Our Services
          </span>
          <h2 className="text-display-md font-black leading-[1.08] text-text-primary md:text-display-lg">
            Everything You Need to{' '}
            <span className="gradient-text">Move Hassle-Free</span>
          </h2>
          <p className="max-w-xl text-base font-medium leading-7 text-text-secondary dark:text-text-primary md:text-lg">
            Local, intercity, or Labour & Vehicle - three specialized services tailored to exactly what you need.
          </p>
        </motion.div>

        <motion.div
          className="mx-auto mt-8 grid max-w-5xl grid-cols-3 items-stretch gap-2 sm:gap-4 lg:mt-9 lg:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              title={serviceTitleByKey[service.labelKey] || service.title}
              variants={cardVariants}
            />
          ))}
        </motion.div>

        <motion.div
          className="mt-12 grid items-center gap-8 overflow-hidden rounded-[28px] border border-sky-100 bg-white/72 px-5 py-8 shadow-[0_24px_70px_rgba(3,105,161,.13)] dark:border-sky-300/20 dark:bg-sky-400/10 sm:mt-14 sm:px-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(360px,1.18fr)] lg:gap-4 lg:px-10 lg:py-10"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="min-w-0 text-center lg:text-left">
            <h3 className="text-3xl font-black leading-[1.08] text-text-primary sm:text-4xl lg:text-5xl">
              Everything You Need to{' '}
              <span className="gradient-text block sm:inline">Move Hassle-Free</span>
            </h3>
            <span className="mx-auto mt-4 block h-1.5 w-24 rounded-full bg-orange-500 lg:mx-0" />
            <p className="mx-auto mt-5 max-w-xl text-base font-medium leading-7 text-text-secondary dark:text-text-primary lg:mx-0 lg:max-w-md">
              Local, intercity, or Labour & Vehicle - three specialized services tailored to exactly what you need.
            </p>
          </div>

          <div className="services-truck-wrap relative flex min-w-0 items-center justify-center">
            <Image
              src="/front_truck.png"
              alt="Tithi Packers and Movers truck"
              width={900}
              height={520}
              sizes="(min-width: 1280px) 650px, (min-width: 1024px) 54vw, 92vw"
              className="services-truck-image h-auto w-full max-w-[760px] object-contain drop-shadow-[0_24px_34px_rgba(15,23,42,0.22)]"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ServiceCard({ service, title, variants }) {
  const titleWords = title.split(' ');
  const orangeTitle = titleWords.pop() || title;
  const blueTitle = titleWords.join(' ') || title;

  return (
    <motion.article variants={variants} className="h-full">
      <Link
        href={service.path}
        className="service-card-link group flex h-full min-w-0 flex-col overflow-hidden rounded-t-lg border border-sky-100 bg-white/86 text-center shadow-[0_18px_48px_rgba(3,105,161,.12)] outline-none transition duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_24px_64px_rgba(3,105,161,.18)] focus-visible:ring-4 focus-visible:ring-sky-200 dark:border-sky-300/20 dark:bg-sky-400/10 dark:hover:border-sky-300/45 dark:focus-visible:ring-sky-300/25"
      >
        <span className="service-image-frame block w-full overflow-hidden rounded-t-lg bg-white p-1 dark:bg-bg-white">
          <Image
            src={service.image}
            alt=""
            width={240}
            height={240}
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 30vw, 33vw"
            className="service-card-image aspect-square w-full rounded-md object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </span>

        <span className="flex flex-1 flex-col items-center px-1.5 pb-3 pt-2 sm:px-3 sm:pb-5 sm:pt-3 lg:px-5">
          <span className="service-card-title block max-w-full text-[10px] font-black uppercase leading-tight sm:text-xs md:text-sm lg:text-base">
            <span className="text-primary">{blueTitle}</span>{' '}
            <span className="text-orange-500">{orangeTitle}</span>
          </span>

          <span className="mt-1 block min-h-[42px] text-[9px] font-bold leading-4 text-text-secondary dark:text-text-primary sm:min-h-[52px] sm:text-xs sm:leading-6 md:text-sm lg:min-h-[46px]">
            <span className="block">{service.eyebrow}</span>
            <span className="block font-medium">{service.description}</span>
          </span>

          <span className="service-book-now mt-2 inline-flex items-center justify-center gap-1 rounded-full bg-orange-500 px-2 py-1.5 text-[8px] font-black uppercase tracking-wide text-white shadow-[0_6px_14px_rgba(249,115,22,.28)] transition-all duration-200 hover:bg-orange-600 sm:mt-3 sm:gap-2 sm:px-6 sm:py-2.5 sm:text-sm">
            Book Now
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1 sm:h-4 sm:w-4" />
          </span>
        </span>
      </Link>
    </motion.article>
  );
}
