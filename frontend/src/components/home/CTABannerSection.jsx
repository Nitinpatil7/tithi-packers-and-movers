'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Phone, MessageCircle, Star } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { PAGE_TRANSLATIONS } from '@/data/translations';
import { useSiteSetting } from '@/hooks/useSiteSetting';

const MotionLink = motion(Link);

export default function CTABannerSection() {
  const { language } = useLanguageStore();
  const t = PAGE_TRANSLATIONS[language] || PAGE_TRANSLATIONS['en'];
  const { data: site = {} } = useSiteSetting();
  const phone = site.phone || '';
  const whatsapp = site.whatsappNumber || '';

  return (
    <section className="section-texture-warm relative overflow-hidden py-12 md:py-24">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-bg-border to-transparent" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="relative overflow-hidden rounded-3xl md:rounded-[2rem]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#F4511E] via-[#FF6535] to-[#D84315]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.12)_0%,transparent_60%)]" />
          <div className="absolute inset-x-0 top-8 h-px bg-white/20" />
          <div className="absolute inset-x-0 bottom-10 h-px bg-white/15" />

          {/* Dot pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }} />

          <div className="relative z-10 flex flex-col items-stretch justify-between gap-8 p-6 sm:p-8 md:flex-row md:items-center md:gap-10 md:p-16">
            {/* Left text */}
            <div className="flex max-w-xl flex-col gap-5 text-center md:text-left">
              {/* Stars */}
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-white text-white" />
                ))}
                <span className="text-white/80 text-sm font-semibold ml-1">4.9 Â· 234 {t.verifiedReviews || 'reviews'}</span>
              </div>
              
              <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl" style={{ fontFamily: 'var(--font-heading)' }}>
                {t.readyShifting || 'Ready to Start Your Shifting?'}
              </h2>
              <p className="max-w-md text-base font-medium leading-7 text-white/80 md:text-lg">
                {t.ctaSubhead || 'Fill our quick form to get a free moving estimate. Our team responds within 2 hours via WhatsApp.'}
              </p>

              <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                {[
                  t.tagFreeQuote || 'Free Quote',
                  t.tagNoFees || 'No Hidden Fees',
                  t.tagResponse || '2-Hour Response'
                ].map((tag) => (
                  <span key={tag} className="bg-white/15 text-white text-xs font-bold px-4 py-1.5 rounded-full border border-white/20">
                    âœ“ {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right CTA */}
            <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-72 md:gap-4">
              <MotionLink
                href="/website/book/local-shifting"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-primary shadow-xl transition-all hover:shadow-2xl sm:text-base md:w-auto md:px-8"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {t.btnCost || 'Calculate Moving Cost'}
                <ArrowRight className="w-5 h-5" />
              </MotionLink>

              {phone && <motion.a
                href={`tel:${phone}`}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 px-6 py-4 text-sm font-bold text-white transition-all hover:bg-white/20 sm:text-base md:w-auto md:px-8"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Phone className="w-5 h-5" />
                {language === 'gu' ? `àª•à«‰àª² àª•àª°à«‹ ${phone}` : language === 'hi' ? `à¤•à¥‰à¤² à¤•à¤°à¥‡à¤‚ ${phone}` : `Call ${phone}`}
              </motion.a>}

              {whatsapp && <motion.a
                href={`https://wa.me/${whatsapp}?text=Hi, I need a moving quote`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 px-6 py-4 text-sm font-bold text-white transition-all hover:bg-white/20 sm:text-base md:w-auto md:px-8"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle className="w-5 h-5" />
                {t.btnWhatsApp || 'WhatsApp Us'}
              </motion.a>}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

