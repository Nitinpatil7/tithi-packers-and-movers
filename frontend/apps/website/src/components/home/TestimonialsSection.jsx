"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MessageSquareQuote,
  Quote,
  Star,
  UserRound,
} from "lucide-react";
import { usePublicTestimonials } from "@hooks/useTestimonials";

const serviceLabels = {
  general: "General",
  local_shifting: "Local Shifting",
  intercity_moving: "Intercity Moving",
  porter_labour_service: "Labour & Vehicle",
};

function TestimonialCard({ item }) {
  return (
    <article
      className="testimonial-card group flex min-h-[342px] w-[86vw] max-w-[390px] shrink-0 flex-col justify-between rounded-3xl border border-sky-100 bg-white p-6 shadow-card transition-all duration-300 will-change-transform hover:-translate-y-1 hover:border-orange-100 hover:shadow-md active:scale-[.99] sm:w-[360px] md:p-7"
    >
      <div className="min-h-0">
        <div className="flex items-start justify-between">
          <div
            className="flex gap-1 rounded-full bg-amber-50 px-2.5 py-1 ring-1 ring-amber-100"
            aria-label={`${item.rating} out of 5 stars`}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${star <= item.rating ? "fill-amber-400 text-amber-400 drop-shadow-sm" : "text-bg-border"}`}
              />
            ))}
          </div>
          <Quote
            className="h-9 w-9 text-primary/15 transition-colors group-hover:text-orange-200"
          />
        </div>
        <p className="mt-5 text-[15px] font-medium leading-7 text-text-secondary dark:text-text-primary">
          “{item.content}”
        </p>
      </div>
      <footer className="mt-6 flex items-center justify-between gap-3 border-t border-sky-100 pt-4">
        <div className="flex min-w-0 items-center gap-3">
          {item.imageUrl ? (
            <Image
              unoptimized
              src={item.imageUrl}
              alt={item.name}
              width={52}
              height={52}
              className="h-[52px] w-[52px] shrink-0 rounded-2xl border-2 border-white object-cover shadow-md ring-2 ring-orange-100"
            />
          ) : (
            <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-2xl border-2 border-white bg-primary/5 text-primary shadow-md ring-2 ring-orange-100">
              <UserRound className="h-5 w-5" />
            </span>
          )}
          <div className="min-w-0">
            <h3 className="truncate text-sm font-black text-text-primary">
              {item.name}
            </h3>
            <p className="truncate text-xs font-semibold text-text-tertiary dark:text-text-secondary">
              {item.location || "Verified customer"}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-[9px] font-bold uppercase text-orange-600 dark:bg-orange-400/15 dark:text-orange-200 dark:border-orange-300/25">
          {serviceLabels[item.serviceType] || "General"}
        </span>
      </footer>
    </article>
  );
}

export default function TestimonialsSection() {
  const [hydrated, setHydrated] = useState(false);
  const { data = [], isLoading, isError } = usePublicTestimonials({});
  const testimonials = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const carouselItems = useMemo(() => [...testimonials, ...testimonials], [testimonials]);
  const displayLoading = !hydrated || isLoading;

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!displayLoading && (isError || testimonials.length === 0)) return null;
  const average = testimonials.length
    ? (
        testimonials.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
        testimonials.length
      ).toFixed(1)
    : "5.0";
  const publishedReviewCount = testimonials.length + 50;

  return (
    <section className="testimonials-section dotted-light-bg relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-bg-border to-transparent" />
      <Image
        src="/back_truck.png"
        alt=""
        width={420}
        height={280}
        className="pointer-events-none absolute -left-28 top-6 z-0 w-[220px] opacity-85 drop-shadow-[0_22px_34px_rgba(15,23,42,.18)] sm:-left-32 sm:w-[280px] md:w-[340px] lg:w-[420px]"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-4 text-center"
        >
          <span className="section-label bg-white/90">
            <MessageSquareQuote className="h-3.5 w-3.5 text-orange-500" />{" "}
            Verified customer reviews
          </span>
          <h2 className="mt-2 text-display-md font-black text-text-primary md:text-display-lg">
            Words of appreciation from{" "}
            <span className="text-orange-500">our customers</span>
          </h2>
          <p className="text-base font-medium leading-7 text-text-secondary dark:text-text-primary md:text-lg">
            Real experiences from families and businesses who trusted Tithi with
            their move.
          </p>
          {!displayLoading && (
            <div className="mt-2 inline-flex items-center gap-4 rounded-2xl border border-orange-100 bg-white/90 px-5 py-3 shadow-card dark:border-orange-300/25 dark:bg-sky-400/10">
              <strong className="text-2xl text-text-primary">{average}</strong>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-3.5 w-3.5 fill-orange-500 text-orange-500"
                  />
                ))}
              </div>
              <span className="border-l border-orange-100 pl-4 text-xs font-bold text-text-secondary dark:border-orange-300/25 dark:text-text-primary">
                {publishedReviewCount} published reviews
              </span>
            </div>
          )}
        </motion.header>

        {displayLoading ? (
          <div className="flex gap-5 overflow-hidden">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[280px] w-[350px] shrink-0 animate-pulse rounded-3xl border border-orange-100 bg-white/80"
              />
            ))}
          </div>
        ) : (
          <div className="testimonial-marquee relative overflow-hidden py-5">
            <div className="testimonial-fade-left pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#f8fcff] to-transparent" />
            <div className="testimonial-fade-right pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#f8fcff] to-transparent" />
            <div className="testimonial-marquee-track flex w-max gap-5 px-4">
              {carouselItems.map((item, index) => (
                <TestimonialCard
                  key={`${item._id || item.name}-${index}`}
                  item={item}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .testimonial-marquee {
          mask-image: linear-gradient(
            90deg,
            transparent,
            #000 8%,
            #000 92%,
            transparent
          );
        }

        .testimonial-marquee-track {
          animation: testimonial-scroll 34s linear infinite;
        }

        .testimonial-marquee:hover .testimonial-marquee-track,
        .testimonial-marquee:focus-within .testimonial-marquee-track {
          animation-play-state: paused;
        }

        @keyframes testimonial-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .testimonial-marquee-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
