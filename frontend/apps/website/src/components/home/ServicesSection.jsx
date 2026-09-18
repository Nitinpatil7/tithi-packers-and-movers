'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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

  return (
    <section id="services" className="relative z-10 overflow-x-clip overflow-y-visible bg-hero-gradient py-14 sm:py-16 lg:py-20">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-bg-border to-transparent" />
      <div className="absolute inset-0 pattern-dots opacity-60 pointer-events-none" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        <div
          className="order-1 mx-auto flex max-w-4xl flex-col items-center gap-3 text-center"
        >
          <span className="section-label text-[13px]">
            <Truck className="h-3.5 w-3.5" />
            Our Services
          </span>
          <h2 className="text-display-md font-black leading-[1.08] text-text-primary md:text-display-lg">
            Safe Moves for a
            <span className="gradient-text">Better Tomorrow</span>
          </h2>
          <p className="max-w-xl text-base font-medium leading-7 text-text-secondary dark:text-text-primary md:text-lg">
            Reliable • Affordable • Pan India Service
          </p>
        </div>

        <div
          className="order-2 mx-auto mt-8 grid max-w-5xl grid-cols-3 items-stretch gap-2 sm:gap-4 lg:order-2 lg:mt-8 lg:max-w-6xl lg:gap-6 xl:max-w-7xl"
        >
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              title={serviceTitleByKey[service.labelKey] || service.title}
            />
          ))}
        </div>

        <div
          className="order-3 mt-8 grid items-center gap-6 px-5 py-6 sm:mt-10 sm:px-8 lg:relative lg:isolate lg:order-3 lg:mt-8 lg:min-h-[410px] lg:grid-cols-[minmax(360px,0.78fr)_minmax(0,1.22fr)] lg:gap-0 lg:px-0 lg:py-0 xl:min-h-[460px] xl:grid-cols-[minmax(440px,0.78fr)_minmax(0,1.22fr)]"
        >
          <div className="relative z-10 min-w-0 text-center lg:col-start-1 lg:row-start-1 lg:pl-2 lg:text-left xl:pl-0">
            <h3 className="text-3xl font-black leading-[1.08] text-text-primary sm:text-4xl lg:text-5xl xl:text-[3.35rem]">
              Everything You Need to{' '}
              <span className="gradient-text block sm:inline">Move Hassle-Free</span>
            </h3>
            <span className="mx-auto mt-4 block h-1.5 w-24 rounded-full bg-orange-500 lg:mx-0" />
            <p className="mx-auto mt-5 max-w-xl text-base font-medium leading-7 text-text-secondary dark:text-text-primary lg:mx-0 lg:max-w-md">
              Local, intercity, or Labour & Vehicle - three specialized services tailored to exactly what you need.
            </p>
          </div>

          <div className="services-truck-wrap group relative -mx-9 flex items-center justify-center overflow-hidden pt-3 sm:mx-0 sm:w-auto lg:z-0 lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:-mx-[calc(50vw_-_50%)] lg:min-h-[410px] lg:justify-end lg:overflow-hidden lg:pt-0 xl:min-h-[470px]">
            <Image
              src="/front_truck_v2.png"
              alt="Tithi Packers and Movers truck"
              width={900}
              height={520}
              sizes="100vw"
              loading="lazy"
              className="services-truck-image h-auto w-full max-w-none object-cover sm:max-w-[760px] sm:object-contain lg:w-[68vw] lg:max-w-none xl:w-[66vw]"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .services-truck-wrap::before,
        .services-truck-wrap::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          z-index: 2;
          width: 20%;
          pointer-events: none;
        }

        .services-truck-wrap::before {
          left: 0;
          background: linear-gradient(90deg, #effaff 0%, rgba(239, 250, 255, 0.78) 48%, rgba(239, 250, 255, 0) 100%);
        }

        .services-truck-wrap::after {
          right: 0;
          background: linear-gradient(270deg, #dff5ff 0%, rgba(223, 245, 255, 0.74) 48%, rgba(223, 245, 255, 0) 100%);
        }

        .services-truck-wrap::after {
          top: -6%;
          bottom: -10%;
        }

        :global(.dark) .services-truck-wrap::before {
          background: linear-gradient(90deg, #06101d 0%, rgba(6, 16, 29, 0.78) 48%, rgba(6, 16, 29, 0) 100%);
        }

        :global(.dark) .services-truck-wrap::after {
          background: linear-gradient(270deg, #082c43 0%, rgba(8, 44, 67, 0.68) 46%, rgba(8, 44, 67, 0) 100%);
        }

        @media (min-width: 640px) {
          .services-truck-wrap::before,
          .services-truck-wrap::after {
            width: 16%;
          }
        }

        @media (min-width: 1024px) {
          .services-truck-wrap::before {
            width: 30%;
          }

          .services-truck-wrap::after {
            width: 20%;
            background: linear-gradient(270deg, #dff5ff 0%, rgba(223, 245, 255, 0.9) 34%, rgba(223, 245, 255, 0) 100%);
          }
        }
      `}</style>
    </section>
  );
}

function ServiceCard({ service, title }) {
  const titleWords = title.split(' ');
  const orangeTitle = titleWords.pop() || title;
  const blueTitle = titleWords.join(' ') || title;

  return (
    <article className="h-full">
      <Link
        href={service.path}
        className="service-card-link group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-sky-100 bg-white/86 text-center shadow-[0_14px_34px_rgba(3,105,161,.10)] outline-none transition-colors duration-200 hover:border-sky-300 focus-visible:ring-4 focus-visible:ring-sky-200 dark:border-sky-300/20 dark:bg-sky-400/10 dark:hover:border-sky-300/45 dark:focus-visible:ring-sky-300/25 lg:rounded-xl"
      >
        <span className="service-image-frame block w-full overflow-hidden rounded-t-lg bg-white p-1 dark:bg-bg-white lg:h-40 xl:h-44">
          <Image
            src={service.image}
            alt=""
            width={240}
            height={240}
            loading="lazy"
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 30vw, 33vw"
            className="service-card-image aspect-square w-full rounded-md object-cover lg:h-full lg:aspect-auto"
          />
        </span>

        <span className="flex flex-1 flex-col items-center px-1.5 pb-3 pt-2 sm:px-3 sm:pb-5 sm:pt-3 lg:px-4 lg:pb-4">
          <span className="service-card-title flex min-h-[2.5em] max-w-full flex-wrap items-center justify-center gap-x-1 text-[10px] font-black uppercase leading-tight sm:text-xs md:text-sm lg:text-base">
            <span className="text-primary">{blueTitle}</span>{' '}
            <span className="text-orange-500">{orangeTitle}</span>
          </span>

          <span className="mt-1 block min-h-[42px] text-[9px] font-bold leading-4 text-text-secondary dark:text-text-primary sm:min-h-[52px] sm:text-xs sm:leading-6 md:text-sm lg:min-h-[44px]">
            <span className="block">{service.eyebrow}</span>
            <span className="block font-medium">{service.description}</span>
          </span>

          <span className="service-book-now mt-auto inline-flex items-center justify-center gap-1 rounded-full bg-orange-500 px-2 py-1.5 text-[8px] font-black uppercase tracking-wide text-white shadow-[0_6px_14px_rgba(249,115,22,.24)] transition-colors duration-200 hover:bg-orange-600 sm:gap-2 sm:px-6 sm:py-2.5 sm:text-sm">
            Book Now
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </span>
        </span>
      </Link>
    </article>
  );
}
