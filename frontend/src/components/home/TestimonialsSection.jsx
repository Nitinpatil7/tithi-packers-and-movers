'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MessageSquareQuote, Quote, Star, UserRound } from 'lucide-react';
import { usePublicTestimonials } from '@/hooks/useTestimonials';

const serviceLabels = { general: 'General', local_shifting: 'Local Shifting', intercity_moving: 'Intercity Moving', business_relocation: 'Business Relocation', ordinary_services: 'Ordinary Services' };

function TestimonialCard({ item, active }) {
  return <article className={`group flex h-[342px] w-[86vw] max-w-[390px] shrink-0 snap-center flex-col justify-between rounded-3xl border bg-bg-white/95 p-6 transition-all duration-300 sm:w-[360px] md:p-7 ${active ? 'border-orange-200 shadow-xl sm:-translate-y-1' : 'border-sky-100 shadow-card hover:border-orange-100 hover:-translate-y-1 hover:shadow-md active:scale-[.99]'}`}>
    <div className="min-h-0"><div className="flex items-start justify-between"><div className="flex gap-1 rounded-full bg-amber-50 px-2.5 py-1 ring-1 ring-amber-100" aria-label={`${item.rating} out of 5 stars`}>{[1,2,3,4,5].map((star) => <Star key={star} className={`h-4 w-4 ${star <= item.rating ? 'fill-amber-400 text-amber-400 drop-shadow-sm' : 'text-bg-border'}`} />)}</div><Quote className={`h-9 w-9 transition-colors ${active ? 'text-orange-300' : 'text-primary/15 group-hover:text-orange-200'}`} /></div><p className="mt-5 line-clamp-6 text-[15px] font-medium leading-7 text-text-secondary">“{item.content}”</p></div>
    <footer className="mt-6 flex items-center justify-between gap-3 border-t border-sky-100 pt-4"><div className="flex min-w-0 items-center gap-3">{item.imageUrl ? <Image unoptimized src={item.imageUrl} alt={item.name} width={52} height={52} className="h-[52px] w-[52px] shrink-0 rounded-2xl border-2 border-white object-cover shadow-md ring-2 ring-orange-100" /> : <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-2xl border-2 border-white bg-primary/5 text-primary shadow-md ring-2 ring-orange-100"><UserRound className="h-5 w-5" /></span>}<div className="min-w-0"><h3 className="truncate text-sm font-black text-text-primary">{item.name}</h3><p className="truncate text-xs font-semibold text-text-tertiary">{item.location || 'Verified customer'}</p></div></div><span className="shrink-0 rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-[9px] font-bold uppercase text-orange-600">{serviceLabels[item.serviceType] || 'General'}</span></footer>
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
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % testimonials.length), 2800);
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

  return <section className="section-texture-warm relative overflow-hidden py-20 md:py-32"><div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-bg-border to-transparent" /><div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <motion.header initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-4 text-center"><span className="section-label"><MessageSquareQuote className="h-3.5 w-3.5" /> Verified customer reviews</span><h2 className="mt-2 text-display-md font-black text-text-primary md:text-display-lg">What Our Customers <span className="gradient-text">Say About Us</span></h2><p className="text-base font-medium leading-7 text-text-secondary md:text-lg">Real experiences from families and businesses who trusted Tithi with their move.</p>{!displayLoading && <div className="mt-2 inline-flex items-center gap-4 rounded-2xl border border-orange-100 bg-white/80 px-5 py-3 shadow-card"><strong className="text-2xl text-text-primary">{average}</strong><div className="flex gap-0.5">{[1,2,3,4,5].map((star) => <Star key={star} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}</div><span className="border-l border-orange-100 pl-4 text-xs font-bold text-text-secondary">{testimonials.length} published reviews</span></div>}</motion.header>

    {displayLoading ? <div className="flex gap-5 overflow-hidden">{[1,2,3].map((item) => <div key={item} className="h-[280px] w-[350px] shrink-0 animate-pulse rounded-3xl border border-orange-100 bg-white/80" />)}</div> : <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}><button onClick={previous} className="absolute left-0 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-orange-100 bg-bg-white text-text-primary shadow-md transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 active:scale-95 sm:left-2" aria-label="Previous testimonial"><ChevronLeft className="h-5 w-5" /></button><button onClick={next} className="absolute right-0 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-orange-100 bg-bg-white text-text-primary shadow-md transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 active:scale-95 sm:right-2" aria-label="Next testimonial"><ChevronRight className="h-5 w-5" /></button><div ref={trackRef} className="scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto px-[7vw] py-5 sm:px-16">{testimonials.map((item, index) => <div key={item._id || `${item.name}-${index}`} onClick={() => setActiveIndex(index)}><TestimonialCard item={item} active={index === activeIndex} /></div>)}</div></div>}

    {!displayLoading && testimonials.length > 1 && <div className="mt-7 flex items-center justify-center gap-2" aria-label="Select testimonial">{testimonials.map((item, index) => <button key={item._id || index} onClick={() => setActiveIndex(index)} aria-label={`Show testimonial ${index + 1}`} aria-current={activeIndex === index ? 'true' : undefined} className={`h-2.5 rounded-full transition-all ${activeIndex === index ? 'w-8 bg-primary' : 'w-2.5 bg-bg-border hover:bg-text-tertiary'}`} />)}</div>}
  </div></section>;
}
