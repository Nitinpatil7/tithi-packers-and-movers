// src/app/(website)/contact/ContactClient.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, MessageSquare, Send, Clock } from 'lucide-react';
import Card from '@tithi/ui/Card';
import Input from '@tithi/ui/Input';
import Button from '@tithi/ui/Button';
import toast from 'react-hot-toast';
import { useLanguageStore } from '@tithi/store/languageStore';
import { submitContact } from '@tithi/lib/contactApi';
import { useSiteSetting } from '@tithi/hooks/useSiteSetting';
import { useBranches, useMainBranch } from '@tithi/hooks/useBranches';

const CONTACT_TRANSLATIONS = {
  en: {
    tag: "Get In Touch",
    title: "Contact Tithi Movers",
    successMsg: "Your message has been sent successfully. We will get back to you shortly.",
    sendMsg: "Send Us a Message",
    labelName: "Your Name",
    phName: "Enter your full name",
    labelPhone: "Mobile Number",
    phPhone: "Enter 10-digit mobile",
    labelEmail: "Email Address",
    phEmail: "Enter email address",
    labelMsg: "Message Content",
    phMsg: "Describe your shifting requirements or ask a question...",
    btnSend: "Send Message",
    corpOffice: "Corporate Office",
    detailLabels: {
      call: 'Call Office',
      email: 'Email Support',
      hub: 'Main Shifting Hub',
      hours: 'Office Hours'
    },
    detailValues: {
      hub: 'Adajan, Surat, Gujarat 395009',
      hours: '7:00 AM – 9:00 PM (Daily)'
    }
  },
  hi: {
    tag: "संपर्क करें",
    title: "तीथि मूवर्स से संपर्क करें",
    successMsg: "आपका संदेश सफलतापूर्वक भेज दिया गया है। हम जल्द ही आपसे संपर्क करेंगे।",
    sendMsg: "हमें एक संदेश भेजें",
    labelName: "आपका नाम",
    phName: "अपना पूरा नाम दर्ज करें",
    labelPhone: "मोबाइल नंबर",
    phPhone: "10-अंकीय मोबाइल दर्ज करें",
    labelEmail: "ईमेल पता",
    phEmail: "ईमेल पता दर्ज करें",
    labelMsg: "संदेश सामग्री",
    phMsg: "अपनी शिफ्टिंग आवश्यकताओं का वर्णन करें या कोई प्रश्न पूछें...",
    btnSend: "संदेश भेजें",
    corpOffice: "कॉर्पोरेट कार्यालय",
    detailLabels: {
      call: 'कार्यालय को कॉल करें',
      email: 'ईमेल समर्थन',
      hub: 'मुख्य शिफ्टिंग हब',
      hours: 'कार्यालय का समय'
    },
    detailValues: {
      hub: 'अडाजन, सूरत, गुजरात 395009',
      hours: 'सुबह 7:00 – रात 9:00 (प्रतिदिन)'
    }
  },
  gu: {
    tag: "સંપર્ક કરો",
    title: "તીથિ મૂવર્સનો સંપર્ક કરો",
    successMsg: "તમારો સંદેશ સફળતાપૂર્વક મોકલવામાં આવ્યો છે. અમે ટૂંક સમયમાં તમારો સંપર્ક કરીશું.",
    sendMsg: "અમને સંદેશ મોકલો",
    labelName: "તમારું નામ",
    phName: "તમારું આખું નામ લખો",
    labelPhone: "મોબાઈલ નંબર",
    phPhone: "૧૦-આંકડાનો મોબાઈલ લખો",
    labelEmail: "ઇમેઇલ સરનામું",
    phEmail: "ઇમેઇલ સરનામું લખો",
    labelMsg: "સંપર્ક વિગત",
    phMsg: "તમારી શિફ્ટિંગ જરૂરિયાતો વર્ણવો અથવા પ્રશ્ન પૂછો...",
    btnSend: "સંદેશ મોકલો",
    corpOffice: "કોર્પોરેટ ઓફિસ",
    detailLabels: {
      call: 'ઓફિસ ફોન',
      email: 'ઇમેઇલ સપોર્ટ',
      hub: 'મુખ્ય શિફ્ટિંગ હબ',
      hours: 'ઓફિસનો સમય'
    },
    detailValues: {
      hub: 'અડાજણ, સુરત, ગુજરાત ૩૯૫૦૦૯',
      hours: 'સવારે ૭:૦૦ થી રાત્રે ૯:૦૦ (દરરોજ)'
    }
  }
};

const configuredBusinessPhone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+91 98765 43210';

const firstText = (...values) => values
  .map((value) => String(value || '').trim())
  .find(Boolean) || '';

const normalizePhoneHref = (phone = '') => {
  const digits = String(phone || '').replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : '';
};

const normalizeBranchCard = (branch = {}, fallback = {}) => {
  const address = firstText(
    branch.address,
    branch.fullAddress,
    branch.branchAddress,
    branch.officeAddress,
    branch.location?.address,
    fallback.address,
  );
  const city = firstText(branch.city, branch.location?.city, fallback.city);
  const state = firstText(branch.state, branch.location?.state, fallback.state);
  return {
    ...branch,
    branchName: firstText(branch.branchName, branch.name, fallback.branchName, 'Tithi Packers and Movers'),
    address,
    city,
    state,
    phone: firstText(branch.phone, branch.mobile, fallback.phone),
    email: firstText(branch.email, fallback.email),
  };
};

export default function ContactClient() {
  const { language } = useLanguageStore();
  const t = CONTACT_TRANSLATIONS[language] || CONTACT_TRANSLATIONS['en'];
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { data: site = {}, isLoading: siteLoading } = useSiteSetting();
  const { data: branches = [], isLoading: branchesLoading } = useBranches();
  const { data: mainBranch, isLoading: mainBranchLoading } = useMainBranch();
  const showSkeleton = !mounted || siteLoading || branchesLoading || mainBranchLoading;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    setSubmitting(true);
    try {
      await submitContact(payload);
      toast.success(t.successMsg);
      form.reset();
    } catch (error) {
      toast.error(error.message || 'Could not send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const address = firstText(site.address, site.businessAddress, site.contactAddress, site.officeAddress, mainBranch?.address, t.detailValues.hub);
  const phone = firstText(site.phone, site.whatsappNumber, mainBranch?.phone, configuredBusinessPhone);
  const email = firstText(site.email, mainBranch?.email);
  const branchFallback = {
    branchName: site.companyName || t.corpOffice,
    address,
    city: 'Surat',
    state: 'Gujarat',
    phone,
    email,
  };
  const sourceBranches = Array.isArray(branches) && branches.length > 0 ? branches : (mainBranch ? [mainBranch] : []);
  const visibleBranches = sourceBranches.length > 0
    ? sourceBranches.map((branch) => normalizeBranchCard(branch, branchFallback)).filter((branch) => branch.address || branch.city || branch.phone || branch.email)
    : [normalizeBranchCard({}, branchFallback)];
  const contactDetails = [
    phone ? { title: t.detailLabels.call, value: phone, icon: Phone, href: normalizePhoneHref(phone) } : null,
    email ? { title: t.detailLabels.email, value: email, icon: Mail, href: `mailto:${email}` } : null,
    address ? { title: t.detailLabels.hub, value: address, icon: MapPin, href: null } : null,
    { title: t.detailLabels.hours, value: t.detailValues.hours, icon: Clock, href: null },
  ].filter(Boolean);

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-page pt-32 pb-16 text-text-primary">
      <div className="pointer-events-none absolute inset-x-0 top-20 h-80 bg-[radial-gradient(circle_at_12%_18%,rgba(14,165,233,.16),transparent_32%),radial-gradient(circle_at_88%_20%,rgba(249,115,22,.10),transparent_28%)]" />
      <motion.div
        className="pointer-events-none absolute left-8 top-40 hidden h-24 w-24 rounded-[28px] border border-sky-100 bg-white/55 shadow-sky lg:block"
        animate={{ rotateY: [0, -14, 0], y: [0, 10, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative z-10 max-w-6xl mx-auto px-4 w-full">
        {showSkeleton ? (
          <section className="mx-auto max-w-5xl">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
              <div className="h-9 w-36 animate-pulse rounded-full bg-primary/15" />
              <div className="h-12 w-4/5 animate-pulse rounded-2xl bg-bg-border/70" />
              <div className="h-5 w-2/3 animate-pulse rounded-full bg-bg-border/60" />
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-12">
              <div className="space-y-4 rounded-3xl border border-bg-border bg-bg-white p-5 shadow-card lg:col-span-7 md:p-8">
                <div className="h-6 w-48 animate-pulse rounded-full bg-bg-border/70" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="h-14 animate-pulse rounded-2xl bg-bg-border/60" />
                  <div className="h-14 animate-pulse rounded-2xl bg-bg-border/60" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="h-14 animate-pulse rounded-2xl bg-bg-border/60" />
                  <div className="h-14 animate-pulse rounded-2xl bg-bg-border/60" />
                </div>
                <div className="h-32 animate-pulse rounded-2xl bg-bg-border/60" />
              </div>
              <div className="space-y-4 rounded-3xl border border-bg-border bg-bg-white p-5 shadow-card lg:col-span-5 md:p-6">
                <div className="h-6 w-40 animate-pulse rounded-full bg-bg-border/70" />
                <div className="h-16 animate-pulse rounded-2xl bg-bg-border/60" />
                <div className="h-16 animate-pulse rounded-2xl bg-bg-border/60" />
                <div className="h-16 animate-pulse rounded-2xl bg-bg-border/60" />
              </div>
            </div>
          </section>
        ) : (
          <>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mx-auto mb-12 flex max-w-3xl flex-col items-center gap-4 text-center md:mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary">
            <MessageSquare className="h-3.5 w-3.5" />
            {t.tag}
          </span>
          <h1 className="text-4xl font-black tracking-tight text-text-primary md:text-6xl">
            {t.title}
          </h1>
          <p className="max-w-2xl text-base font-semibold leading-7 text-text-secondary md:text-lg">
            Send your shifting requirement, call directly, or reach the Surat operations team from one place.
          </p>
        </motion.div>

        {/* Contact Layout grid */}
        <div className="grid grid-cols-1 items-start gap-6 text-left lg:grid-cols-12 lg:gap-8">
          
          {/* Left Column: Form (7 cols) */}
          <motion.div initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.06 }} className="lg:col-span-7">
            <Card className="p-5 md:p-8 bg-bg-white/95 border border-bg-border/60 shadow-card backdrop-blur transition hover:border-primary/20 hover:shadow-sky">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-6 border-b border-bg-border/60 pb-3">
                <MessageSquare className="w-5 h-5 text-primary" />
                {t.sendMsg}
              </h3>

              <form onSubmit={handleContactSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input name="name" label={t.labelName} placeholder={t.phName} required />
                  <Input name="mobile" label={t.labelPhone} placeholder={t.phPhone} inputMode="numeric" pattern="[0-9]{10}" maxLength={10} required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input name="email" label={t.labelEmail} type="email" placeholder={t.phEmail} />
                  <Input name="subject" label="Subject" placeholder="e.g. Office move" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    {t.labelMsg}
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    className="booking-input min-h-32 resize-none"
                    placeholder={t.phMsg}
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" loading={submitting} variant="primary" icon={Send} className="w-full px-5 text-xs font-bold uppercase tracking-wider sm:w-auto">
                    {t.btnSend}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>

          {/* Right Column: Office Info (5 cols) */}
          <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.12 }} className="flex flex-col gap-5 lg:col-span-5">
            <Card className="flex flex-col gap-6 border border-bg-border/60 bg-bg-white/95 p-5 shadow-card backdrop-blur transition hover:border-primary/20 hover:shadow-sky md:p-6">
              <h3 className="text-base font-bold text-text-primary uppercase tracking-wider border-b border-bg-border/60 pb-3">
                {t.corpOffice}
              </h3>

              <div className="flex flex-col gap-5">
                {contactDetails.map((item) => {
                  const Icon = item.icon;
                  const isLink = !!item.href;
                  
                  return (
                    <div key={item.title} className="group flex items-start gap-4 rounded-2xl border border-bg-border bg-bg-page/70 p-3 transition hover:border-primary/25 hover:bg-primary/5">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition group-hover:scale-105">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col text-left gap-0.5">
                        <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                          {item.title}
                        </span>
                        {isLink ? (
                          <a href={item.href} className="text-sm font-bold text-text-primary hover:text-primary transition-colors">
                            {item.value}
                          </a>
                        ) : (
                          <span className="text-sm font-bold text-text-primary">
                            {item.value}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card className="overflow-hidden border border-bg-border bg-bg-white p-0 shadow-card">
              <div className="bg-primary/10 p-5">
                <p className="text-xs font-black uppercase tracking-widest text-primary">Quick support</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-text-secondary">For urgent shifting queries, calling is the fastest way to reach the operations team.</p>
              </div>
              <div className="grid grid-cols-2 gap-px bg-bg-border text-center text-xs font-black uppercase text-text-secondary">
                <span className="bg-bg-white px-3 py-4">Free quote</span>
                <span className="bg-bg-white px-3 py-4">Daily support</span>
              </div>
            </Card>
          </motion.div>

        </div>

        {visibleBranches.length > 0 && <section className="mt-16"><div className="mb-7 text-center"><span className="text-xs font-bold uppercase tracking-widest text-primary">{visibleBranches.length > 1 ? 'Our locations' : 'Our location'}</span><h2 className="mt-2 text-2xl font-black text-text-primary md:text-3xl">{visibleBranches.length > 1 ? 'Branches Near You' : visibleBranches[0].branchName}</h2>{visibleBranches.length > 1 && <p className="mt-2 text-sm text-text-secondary">Choose the most convenient branch. New locations appear here automatically.</p>}</div><div className={`grid gap-4 ${visibleBranches.length > 1 ? 'md:grid-cols-2 lg:grid-cols-3' : 'mx-auto max-w-xl'}`}>{visibleBranches.map((branch, index) => <Card key={branch._id || `${branch.branchName}-${index}`} className="border border-bg-border bg-bg-white p-5"><div className="flex items-start justify-between gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl border border-primary/20 text-primary"><MapPin className="h-5 w-5" /></span>{branch.isMainBranch && <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase text-primary">Main branch</span>}</div><h3 className="mt-4 font-bold text-text-primary">{branch.branchName}</h3><p className="mt-1 text-sm font-medium text-text-secondary">{[branch.city, branch.state].filter(Boolean).join(', ')}</p><p className="mt-3 text-sm font-semibold leading-6 text-text-secondary">{branch.address}</p><div className="mt-4 flex flex-col gap-2 border-t border-bg-border pt-4 text-sm">{branch.phone && <a className="flex items-center gap-2 font-bold text-text-primary hover:text-primary" href={normalizePhoneHref(branch.phone)}><Phone className="h-4 w-4 text-primary" />{branch.phone}</a>}{branch.email && <a className="flex items-center gap-2 font-bold text-text-primary hover:text-primary" href={`mailto:${branch.email}`}><Mail className="h-4 w-4 text-primary" />{branch.email}</a>}</div></Card>)}</div></section>}
          </>
        )}

      </div>
    </div>
  );
}
