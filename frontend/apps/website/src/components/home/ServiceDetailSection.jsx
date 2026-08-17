'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle2, Info } from 'lucide-react';
import { useLanguageStore } from '@tithi/store/languageStore';
import { PAGE_TRANSLATIONS } from '@/data/translations';
import { useSiteSetting } from '@tithi/hooks/useSiteSetting';

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
        'સામાનના કદ મુજબ ખાસ ગાડીની ફાળવણી',
        'ધાબળા, શ્રિંક-રેપ અને મજબૂત ટેપથી સ્ટાન્ડર્ડ પેકિંગ',
        'અનુભવી અને વેરીફાઇડ મૂવર્સ દ્વારા લોડિંગ અને અનલોડિંગ',
        'સીલિંગ ફેન, ટીવી વોલ માઉન્ટ અને ફર્નિચરનું બેઝિક ડિસએસેમ્બલી',
        'નવા ઘરમાં સામાન વ્યવસ્થિત જગ્યાએ ગોઠવવો',
      ] : language === 'hi' ? [
        'सामान के आकार के अनुसार समर्पित वाहन की व्यवस्था',
        'कंबल, श्रिंक-रैप और भारी टेप का उपयोग करके मानक पैकेजिंग',
        'अनुभवी, सत्यापित मूवर्स द्वारा लोडिंग और अनलोडिंग',
        'छत का पंखा, टीवी वॉल माउंट और बुनियादी फर्नीचर खोलना/जोड़ना',
        'नए घर में आपकी निर्दिष्ट जगहों पर बड़े सामान की व्यवस्था',
      ] : [
        'Dedicated loading vehicle matching your inventory size',
        'Standard packaging utilizing blankets, shrink-wrap, and heavy tape',
        'Loading and unloading by experienced, verified movers',
        'Ceiling fan, wall mount TV, and basic furniture disassembly',
        'Placement of large items at your designated spots in the new home',
      ],
      path: '/book/local-shifting'
    },
    intercity: {
      name: serviceLabels.intercity_moving || t.intercityMoving || 'Intercity Moving',
      border: 'border-l-service-intercity',
      bgGlow: 'from-service-intercity/5 to-transparent',
      text: t.intercityMovingText || 'Moving out of Surat? We provide full-load dedicated containers and pocket-friendly part-load (LCL) solutions connecting Surat to Mumbai, Pune, Bangalore, Delhi, Ahmedabad, and major Indian cities.',
      included: language === 'gu' ? [
        'ટ્રાન્ઝિટ સુરક્ષા માટે ડબલ લેયર બબલ રેપ અને મજબૂત બોક્સ પેકિંગ',
        'સ્પેશિયલ કન્ટેનર અથવા આર્થિક શેરિંગ ટ્રક સ્પેસના વિકલ્પો',
        'સામાનનો સંપૂર્ણ ટ્રાન્ઝિટ વીમો (ઇન્સ્યોરન્સ) હેન્ડલિંગ',
        'પિકઅપ થી ડિલિવરી સુધી સીધી ડોર-ટુ-ડોર સેવા',
        'સામાનની સરખામણી માટે મૂવર્સ ચેકલિસ્ટનું ટ્રેકિંગ',
      ] : language === 'hi' ? [
        'पारगमन सुरक्षा के लिए बहु-परत बबल रैपिंग और भारी बॉक्स पैकिंग',
        'समर्पित कंटेनर विकल्प या किफायती साझा ट्रक स्थान',
        'पूर्ण कार्गो रसद बीमा हैंडलिंग',
        'गंतव्य पर सीधे डोर-टू-डोर लोडिंग और अनलोडिंग',
        'इनवॉइस लिस्टिंग से मेल खाती मूवर्स चेकलिस्ट ट्रैकिंग',
      ] : [
        'Multi-layer bubble wrapping and heavy box packing for transit safety',
        'Dedicated container options or economical shared truck space',
        'Complete cargo logistics insurance handling',
        'Direct door-to-door loading and unloading at destination',
        'Movers checklist tracking matching invoice listings',
      ],
      path: '/book/intercity-moving'
    },
    labour: {
      name: serviceLabels.porter_labour_service || t.packingService || 'Labour & Porter Service',
      border: 'border-l-service-packing',
      bgGlow: 'from-service-packing/5 to-transparent',
      text: t.packingServiceText || 'Need help lifting heavy furniture, loading/unloading a truck, or rearranging items? Hire our experienced loaders and workers charged by the hour.',
      included: language === 'gu' ? [
        '૧ થી ૫ તાલીમબદ્ધ શ્રમિકો / કામદારોની ફાળવણી',
        'ફક્ત મજૂરી અને લોડિંગ-અનલોડિંગ (ટ્રક વગર)',
        'કલાકના ધોરણે પારદર્શક ભાવપત્રક (કોઈ છુપો ચાર્જ નહીં)',
        'ભારે ફર્નિચર, મશીનરી કે સામાન સુરક્ષિત રીતે ખસેડવો',
        'સ્થાનિક મદદ માટે ત્વરિત ઉપલબ્ધતા',
      ] : language === 'hi' ? [
        '1 से 5 प्रशिक्षित श्रमिकों / मजदूरों की व्यवस्था',
        'केवल मजदूरी और लोडिंग-अनलोडिंग (बिना ट्रक के)',
        'प्रति घंटे के हिसाब से पारदर्शी मूल्य (कोई छुपा शुल्क नहीं)',
        'भारी फर्नीचर, अलमारी या भारी सामान को सुरक्षित रूप से खिसकाना',
        'स्थानीय सहायता के लिए तुरंत उपलब्धता',
      ] : [
        'Allocation of 1 to 5 trained loaders/workers',
        'Manpower only — loading, unloading, and lifting (no truck included)',
        'Transparent hourly pricing with zero hidden charges',
        'Safe lifting of heavy furniture, wardrobes, or heavy boxes',
        'Quick deployment for local shifting or loading tasks',
      ],
      path: '/book/labour-service'
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
                      {language === 'gu' ? 'પેકિંગ ઓન્લી, અનપેકિંગ ઓન્લી અથવા પેકિંગ + શિફ્ટિંગ ના વિકલ્પો શામેલ છે.' : language === 'hi' ? 'केवल पैकिंग, केवल अनपैकिंग, या पैकिंग + शिफ्टिंग के विकल्प शामिल हैं।' : 'Includes options for Packing Only, Unpacking Only, or Packing + Shifting (No unpacking).'}
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

