// src/app/(website)/about/AboutClient.jsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, Milestone, Award, Building2 } from 'lucide-react';
import Card from '@tithi/ui/Card';
import { useLanguageStore } from '@tithi/store/languageStore';
import { useSiteSetting } from '@tithi/hooks/useSiteSetting';
import { sanitizeAdminHtml } from '@tithi/utils/htmlSanitizer';

const ABOUT_TRANSLATIONS = {
  en: {
    journey: "Our Journey",
    title: "About Tithi Packers & Movers",
    coreValues: "Our Core Values",
    values: [
      { title: 'Customer First', desc: 'Every relocation schedule is designed to minimize friction and provide peace of mind.' },
      { title: 'Zero Compromise Safety', desc: 'Using multi-layered bubble sheets and thick boxes to protect glass, electronics, and valuables.' },
      { title: 'Corporate Reliability', desc: 'Clear billing, transparent quote parameters, GST compliance, and verified moving drivers.' },
    ],
    hubTitle: "Corporate Logistical Hub (Surat)",
    hubDesc: "Our central office is located near Adajan, Surat, managing vehicle assignments and coordinates tracking for daily shipments traversing Gujarat and neighboring states."
  },
  hi: {
    journey: "हमारी यात्रा",
    title: "तीथि पैकर्स एंड मूवर्स के बारे में",
    coreValues: "हमारे मूल मूल्य",
    values: [
      { title: 'ग्राहक पहले', desc: 'हर स्थानांतरण शेड्यूल को परेशानी कम करने और मानसिक शांति प्रदान करने के लिए डिज़ाइन किया गया है।' },
      { title: 'सुरक्षा से कोई समझौता नहीं', desc: 'कांच, इलेक्ट्रॉनिक्स और कीमती सामान की सुरक्षा के लिए बहु-परत बबल शीट और मोटे बक्से का उपयोग।' },
      { title: 'कॉर्पोरेट विश्वसनीयता', desc: 'स्पष्ट बिलिंग, पारदर्शी उद्धरण पैरामीटर, जीएसटी अनुपालन और सत्यापित ड्राइवर।' },
    ],
    hubTitle: "कॉर्पोरेट लॉजिस्टिक हब (सूरत)",
    hubDesc: "हमारा केंद्रीय कार्यालय अडाजन, सूरत के पास स्थित है, जो गुजरात और पड़ोसी राज्यों से गुजरने वाले दैनिक शिपमेंट के लिए वाहन असाइनमेंट और ट्रैकिंग का प्रबंधन करता है।"
  },
  gu: {
    journey: "અમારી સફર",
    title: "તીથિ પેકર્સ એન્ડ મૂવર્સ વિશે",
    coreValues: "અમારા મૂળ મૂલ્યો",
    values: [
      { title: 'ગ્રાહક પ્રથમ', desc: 'દરેક શિફ્ટિંગ શેડ્યૂલ ગ્રાહકની સુવિધા વધારવા અને માનસિક શાંતિ આપવા માટે ડિઝાઇન કરવામાં આવ્યું છે।' },
      { title: 'સુરક્ષા સાથે કોઈ સમજૂતી નહીં', desc: 'કાચ, ઇલેક્ટ્રોનિક્સ અને કિંમતી સામાનની સુરક્ષા માટે મલ્ટી-લેયર બબલ શીટ્સ અને જાડા બોક્સનો ઉપયોગ।' },
      { title: 'કોર્પોરેટ વિશ્વસનીયતા', desc: 'સ્પષ્ટ બિલિંગ, પારદર્શક ભાવ પત્રક, જીએસટી કમ્પ્લાયન્સ અને વેરીફાઇડ ડ્રાઇવરો.' },
    ],
    hubTitle: "કોર્પોરેટ લોજિસ્ટિક્સ હબ (સુરત)",
    hubDesc: "અમારી મુખ્ય ઓફિસ અડાજણ, સુરત પાસે આવેલી છે, જે ગુજરાત અને આસપાસના રાજ્યોમાં દરરોજ જતા સામાન માટે ટ્રક ફાળવણી અને ટ્રેકિંગનું સંચાલન કરે છે."
  }
};

export default function AboutClient() {
  const { language } = useLanguageStore();
  const t = ABOUT_TRANSLATIONS[language] || ABOUT_TRANSLATIONS['en'];
  const [mounted, setMounted] = useState(false);
  const { data: site = {}, isLoading, isError } = useSiteSetting();
  const aboutHtml = useMemo(() => sanitizeAdminHtml(site.aboutDescription || ''), [site.aboutDescription]);
  const address = site.address || site.businessAddress || site.contactAddress || site.officeAddress || '';
  const title = site.aboutTitle || t.title;
  const showSkeleton = !mounted || isLoading;

  useEffect(() => {
    setMounted(true);
  }, []);

  const values = [
    { title: t.values[0].title, desc: t.values[0].desc, icon: Users },
    { title: t.values[1].title, desc: t.values[1].desc, icon: ShieldCheck },
    { title: t.values[2].title, desc: t.values[2].desc, icon: Award },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-page pt-32 pb-16 text-text-primary">
      <div className="pointer-events-none absolute inset-x-0 top-20 h-72 bg-[radial-gradient(circle_at_18%_20%,rgba(14,165,233,.16),transparent_34%),radial-gradient(circle_at_86%_14%,rgba(249,115,22,.10),transparent_28%)]" />
      <motion.div
        className="pointer-events-none absolute right-6 top-32 hidden h-28 w-28 rounded-[32px] border border-sky-100 bg-white/50 shadow-sky md:block"
        animate={{ rotateY: [0, 12, 0], y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-10 px-4 text-left sm:px-6 lg:px-8">
        {showSkeleton ? (
          <section className="mx-auto w-full max-w-4xl">
            <div className="h-4 w-28 animate-pulse rounded-full bg-primary/15" />
            <div className="mt-5 h-12 w-4/5 max-w-2xl animate-pulse rounded-2xl bg-bg-border/70" />
            <div className="mt-4 h-5 w-2/3 animate-pulse rounded-full bg-bg-border/60" />
            <div className="mt-12 space-y-4 rounded-3xl border border-bg-border bg-bg-white p-6 shadow-card">
              <div className="h-6 w-2/5 animate-pulse rounded-full bg-bg-border/70" />
              <div className="h-4 w-full animate-pulse rounded-full bg-bg-border/60" />
              <div className="h-4 w-11/12 animate-pulse rounded-full bg-bg-border/60" />
              <div className="h-4 w-3/4 animate-pulse rounded-full bg-bg-border/60" />
            </div>
          </section>
        ) : (
          <>
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary">
              <Building2 className="h-3.5 w-3.5" />
              {t.journey}
            </span>
            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-text-primary md:text-6xl">
              {title}
            </h1>
            <p className="max-w-2xl text-base font-semibold leading-7 text-text-secondary md:text-lg">
              Learn about the team, values and service standards behind Tithi Packers & Movers.
            </p>
          </div>
          <Card className="border border-bg-border bg-bg-white/90 p-5 shadow-card">
            <p className="text-xs font-black uppercase tracking-widest text-text-tertiary">Surat operations</p>
            <p className="mt-3 text-3xl font-black text-primary">Local + Intercity</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-text-secondary">Packing, loading, transport and labour support managed from one service team.</p>
          </Card>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08 }} className="rounded-3xl border border-bg-border bg-bg-white/95 p-5 shadow-card sm:p-7 md:p-9">
          {isError ? (
            <p className="text-sm font-semibold text-red-500">Could not load About Us content. Please try again.</p>
          ) : aboutHtml ? (
            <div className="about-content" dangerouslySetInnerHTML={{ __html: aboutHtml }} />
          ) : (
            <div className="space-y-3">
              <div className="h-5 w-2/5 rounded-full bg-bg-border/70" />
              <div className="h-4 w-full rounded-full bg-bg-border/60" />
              <div className="h-4 w-10/12 rounded-full bg-bg-border/60" />
            </div>
          )}
        </motion.section>

        {/* Values Section */}
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-text-primary uppercase tracking-wider">
            {t.coreValues}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {values.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} whileHover={{ y: -6, rotateX: 1.5 }} transition={{ duration: 0.22 }}>
                <Card className="p-5 flex h-full flex-col gap-3.5 bg-bg-white border border-bg-border/60 shadow-xs transition hover:border-primary/25 hover:shadow-sky">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-sm text-text-primary">{item.title}</span>
                    <span className="text-xs text-text-secondary leading-relaxed">{item.desc}</span>
                  </div>
                </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Surat Hub details */}
        <Card className="p-6 bg-primary/5 border border-primary/20 flex flex-col gap-3 text-sm">
          <h3 className="font-bold text-text-primary flex items-center gap-2">
            <Milestone className="w-5 h-5 text-primary" />
            {t.hubTitle}
          </h3>
          <p className="text-text-secondary leading-relaxed">
            {t.hubDesc}
          </p>
          {address && (
            <p className="flex items-start gap-2 rounded-2xl border border-primary/15 bg-bg-white/80 p-3 text-text-primary">
              <Milestone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{address}</span>
            </p>
          )}
        </Card>
          </>
        )}

      </div>
      <style jsx global>{`
        .about-content {
          max-width: 760px;
          color: var(--color-text-secondary);
          font-size: 1rem;
          line-height: 1.8;
        }
        .about-content > * + * {
          margin-top: 1rem;
        }
        .about-content h1,
        .about-content h2,
        .about-content h3,
        .about-content h4 {
          color: var(--color-text-primary);
          font-family: var(--font-heading);
          font-weight: 900;
          line-height: 1.15;
        }
        .about-content h1 {
          font-size: clamp(2rem, 5vw, 3.5rem);
          margin-top: 0.25rem;
          margin-bottom: 1rem;
        }
        .about-content h2 {
          font-size: clamp(1.6rem, 3.6vw, 2.4rem);
          margin-top: 2rem;
        }
        .about-content h3 {
          font-size: clamp(1.25rem, 2.8vw, 1.65rem);
          margin-top: 1.5rem;
        }
        .about-content p {
          color: var(--color-text-secondary);
          font-weight: 600;
          margin: 0.85rem 0 0;
        }
        .about-content ul,
        .about-content ol {
          margin-top: 1rem;
          padding-left: 1.35rem;
          color: var(--color-text-secondary);
          font-weight: 600;
        }
        .about-content ul {
          list-style: disc;
        }
        .about-content ol {
          list-style: decimal;
        }
        .about-content li + li {
          margin-top: 0.55rem;
        }
        .about-content strong,
        .about-content b {
          color: var(--color-text-primary);
          font-weight: 900;
        }
        .about-content a {
          color: var(--color-primary);
          font-weight: 800;
          text-decoration: underline;
          text-underline-offset: 4px;
        }
      `}</style>
    </div>
  );
}
