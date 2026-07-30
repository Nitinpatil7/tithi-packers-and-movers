'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Truck, Navigation, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { useSiteSetting } from '@/hooks/useSiteSetting';

export default function ServicesSection() {
  const { language } = useLanguageStore();
  const { data: site = {} } = useSiteSetting();

  const services = [
    {
      id: 'local',
      title: language === 'gu' ? 'લોકલ શિફ્ટિંગ' : language === 'hi' ? 'लोकल शिफ्टिंग' : 'Local Shifting',
      description: language === 'gu'
        ? 'સુરત શહેરની અંદર ઘર અથવા ઓફિસ શિફ્ટ. સ્થાવર ટ્રાફિક મુક્ત, ઝડપી અને ભરોસાપાત્ર.'
        : language === 'hi'
        ? 'सूरत शहर के अंदर घर या ऑफिस शिफ्ट। उसी दिन उपलब्ध, तेज़ और भरोसेमंद।'
        : 'Home or office relocation within Surat. Same-day shifting, flexible schedules with expert packers.',
      icon: Truck,
      color: '#0EA5E9',
      softBg: '#E0F2FE',
      path: '/book/local-shifting',
      features: language === 'gu'
        ? ['તે જ દિવસે ઉપલબ્ધ', 'તાલીમબદ્ધ ટીમ', 'ફ્લોર-ટુ-ફ્લોર સર્વિસ']
        : language === 'hi'
        ? ['उसी दिन उपलब्ध', 'प्रशिक्षित टीम', 'फ्लोर-टू-फ्लोर सेवा']
        : ['Same-day available', 'Trained crew', 'Floor-to-floor service'],
    },
    {
      id: 'intercity',
      title: language === 'gu' ? 'આંતર-શહેરી મૂવિંગ' : language === 'hi' ? 'इंटरसिटी मूविंग' : 'Intercity Moving',
      description: language === 'gu'
        ? 'સુરતથી ભારત ભરમાં ક્યાંય પણ નિર્વિઘ્ન શિફ્ટ. ફ્ક‍્ત-ટ્રક અથવા સસ્તા ભાગ-ભાર સાથે GPS ટ્રેકિંગ.'
        : language === 'hi'
        ? 'सूरत से पूरे भारत में कहीं भी निर्बाध स्थानांतरण। पूर्ण कंटेनर या किफायती आंशिक-लोड।'
        : 'Seamless shifting from Surat to anywhere in India. Full container or economical part-loads with GPS tracking.',
      icon: Navigation,
      color: '#0284C7',
      softBg: '#BAE6FD',
      path: '/book/intercity-moving',
      features: language === 'gu'
        ? ['સમગ્ર ભારત રૂટ', 'જીપીએસ ટ્રેકિંગ', 'કાર્ગો વીમો']
        : language === 'hi'
        ? ['अखिल भारत मार्ग', 'जीपीएस ट्रैकिंग', 'कार्गो बीमा']
        : ['Pan-India routes', 'GPS tracking', 'Cargo insurance'],
    },
    {
      id: 'labour',
      title: language === 'gu' ? 'મજૂરી અને પોર્ટર સેવા' : language === 'hi' ? 'लेबर और पोर्टर सेवा' : 'Labour & Porter Service',
      description: language === 'gu'
        ? 'ટ્રક વગર ફક્ત કુશળ કામદારો. ભારે સામાન ઉઠાવવો, ખસેડવો અથવા ગોઠવવો — કલાક પ્રમાણે ભાડું.'
        : language === 'hi'
        ? 'ट्रक के बिना सिर्फ कुशल मजदूर। भारी सामान उठाना, शिफ्ट करना या व्यवस्थित करना — प्रति घंटे भाड़ा।'
        : 'Expert manpower only — no truck needed. Lifting, shifting, or arranging heavy items. Charged per hour.',
      icon: Users,
      color: '#38BDF8',
      softBg: '#E0F2FE',
      path: '/book/labour-service',
      features: language === 'gu'
        ? ['1-5 કામદારો', 'કલાક મુજબ ભાવ', 'ઝડપી ઉપલબ્ધ']
        : language === 'hi'
        ? ['1-5 मजदूर', 'प्रति घंटा मूल्य', 'तुरंत उपलब्ध']
        : ['1–5 workers', 'Hourly pricing', 'Quick deployment'],
    },
  ];
  const serviceTitleById = {
    local: site.serviceLabels?.local_shifting,
    intercity: site.serviceLabels?.intercity_moving,
    labour: site.serviceLabels?.porter_labour_service,
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
    <section id="services" className="relative z-30 overflow-hidden bg-hero-gradient pt-20 pb-14 md:pt-24 md:pb-24">
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
            {language === 'gu' ? 'અમારી સેવાઓ' : language === 'hi' ? 'हमारी सेवाएं' : 'Our Services'}
          </span>
          <h2 className="text-display-md md:text-display-lg font-black text-text-primary">
            {language === 'gu' ? 'તમારી દરેક ' : language === 'hi' ? 'आपकी हर ' : 'Everything You Need to '}
            <span className="gradient-text">
              {language === 'gu' ? 'જરૂરત પૂરી' : language === 'hi' ? 'जरूरत पूरी' : 'Move Hassle-Free'}
            </span>
          </h2>
          <p className="max-w-xl text-base font-medium leading-7 text-text-secondary md:text-lg">
            {language === 'gu'
              ? 'સ્થાનિક, આંતર-શહેરી અથવા ફક્ત મજૂરી — ત્રણ વિશેષ સેવાઓ, તમારી જરૂરિયાત મુજબ.'
              : language === 'hi'
              ? 'स्थानीय, अंतर-शहरी या सिर्फ मजदूरी — तीन विशेष सेवाएं, आपकी जरूरत के अनुसार।'
              : 'Local, intercity, or just manpower — three specialized services tailored to exactly what you need.'}
          </p>
        </motion.div>

        {/* Services Grid — 3 columns */}
        <motion.div
          className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div key={service.id} variants={cardVariants} className="h-full">
                <Link href={service.path} className="block group h-full">
                  <motion.div
                    className="service-hover-card flex h-full min-h-[350px] cursor-pointer flex-col justify-between rounded-3xl border border-sky-100 bg-white/88 p-5 shadow-card backdrop-blur-sm transition-all duration-300 hover:border-sky-300 hover:bg-white/95 hover:shadow-[0_24px_60px_rgba(3,105,161,.18)] focus-within:border-sky-300 active:-translate-y-1 active:shadow-md sm:min-h-[370px] sm:p-6"
                    whileHover={{ y: -10, scale: 1.01 }}
                    whileTap={{ scale: 0.985, y: -2 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <div className="flex flex-col gap-5 relative z-10">
                      {/* Icon + arrow */}
                      <div className="flex items-start justify-between">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-primary-soft text-primary text-3xl shadow-sm ring-1 ring-primary/10 transition-all duration-300 group-hover:-translate-y-1 group-hover:rotate-3 group-hover:bg-sky-900 group-hover:text-sky-200 group-hover:ring-sky-200/50 group-hover:shadow-[0_18px_34px_rgba(3,105,161,.24),0_0_0_7px_rgba(14,165,233,.10)] group-hover:backdrop-blur-md group-focus-within:bg-sky-900 group-focus-within:text-sky-200 group-focus-within:ring-sky-200/50 sm:h-[60px] sm:w-[60px]">
                          <Icon className="h-7 w-7 opacity-100 transition-colors duration-300 group-hover:text-sky-200 group-focus-within:text-sky-200" strokeWidth={2.1} />
                        </div>
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary-soft text-primary opacity-100 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-sky-900 group-hover:text-sky-200"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <h3 className="text-xl font-black text-text-primary transition-colors group-hover:text-primary group-focus-within:text-primary">
                          {serviceTitleById[service.id] || service.title}
                        </h3>
                        <p className="text-sm text-text-secondary leading-relaxed font-medium">
                          {service.description}
                        </p>
                      </div>

                      {/* Feature checklist */}
                      <div className="flex flex-col gap-1.5">
                        {service.features.map((feat) => (
                          <div key={feat} className="flex items-center gap-2 rounded-xl bg-white/70 px-2 py-1.5 ring-1 ring-orange-100/70 transition group-hover:ring-orange-200">
                            <CheckCircle className="w-3.5 h-3.5 shrink-0 text-primary transition-colors group-hover:text-sky-800" />
                            <span className="text-xs font-semibold text-text-secondary sm:text-sm">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA row */}
                    <div className="flex items-center justify-between mt-6 pt-5 border-t border-bg-border relative z-10">
                      <span
                        className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 group-hover:gap-2.5 transition-all"
                        style={{ color: service.color }}
                      >
                        {language === 'gu' ? 'બુક કરો' : language === 'hi' ? 'बुक करें' : 'Book Service'}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                      <span
                        className="text-xs font-bold px-3 py-1.5 rounded-full"
                        style={{ backgroundColor: service.softBg, color: service.color }}
                      >
                        {language === 'gu' ? 'ભાવ જાણો' : language === 'hi' ? 'कोटेशन लें' : 'Get Quote'}
                      </span>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
