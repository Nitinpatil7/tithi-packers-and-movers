// src/app/(website)/about/AboutClient.jsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, Milestone, Award } from 'lucide-react';
import Card from '@ui/Card';
import { useLanguageStore } from '@store/languageStore';
import { useSiteSetting } from '@hooks/useSiteSetting';

const ABOUT_TRANSLATIONS = {
  en: {
    journey: "Our Journey",
    title1: "Relocating Families & Businesses ",
    title2: "With Care",
    desc1: "Established in Surat, Gujarat, Tithi Packers and Movers has grown from a local household moving service to a full-fledged logistical relocation provider connecting Surat to cities across India.",
    desc2: "We realized that household shifting in India is often full of stress, hidden charges, and delays. Our goal is simple: to make booking your move as fast and transparent as booking a cab online. No long negotiations, just clean multi-step forms, automated estimates, and professional movers handling the heavy lifting.",
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
    title1: "परिवारों और व्यवसायों का स्थानांतरण ",
    title2: "पूरी सावधानी से",
    desc1: "सूरत, गुजरात में स्थापित, तीथि पैकर्स एंड मूवर्स एक स्थानीय घरेलू स्थानांतरण सेवा से बढ़कर सूरत को भारत के विभिन्न शहरों से जोड़ने वाला एक पूर्ण लॉजिस्टिक स्थानांतरण प्रदाता बन गया है।",
    desc2: "हमने महसूस किया कि भारत में घरेलू शिफ्टिंग अक्सर तनाव, छुपे हुए शुल्क और देरी से भरी होती है। हमारा लक्ष्य सरल है: आपकी शिफ्टिंग बुक करने की प्रक्रिया को ऑनलाइन कैब बुक करने जितना तेज़ और पारदर्शी बनाना। कोई लंबी बातचीत नहीं, बस स्पष्ट फॉर्म, स्वचालित अनुमान और भारी सामान उठाने वाले पेशेवर मूवर्स।",
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
    title1: "પરિવારો અને વ્યવસાયોનું સ્થળાંતર ",
    title2: "પૂરી કાળજી સાથે",
    desc1: "સુરત, ગુજરાતમાં સ્થપાયેલ, તીથિ પેકર્સ એન્ડ મૂવર્સ એક સ્થાનિક ઘર શિફ્ટિંગ સેવા તરીકે શરૂ થઈને આજે સુરતને ભારતના વિવિધ શહેરો સાથે જોડતી એક સંપૂર્ણ લોજિસ્ટિક્સ સ્થળાંતર સેવા બની ગઈ છે.",
    desc2: "અમે અનુભવ્યું કે ભારતમાં હોમ શિફ્ટિંગ ઘણીવાર તણાવ, છુપા ચાર્જ અને વિલંબથી ભરેલું હોય છે. અમારો ધ્યેય સરળ છે: તમારા શિફ્ટિંગ બુકિંગને ઓનલાઈન કેબ બુક કરવા જેટલું ઝડપી અને પારદર્શક બનાવવું. કોઈ લાંબી ચર્ચા નહીં, બસ સરળ ફોર્મ, ઓટોમેટેડ એસ્ટીમેટ્સ અને પ્રોફેશનલ મૂવર્સ દ્વારા સામાનનું ટ્રાન્સફર.",
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
  const { data: site = {} } = useSiteSetting();
  const aboutParagraphs = site.aboutDescription
    ? site.aboutDescription.split(/\n+/).map((paragraph) => paragraph.trim()).filter(Boolean)
    : [];

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
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-left flex flex-col gap-10">
        
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="flex flex-col gap-3">
          <span className="text-xs uppercase font-bold tracking-widest text-primary">{t.journey}</span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-text-primary">
            {site.aboutTitle || <>{t.title1}<span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">{t.title2}</span></>}
          </h1>
          <div className="w-16 h-1 bg-primary rounded-full mt-2" />
        </motion.div>

        {/* Text Details */}
        <div className="flex flex-col gap-6 text-text-secondary text-base leading-relaxed">
          {aboutParagraphs.length > 0
            ? aboutParagraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>)
            : <><p>{t.desc1}</p><p>{t.desc2}</p></>}
        </div>

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
        </Card>

      </div>
    </div>
  );
}
