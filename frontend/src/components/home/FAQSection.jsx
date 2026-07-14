'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { PAGE_TRANSLATIONS } from '@/data/translations';
import { useFaqDetail, useFaqs } from '@/hooks/useFaq';
import { useSiteSetting } from '@/hooks/useSiteSetting';

export default function FAQSection() {
  const [openId, setOpenId] = useState(null);
  const { language } = useLanguageStore();
  const t = PAGE_TRANSLATIONS[language] || PAGE_TRANSLATIONS['en'];
  const { data: apiFaqs = [], isLoading, isError } = useFaqs();
  const { data: openFaqDetail } = useFaqDetail(openId, Boolean(openId));
  const { data: site = {} } = useSiteSetting();
  const phone = site.phone || '';

  const faqs = !isError && Array.isArray(apiFaqs) ? apiFaqs : [];

  const toggleFAQ = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-24 md:py-32 bg-bg-section relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-bg-border to-transparent" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <motion.div
          className="flex flex-col items-center text-center mb-14 gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">
            <HelpCircle className="w-3.5 h-3.5" />
            {language === 'gu' ? 'પ્રશ્નો' : language === 'hi' ? 'एफएक्यू' : 'FAQs'}
          </span>
          <h2 className="text-display-md md:text-display-lg font-black text-text-primary mt-2">
            {t.faqTitle || 'Frequently Asked '}{' '}
            <span className="gradient-text">{t.faqTitleHighlight || 'Questions'}</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-xl leading-relaxed font-medium">
            {t.faqSubhead || 'Find answers about packing materials, quote valuations, transit safety, and more.'}
          </p>
        </motion.div>

        {/* FAQs Accordion */}
        <div className="flex flex-col gap-3">
          {isLoading && [0, 1, 2].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-2xl border border-sky-100 bg-white" />
          ))}
          {!isLoading && faqs.length === 0 && (
            <div className="rounded-2xl border border-sky-100 bg-white p-8 text-center text-sm font-medium text-text-secondary">
              FAQs are being updated. Please check back shortly.
            </div>
          )}
          {!isLoading && faqs.map((faq, idx) => {
            const isOpen = openId === faq._id;
            const displayedFaq = isOpen && openFaqDetail?._id === faq._id ? openFaqDetail : faq;

            return (
              <motion.div
                key={faq._id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'border-primary/30 bg-white shadow-md'
                    : 'border-bg-border bg-white hover:border-primary/20 hover:shadow-xs'
                }`}
              >
                {/* Accordion Trigger */}
                <button
                  onClick={() => toggleFAQ(faq._id)}
                  className="w-full flex items-center justify-between text-left focus:outline-none p-6 gap-4"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      isOpen ? 'bg-primary text-white' : 'bg-primary-soft text-primary'
                    }`}>
                      <HelpCircle className="w-4.5 h-4.5" />
                    </div>
                    <span className={`text-base md:text-lg font-bold leading-snug transition-colors ${
                      isOpen ? 'text-primary' : 'text-text-primary'
                    }`}>
                      {faq.question}
                    </span>
                  </div>

                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className={`shrink-0 transition-colors ${isOpen ? 'text-primary' : 'text-text-tertiary'}`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>

                {/* Accordion Content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pl-6 sm:pl-[72px]">
                        <p className="text-base text-text-secondary leading-relaxed font-medium text-left">
                          {displayedFaq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* CTA below FAQs */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-text-secondary font-medium mb-4">
            {t.faqCTA || "Didn't find your answer?"}
          </p>
          {phone && <a
            href={`tel:${phone}`}
            className="inline-flex items-center gap-2 btn-orange px-8 py-3.5 rounded-2xl font-bold text-sm"
          >
            {language === 'gu' ? `હમણાં કૉલ કરો — ${phone}` : language === 'hi' ? `अभी कॉल करें — ${phone}` : `Call Us Now — ${phone}`}
          </a>}
        </motion.div>
      </div>
    </section>
  );
}
