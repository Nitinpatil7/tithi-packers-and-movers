'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle2, Info } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { PAGE_TRANSLATIONS } from '@/data/translations';
import { useSiteSetting } from '@/hooks/useSiteSetting';

export default function ServiceDetailSection() {
  const [activeTab, setActiveTab] = useState('local');
  const { language } = useLanguageStore();
  const t = PAGE_TRANSLATIONS[language] || PAGE_TRANSLATIONS['en'];
  const { data: site = {} } = useSiteSetting();
  const serviceLabels = site.serviceLabels || {};

  const details = {
    local: {
      name: serviceLabels.local_shifting || t.localShifting || 'Local Shifting',
      border: 'border-l-service-local',
      bgGlow: 'from-service-local/5 to-transparent',
      text: t.localShiftingText || 'Our local household relocation package takes care of moving your home or apartment within Surat city limits. Experience premium care with zero stress.',
      included: language === 'gu' ? [
        'àª¸àª¾àª®àª¾àª¨àª¨àª¾ àª•àª¦ àª®à«àªœàª¬ àª–àª¾àª¸ àª—àª¾àª¡à«€àª¨à«€ àª«àª¾àª³àªµàª£à«€',
        'àª§àª¾àª¬àª³àª¾, àª¶à«àª°àª¿àª‚àª•-àª°à«‡àªª àª…àª¨à«‡ àª®àªœàª¬à«‚àª¤ àªŸà«‡àªªàª¥à«€ àª¸à«àªŸàª¾àª¨à«àª¡àª°à«àª¡ àªªà«‡àª•àª¿àª‚àª—',
        'àª…àª¨à«àª­àªµà«€ àª…àª¨à«‡ àªµà«‡àª°à«€àª«àª¾àª‡àª¡ àª®à«‚àªµàª°à«àª¸ àª¦à«àªµàª¾àª°àª¾ àª²à«‹àª¡àª¿àª‚àª— àª…àª¨à«‡ àª…àª¨àª²à«‹àª¡àª¿àª‚àª—',
        'àª¸à«€àª²àª¿àª‚àª— àª«à«‡àª¨, àªŸà«€àªµà«€ àªµà«‹àª² àª®àª¾àª‰àª¨à«àªŸ àª…àª¨à«‡ àª«àª°à«àª¨àª¿àªšàª°àª¨à«àª‚ àª¬à«‡àªàª¿àª• àª¡àª¿àª¸àªàª¸à«‡àª®à«àª¬àª²à«€',
        'àª¨àªµàª¾ àª˜àª°àª®àª¾àª‚ àª¸àª¾àª®àª¾àª¨ àªµà«àª¯àªµàª¸à«àª¥àª¿àª¤ àªœàª—à«àª¯àª¾àª àª—à«‹àª àªµàªµà«‹',
      ] : language === 'hi' ? [
        'à¤¸à¤¾à¤®à¤¾à¤¨ à¤•à¥‡ à¤†à¤•à¤¾à¤° à¤•à¥‡ à¤…à¤¨à¥à¤¸à¤¾à¤° à¤¸à¤®à¤°à¥à¤ªà¤¿à¤¤ à¤µà¤¾à¤¹à¤¨ à¤•à¥€ à¤µà¥à¤¯à¤µà¤¸à¥à¤¥à¤¾',
        'à¤•à¤‚à¤¬à¤², à¤¶à¥à¤°à¤¿à¤‚à¤•-à¤°à¥ˆà¤ª à¤”à¤° à¤­à¤¾à¤°à¥€ à¤Ÿà¥‡à¤ª à¤•à¤¾ à¤‰à¤ªà¤¯à¥‹à¤— à¤•à¤°à¤•à¥‡ à¤®à¤¾à¤¨à¤• à¤ªà¥ˆà¤•à¥‡à¤œà¤¿à¤‚à¤—',
        'à¤…à¤¨à¥à¤­à¤µà¥€, à¤¸à¤¤à¥à¤¯à¤¾à¤ªà¤¿à¤¤ à¤®à¥‚à¤µà¤°à¥à¤¸ à¤¦à¥à¤µà¤¾à¤°à¤¾ à¤²à¥‹à¤¡à¤¿à¤‚à¤— à¤”à¤° à¤…à¤¨à¤²à¥‹à¤¡à¤¿à¤‚à¤—',
        'à¤›à¤¤ à¤•à¤¾ à¤ªà¤‚à¤–à¤¾, à¤Ÿà¥€à¤µà¥€ à¤µà¥‰à¤² à¤®à¤¾à¤‰à¤‚à¤Ÿ à¤”à¤° à¤¬à¥à¤¨à¤¿à¤¯à¤¾à¤¦à¥€ à¤«à¤°à¥à¤¨à¥€à¤šà¤° à¤–à¥‹à¤²à¤¨à¤¾/à¤œà¥‹à¤¡à¤¼à¤¨à¤¾',
        'à¤¨à¤ à¤˜à¤° à¤®à¥‡à¤‚ à¤†à¤ªà¤•à¥€ à¤¨à¤¿à¤°à¥à¤¦à¤¿à¤·à¥à¤Ÿ à¤œà¤—à¤¹à¥‹à¤‚ à¤ªà¤° à¤¬à¤¡à¤¼à¥‡ à¤¸à¤¾à¤®à¤¾à¤¨ à¤•à¥€ à¤µà¥à¤¯à¤µà¤¸à¥à¤¥à¤¾',
      ] : [
        'Dedicated loading vehicle matching your inventory size',
        'Standard packaging utilizing blankets, shrink-wrap, and heavy tape',
        'Loading and unloading by experienced, verified movers',
        'Ceiling fan, wall mount TV, and basic furniture disassembly',
        'Placement of large items at your designated spots in the new home',
      ],
      path: '/website/book/local-shifting'
    },
    intercity: {
      name: serviceLabels.intercity_moving || t.intercityMoving || 'Intercity Moving',
      border: 'border-l-service-intercity',
      bgGlow: 'from-service-intercity/5 to-transparent',
      text: t.intercityMovingText || 'Moving out of Surat? We provide full-load dedicated containers and pocket-friendly part-load (LCL) solutions connecting Surat to Mumbai, Pune, Bangalore, Delhi, Ahmedabad, and major Indian cities.',
      included: language === 'gu' ? [
        'àªŸà«àª°àª¾àª¨à«àªàª¿àªŸ àª¸à«àª°àª•à«àª·àª¾ àª®àª¾àªŸà«‡ àª¡àª¬àª² àª²à«‡àª¯àª° àª¬àª¬àª² àª°à«‡àªª àª…àª¨à«‡ àª®àªœàª¬à«‚àª¤ àª¬à«‹àª•à«àª¸ àªªà«‡àª•àª¿àª‚àª—',
        'àª¸à«àªªà«‡àª¶àª¿àª¯àª² àª•àª¨à«àªŸà«‡àª¨àª° àª…àª¥àªµàª¾ àª†àª°à«àª¥àª¿àª• àª¶à«‡àª°àª¿àª‚àª— àªŸà«àª°àª• àª¸à«àªªà«‡àª¸àª¨àª¾ àªµàª¿àª•àª²à«àªªà«‹',
        'àª¸àª¾àª®àª¾àª¨àª¨à«‹ àª¸àª‚àªªà«‚àª°à«àª£ àªŸà«àª°àª¾àª¨à«àªàª¿àªŸ àªµà«€àª®à«‹ (àª‡àª¨à«àª¸à«àª¯à«‹àª°àª¨à«àª¸) àª¹à«‡àª¨à«àª¡àª²àª¿àª‚àª—',
        'àªªàª¿àª•àª…àªª àª¥à«€ àª¡àª¿àª²àª¿àªµàª°à«€ àª¸à«àª§à«€ àª¸à«€àª§à«€ àª¡à«‹àª°-àªŸà«-àª¡à«‹àª° àª¸à«‡àªµàª¾',
        'àª¸àª¾àª®àª¾àª¨àª¨à«€ àª¸àª°àª–àª¾àª®àª£à«€ àª®àª¾àªŸà«‡ àª®à«‚àªµàª°à«àª¸ àªšà«‡àª•àª²àª¿àª¸à«àªŸàª¨à«àª‚ àªŸà«àª°à«‡àª•àª¿àª‚àª—',
      ] : language === 'hi' ? [
        'à¤ªà¤¾à¤°à¤—à¤®à¤¨ à¤¸à¥à¤°à¤•à¥à¤·à¤¾ à¤•à¥‡ à¤²à¤¿à¤ à¤¬à¤¹à¥-à¤ªà¤°à¤¤ à¤¬à¤¬à¤² à¤°à¥ˆà¤ªà¤¿à¤‚à¤— à¤”à¤° à¤­à¤¾à¤°à¥€ à¤¬à¥‰à¤•à¥à¤¸ à¤ªà¥ˆà¤•à¤¿à¤‚à¤—',
        'à¤¸à¤®à¤°à¥à¤ªà¤¿à¤¤ à¤•à¤‚à¤Ÿà¥‡à¤¨à¤° à¤µà¤¿à¤•à¤²à¥à¤ª à¤¯à¤¾ à¤•à¤¿à¤«à¤¾à¤¯à¤¤à¥€ à¤¸à¤¾à¤à¤¾ à¤Ÿà¥à¤°à¤• à¤¸à¥à¤¥à¤¾à¤¨',
        'à¤ªà¥‚à¤°à¥à¤£ à¤•à¤¾à¤°à¥à¤—à¥‹ à¤°à¤¸à¤¦ à¤¬à¥€à¤®à¤¾ à¤¹à¥ˆà¤‚à¤¡à¤²à¤¿à¤‚à¤—',
        'à¤—à¤‚à¤¤à¤µà¥à¤¯ à¤ªà¤° à¤¸à¥€à¤§à¥‡ à¤¡à¥‹à¤°-à¤Ÿà¥‚-à¤¡à¥‹à¤° à¤²à¥‹à¤¡à¤¿à¤‚à¤— à¤”à¤° à¤…à¤¨à¤²à¥‹à¤¡à¤¿à¤‚à¤—',
        'à¤‡à¤¨à¤µà¥‰à¤‡à¤¸ à¤²à¤¿à¤¸à¥à¤Ÿà¤¿à¤‚à¤— à¤¸à¥‡ à¤®à¥‡à¤² à¤–à¤¾à¤¤à¥€ à¤®à¥‚à¤µà¤°à¥à¤¸ à¤šà¥‡à¤•à¤²à¤¿à¤¸à¥à¤Ÿ à¤Ÿà¥à¤°à¥ˆà¤•à¤¿à¤‚à¤—',
      ] : [
        'Multi-layer bubble wrapping and heavy box packing for transit safety',
        'Dedicated container options or economical shared truck space',
        'Complete cargo logistics insurance handling',
        'Direct door-to-door loading and unloading at destination',
        'Movers checklist tracking matching invoice listings',
      ],
      path: '/website/book/intercity-moving'
    },
    labour: {
      name: serviceLabels.porter_labour_service || t.packingService || 'Labour & Porter Service',
      border: 'border-l-service-packing',
      bgGlow: 'from-service-packing/5 to-transparent',
      text: t.packingServiceText || 'Need help lifting heavy furniture, loading/unloading a truck, or rearranging items? Hire our experienced loaders and workers charged by the hour.',
      included: language === 'gu' ? [
        'à«§ àª¥à«€ à«« àª¤àª¾àª²à«€àª®àª¬àª¦à«àª§ àª¶à«àª°àª®àª¿àª•à«‹ / àª•àª¾àª®àª¦àª¾àª°à«‹àª¨à«€ àª«àª¾àª³àªµàª£à«€',
        'àª«àª•à«àª¤ àª®àªœà«‚àª°à«€ àª…àª¨à«‡ àª²à«‹àª¡àª¿àª‚àª—-àª…àª¨àª²à«‹àª¡àª¿àª‚àª— (àªŸà«àª°àª• àªµàª—àª°)',
        'àª•àª²àª¾àª•àª¨àª¾ àª§à«‹àª°àª£à«‡ àªªàª¾àª°àª¦àª°à«àª¶àª• àª­àª¾àªµàªªàª¤à«àª°àª• (àª•à«‹àªˆ àª›à«àªªà«‹ àªšàª¾àª°à«àªœ àª¨àª¹à«€àª‚)',
        'àª­àª¾àª°à«‡ àª«àª°à«àª¨àª¿àªšàª°, àª®àª¶à«€àª¨àª°à«€ àª•à«‡ àª¸àª¾àª®àª¾àª¨ àª¸à«àª°àª•à«àª·àª¿àª¤ àª°à«€àª¤à«‡ àª–àª¸à«‡àª¡àªµà«‹',
        'àª¸à«àª¥àª¾àª¨àª¿àª• àª®àª¦àª¦ àª®àª¾àªŸà«‡ àª¤à«àªµàª°àª¿àª¤ àª‰àªªàª²àª¬à«àª§àª¤àª¾',
      ] : language === 'hi' ? [
        '1 à¤¸à¥‡ 5 à¤ªà¥à¤°à¤¶à¤¿à¤•à¥à¤·à¤¿à¤¤ à¤¶à¥à¤°à¤®à¤¿à¤•à¥‹à¤‚ / à¤®à¤œà¤¦à¥‚à¤°à¥‹à¤‚ à¤•à¥€ à¤µà¥à¤¯à¤µà¤¸à¥à¤¥à¤¾',
        'à¤•à¥‡à¤µà¤² à¤®à¤œà¤¦à¥‚à¤°à¥€ à¤”à¤° à¤²à¥‹à¤¡à¤¿à¤‚à¤—-à¤…à¤¨à¤²à¥‹à¤¡à¤¿à¤‚à¤— (à¤¬à¤¿à¤¨à¤¾ à¤Ÿà¥à¤°à¤• à¤•à¥‡)',
        'à¤ªà¥à¤°à¤¤à¤¿ à¤˜à¤‚à¤Ÿà¥‡ à¤•à¥‡ à¤¹à¤¿à¤¸à¤¾à¤¬ à¤¸à¥‡ à¤ªà¤¾à¤°à¤¦à¤°à¥à¤¶à¥€ à¤®à¥‚à¤²à¥à¤¯ (à¤•à¥‹à¤ˆ à¤›à¥à¤ªà¤¾ à¤¶à¥à¤²à¥à¤• à¤¨à¤¹à¥€à¤‚)',
        'à¤­à¤¾à¤°à¥€ à¤«à¤°à¥à¤¨à¥€à¤šà¤°, à¤…à¤²à¤®à¤¾à¤°à¥€ à¤¯à¤¾ à¤­à¤¾à¤°à¥€ à¤¸à¤¾à¤®à¤¾à¤¨ à¤•à¥‹ à¤¸à¥à¤°à¤•à¥à¤·à¤¿à¤¤ à¤°à¥‚à¤ª à¤¸à¥‡ à¤–à¤¿à¤¸à¤•à¤¾à¤¨à¤¾',
        'à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾ à¤•à¥‡ à¤²à¤¿à¤ à¤¤à¥à¤°à¤‚à¤¤ à¤‰à¤ªà¤²à¤¬à¥à¤§à¤¤à¤¾',
      ] : [
        'Allocation of 1 to 5 trained loaders/workers',
        'Manpower only â€” loading, unloading, and lifting (no truck included)',
        'Transparent hourly pricing with zero hidden charges',
        'Safe lifting of heavy furniture, wardrobes, or heavy boxes',
        'Quick deployment for local shifting or loading tasks',
      ],
      path: '/website/book/labour-service'
    }
  };

  const current = details[activeTab];

  return (
    <section id="service-details" className="theme-navy-blueprint relative z-10 overflow-hidden border-t border-white/10 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Title */}
        <div className="mb-9 flex flex-col items-center gap-3 text-center md:mb-14">
          <h2 className="text-2xl font-black leading-tight text-white sm:text-3xl md:text-4xl">
            {t.detailsLabel || 'Service Details & Inclusions'}
          </h2>
          <div className="w-16 h-1 bg-orange-500 rounded-full" />
          <p className="mt-1 max-w-md text-sm font-medium leading-6 text-white/80 sm:text-base">
            {t.detailsSubhead || 'Click on a service below to review exactly what is included in our premium packages.'}
          </p>
        </div>

        {/* Desktop & Mobile Tab Selector */}
        <div className="mb-7 grid grid-cols-1 gap-2 rounded-2xl border border-white/10 bg-white/10 p-2 shadow-xs sm:grid-cols-3 md:mb-12">
          {Object.keys(details).map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`min-h-12 rounded-xl px-3 py-3 text-center text-xs font-black uppercase tracking-wide transition-all focus:outline-none sm:text-[11px] md:text-xs ${
                activeTab === key
                  ? 'bg-orange-500 text-white shadow-[0_14px_28px_rgba(249,81,30,.28)]'
                  : 'bg-white/95 text-text-secondary hover:bg-sky-900 hover:text-sky-200 active:bg-sky-900'
              }`}
            >
              {details[key].name}
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-[0_24px_70px_rgba(0,0,0,.22)] backdrop-blur-sm sm:p-7 md:p-8"
          >
            <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-12 lg:items-center lg:gap-8">
              
              {/* Left Column Description */}
              <div className="flex flex-col gap-5 lg:col-span-7 lg:gap-6">
                <h3 className="text-xl font-black leading-tight text-white sm:text-2xl">
                  {current.name} {t.inclusionsTitle || 'Inclusions'}
                </h3>
                <p className="text-sm font-medium leading-7 text-white/85 sm:text-base">
                  {current.text}
                </p>

                {/* Sub-services alert for Packing */}
                {activeTab === 'packing' && (
                  <div className="flex gap-2.5 bg-service-packing/5 border border-service-packing/10 rounded-lg p-3 text-xs text-service-packing">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>
                      {language === 'gu' ? 'àªªà«‡àª•àª¿àª‚àª— àª“àª¨à«àª²à«€, àª…àª¨àªªà«‡àª•àª¿àª‚àª— àª“àª¨à«àª²à«€ àª…àª¥àªµàª¾ àªªà«‡àª•àª¿àª‚àª— + àª¶àª¿àª«à«àªŸàª¿àª‚àª— àª¨àª¾ àªµàª¿àª•àª²à«àªªà«‹ àª¶àª¾àª®à«‡àª² àª›à«‡.' : language === 'hi' ? 'à¤•à¥‡à¤µà¤² à¤ªà¥ˆà¤•à¤¿à¤‚à¤—, à¤•à¥‡à¤µà¤² à¤…à¤¨à¤ªà¥ˆà¤•à¤¿à¤‚à¤—, à¤¯à¤¾ à¤ªà¥ˆà¤•à¤¿à¤‚à¤— + à¤¶à¤¿à¤«à¥à¤Ÿà¤¿à¤‚à¤— à¤•à¥‡ à¤µà¤¿à¤•à¤²à¥à¤ª à¤¶à¤¾à¤®à¤¿à¤² à¤¹à¥ˆà¤‚à¥¤' : 'Includes options for Packing Only, Unpacking Only, or Packing + Shifting (No unpacking).'}
                    </span>
                  </div>
                )}

                <div className="mt-1 sm:mt-4">
                  <Link
                    href={current.path}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-white px-7 py-3.5 text-base font-bold text-orange-600 shadow-lg transition-all duration-200 hover:bg-sky-900 hover:text-sky-200 active:scale-[0.98] sm:w-auto"
                  >
                    {t.bookThisService || 'Book This Service'}
                  </Link>
                </div>
              </div>

              {/* Right Column Inclusions Checklist */}
              <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 lg:col-span-5">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-orange-300">
                  {t.whatIsIncluded || 'What is included'}
                </h4>
                <ul className="flex flex-col gap-3">
                  {current.included.map((inc, index) => (
                    <motion.li
                      key={inc}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.055, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="theme-fill-card group flex gap-3 rounded-2xl bg-white/95 p-3 text-sm font-medium leading-6 text-text-secondary ring-1 ring-white/20 transition-all duration-300 hover:-translate-y-0.5 hover:ring-sky-300 hover:shadow-xs active:scale-[.99]"
                    >
                      <CheckCircle2 className={`w-5 h-5 shrink-0 ${
                        activeTab === 'local' ? 'text-service-local' :
                        activeTab === 'intercity' ? 'text-service-intercity' : 'text-service-packing'
                      } transition-colors group-hover:text-sky-200`} />
                      <span className="transition-colors group-hover:text-sky-100">{inc}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}

