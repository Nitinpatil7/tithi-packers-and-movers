'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MessageSquareQuote, Quote, Star, UserRound } from 'lucide-react';
import { usePublicTestimonials } from '@/hooks/useTestimonials';

const serviceLabels = { general: 'General', local_shifting: 'Local Shifting', intercity_moving: 'Intercity Moving', business_relocation: 'Business Relocation', ordinary_services: 'Ordinary Services' };

function TestimonialCard({ item, active }) {
  return <article className={`flex h-[330px] w-[86vw] max-w-[370px] shrink-0 snap-center flex-col justify-between rounded-3xl border bg-bg-white p-6 transition-all duration-300 sm:w-[350px] md:p-7 ${active ? 'border-primary/30 shadow-lg sm:-translate-y-1' : 'border-bg-border shadow-card'}`}>
    <div className="min-h-0"><div className="flex items-start justify-between"><div className="flex gap-1" aria-label={`${item.rating} out of 5 stars`}>{[1,2,3,4,5].map((star) => <Star key={star} className={`h-4 w-4 ${star <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-bg-border'}`} />)}</div><Quote className="h-8 w-8 text-primary/15" /></div><p className="mt-5 line-clamp-6 text-[15px] font-medium leading-7 text-text-secondary">“{item.content}”</p></div>
    <footer className="mt-6 flex items-center justify-between gap-3 border-t border-bg-border pt-4"><div className="flex min-w-0 items-center gap-3">{item.imageUrl ? <Image unoptimized src={item.imageUrl} alt={item.name} width={44} height={44} className="h-11 w-11 shrink-0 rounded-full border border-bg-border object-cover" /> : <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-primary/20 bg-primary/5 text-primary"><UserRound className="h-5 w-5" /></span>}<div className="min-w-0"><h3 className="truncate text-sm font-bold text-text-primary">{item.name}</h3><p className="truncate text-xs font-medium text-text-tertiary">{item.location || 'Verified customer'}</p></div></div><span className="shrink-0 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[9px] font-bold uppercase text-primary">{serviceLabels[item.serviceType] || 'General'}</span></footer>
  </article>;
}

export default function TestimonialsSection() {
  const [hydrated, setHydrated] = useState(false);
  const { data = [], isLoading, isError } = usePublicTestimonials({});
  const testimonials = useMemo(() => Array.isArray(data) ? data : [], [data]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef(null);
  const displayLoading = !hydrated || isLoading;

  useEffect(() => { setHydrated(true); }, []);
  useEffect(() => { if (activeIndex >= testimonials.length) setActiveIndex(0); }, [activeIndex, testimonials.length]);
  useEffect(() => {
    if (paused || testimonials.length < 2) return;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % testimonials.length), 5000);
    return () => window.clearInterval(timer);
  }, [paused, testimonials.length]);
  useEffect(() => {
    const track = trackRef.current;
    const card = track?.children?.[activeIndex];
    if (track && card) track.scrollTo({ left: card.offsetLeft - Math.max(0, (track.clientWidth - card.clientWidth) / 2), behavior: 'smooth' });
  }, [activeIndex]);

  if (!displayLoading && (isError || testimonials.length === 0)) return null;
  const average = testimonials.length ? (testimonials.reduce((sum, item) => sum + Number(item.rating || 0), 0) / testimonials.length).toFixed(1) : '5.0';
  const previous = () => setActiveIndex((index) => index === 0 ? testimonials.length - 1 : index - 1);
  const next = () => setActiveIndex((index) => (index + 1) % testimonials.length);

  return <section className="relative overflow-hidden bg-bg-white py-24 md:py-32"><div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-bg-border to-transparent" /><div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-[50rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]" /><div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <motion.header initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mb-14 flex max-w-2xl flex-col items-center gap-4 text-center"><span className="section-label"><MessageSquareQuote className="h-3.5 w-3.5" /> Verified customer reviews</span><h2 className="mt-2 text-display-md font-black text-text-primary md:text-display-lg">What Our Customers <span className="gradient-text">Say About Us</span></h2><p className="text-base font-medium leading-7 text-text-secondary md:text-lg">Real experiences from families and businesses who trusted Tithi with their move.</p>{!displayLoading && <div className="mt-2 inline-flex items-center gap-4 rounded-2xl border border-bg-border bg-bg-section px-5 py-3"><strong className="text-2xl text-text-primary">{average}</strong><div className="flex gap-0.5">{[1,2,3,4,5].map((star) => <Star key={star} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}</div><span className="border-l border-bg-border pl-4 text-xs font-bold text-text-secondary">{testimonials.length} published reviews</span></div>}</motion.header>

    {displayLoading ? <div className="flex gap-5 overflow-hidden">{[1,2,3].map((item) => <div key={item} className="h-[280px] w-[350px] shrink-0 animate-pulse rounded-3xl border border-bg-border bg-bg-section" />)}</div> : <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}><button onClick={previous} className="absolute left-0 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-bg-border bg-bg-white text-text-primary shadow-md transition hover:border-primary hover:text-primary sm:left-2" aria-label="Previous testimonial"><ChevronLeft className="h-5 w-5" /></button><button onClick={next} className="absolute right-0 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-bg-border bg-bg-white text-text-primary shadow-md transition hover:border-primary hover:text-primary sm:right-2" aria-label="Next testimonial"><ChevronRight className="h-5 w-5" /></button><div ref={trackRef} className="scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto px-[7vw] py-4 sm:px-16">{testimonials.map((item, index) => <div key={item._id || `${item.name}-${index}`} onClick={() => setActiveIndex(index)}><TestimonialCard item={item} active={index === activeIndex} /></div>)}</div></div>}

    {!displayLoading && testimonials.length > 1 && <div className="mt-7 flex items-center justify-center gap-2" aria-label="Select testimonial">{testimonials.map((item, index) => <button key={item._id || index} onClick={() => setActiveIndex(index)} aria-label={`Show testimonial ${index + 1}`} aria-current={activeIndex === index ? 'true' : undefined} className={`h-2.5 rounded-full transition-all ${activeIndex === index ? 'w-8 bg-primary' : 'w-2.5 bg-bg-border hover:bg-text-tertiary'}`} />)}</div>}
  </div></section>;
}
