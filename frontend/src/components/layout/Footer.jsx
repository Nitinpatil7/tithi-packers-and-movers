'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Mail, MapPin, ArrowRight, MessageCircle } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { PAGE_TRANSLATIONS } from '@/data/translations';
import { useSiteSetting } from '@/hooks/useSiteSetting';

export default function Footer() {
  const pathname = usePathname();
  const { language } = useLanguageStore();
  const t = PAGE_TRANSLATIONS[language] || PAGE_TRANSLATIONS['en'];
  const { data: site = {} } = useSiteSetting();
  const companyName = site.companyName || 'Tithi Packers and Movers';
  const phone = site.phone || '';
  const whatsapp = site.whatsappNumber || '';
  const email = site.email || '';
  const address = site.address || '';
  const serviceLabels = site.serviceLabels || {};

  if (pathname.startsWith('/admin')) return null;

  const services = [
    { name: serviceLabels.local_shifting || t.localShifting || 'Local Shifting', path: '/website/book/local-shifting', color: '#0EA5E9' },
    { name: serviceLabels.intercity_moving || t.intercityMoving || 'Intercity Moving', path: '/website/book/intercity-moving', color: '#0284C7' },
    { name: serviceLabels.porter_labour_service || t.packingService || 'Labour & Porter Service', path: '/website/book/labour-service', color: '#38BDF8' },
  ];

  const quickLinks = [
    { name: t.home || 'Home', path: '/' },
    { name: t.aboutUs || 'About Us', path: '/website/about' },
    { name: t.contact || 'Contact Us', path: '/website/contact' },
    { name: t.trackBooking || 'Track My Booking', path: '/website/my-bookings' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', path: '/website/legal/privacy-policy' },
    { name: 'Terms & Conditions', path: '/website/legal/terms-conditions' },
    { name: 'Refund Policy', path: '/website/legal/refund-policy' },
    { name: 'Cancellation Policy', path: '/website/legal/cancellation-policy' },
  ];

  return (
    <footer className="bg-[#1A1A2E] relative overflow-hidden text-left">
      {/* Top decorative gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
        backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
      }} />

      {/* CTA Strip */}
      <div className="border-b border-white/8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="text-left">
            <p className="text-white font-black text-xl" style={{ fontFamily: 'var(--font-heading)' }}>
              {language === 'gu' ? 'àª¶àª¿àª«à«àªŸàª¿àª‚àª— àª•àª°àªµàª¾ àª¤à«ˆàª¯àª¾àª° àª›à«‹? àª†àªœà«‡ àªœ àª«à«àª°à«€ àª­àª¾àªµ àª®à«‡àª³àªµà«‹!' : language === 'hi' ? 'à¤¸à¥à¤¥à¤¾à¤¨à¤¾à¤‚à¤¤à¤°à¤£ à¤•à¥‡ à¤²à¤¿à¤ à¤¤à¥ˆà¤¯à¤¾à¤° à¤¹à¥ˆà¤‚? à¤†à¤œ à¤¹à¥€ à¤®à¥à¤«à¥à¤¤ à¤…à¤¨à¥à¤®à¤¾à¤¨ à¤ªà¥à¤°à¤¾à¤ªà¥à¤¤ à¤•à¤°à¥‡à¤‚!' : 'Ready to move? Get a free quote today!'}
            </p>
            <p className="text-white/50 text-sm font-medium mt-1">
              {language === 'gu' ? 'à«¨-àª•àª²àª¾àª•àª®àª¾àª‚ àªµà«‹àªŸà«àª¸àªàªª àªœàªµàª¾àª¬ Â· àª•à«‹àªˆ àª›à«àªªàª¾ àªšàª¾àª°à«àªœ àª¨àª¹à«€àª‚' : language === 'hi' ? '2-à¤˜à¤‚à¤Ÿà¥‡ à¤®à¥‡à¤‚ à¤µà¥à¤¹à¤¾à¤Ÿà¥à¤¸à¤à¤ª à¤œà¤µà¤¾à¤¬ Â· à¤•à¥‹à¤ˆ à¤›à¥à¤ªà¤¾ à¤¶à¥à¤²à¥à¤• à¤¨à¤¹à¥€à¤‚' : '2-hour WhatsApp response Â· Zero hidden charges'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {phone && <a
              href={`tel:${phone}`}
              className="flex items-center gap-2 border border-white/20 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-white/10 hover:border-primary/50 active:scale-[.98] transition-all"
            >
                <Phone className="w-4 h-4" />
                {language === 'gu' ? 'àª«à«‹àª¨ àª•àª°à«‹' : language === 'hi' ? 'à¤•à¥‰à¤² à¤•à¤°à¥‡à¤‚' : 'Call Now'}
            </a>}
            <Link
              href="/website/book/local-shifting"
              className="btn-orange inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-bold active:scale-[.98] transition-transform"
            >
              {t.bookNow || 'Book Now'} â†’
            </Link>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand column */}
          <div className="flex flex-col gap-5 md:col-span-1">
            <Link href="/website" className="flex flex-col group group-items-start w-fit text-left">
              <span className="text-3xl font-black tracking-wider text-white group-hover:text-primary transition-colors text-left" style={{ fontFamily: 'var(--font-heading)' }}>
                {companyName}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-primary text-left">
                Packers & Movers
              </span>
            </Link>

            <p className="text-white/55 text-sm leading-relaxed font-medium text-left">
              {language === 'gu' 
                ? 'àª¸à«àª°àª¤ àª¸à«àª¥àª¿àª¤ àªªà«àª°à«€àª®àª¿àª¯àª® àªªà«‡àª•àª°à«àª¸ àª…àª¨à«‡ àª®à«‚àªµàª°à«àª¸. àª­àª¾àª°àª¤àª­àª°àª®àª¾àª‚ àªàª¡àªªà«€ àª…àª¨à«‡ àª¸à«àª°àª•à«àª·àª¿àª¤ àª¸à«‡àªµàª¾.' 
                : language === 'hi' 
                  ? 'à¤¸à¥‚à¤°à¤¤ à¤®à¥‡à¤‚ à¤¸à¥à¤¥à¤¿à¤¤ à¤ªà¥à¤°à¥€à¤®à¤¿à¤¯à¤® à¤ªà¥ˆà¤•à¤°à¥à¤¸ à¤”à¤° à¤®à¥‚à¤µà¤°à¥à¤¸à¥¤ à¤ªà¥‚à¤°à¥‡ à¤­à¤¾à¤°à¤¤ à¤®à¥‡à¤‚ à¤¸à¥à¤°à¤•à¥à¤·à¤¿à¤¤ à¤”à¤° à¤¤à¥€à¤µà¥à¤° à¤¸à¥à¤¥à¤¾à¤¨à¤¾à¤‚à¤¤à¤°à¤£à¥¤' 
                  : 'Premium, hassle-free moving services based in Surat. Relocating you across India with speed, precision, and complete care.'}
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3 mt-1">
              {whatsapp && <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-9 h-9 rounded-xl bg-white/8 border border-white/12 flex items-center justify-center text-white/60 hover:text-emerald-400 hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:-translate-y-1 active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4 transition-transform group-hover:rotate-6" />
              </a>}
              <a
                href="https://instagram.com/tithipackers"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-9 h-9 rounded-xl bg-white/8 border border-white/12 flex items-center justify-center text-white/60 hover:text-pink-400 hover:border-pink-400/30 hover:bg-pink-400/10 hover:-translate-y-1 active:scale-95 transition-all"
              >
                <svg className="w-4 h-4 transition-transform group-hover:rotate-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a
                href="https://facebook.com/tithipackers"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-9 h-9 rounded-xl bg-white/8 border border-white/12 flex items-center justify-center text-white/60 hover:text-blue-400 hover:border-blue-400/30 hover:bg-blue-400/10 hover:-translate-y-1 active:scale-95 transition-all"
              >
                <svg className="w-4 h-4 transition-transform group-hover:rotate-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            </div>
          </div>

          {/* Company links */}
          <div className="text-left">
            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-5 text-left">
              {language === 'gu' ? 'àª•àª‚àªªàª¨à«€' : language === 'hi' ? 'à¤•à¤‚à¤ªà¤¨à¥€' : 'Company'}
            </h4>
            <ul className="flex flex-col gap-3 text-left">
              {quickLinks.map((link) => (
                <li key={link.path} className="text-left">
                  <Link
                    href={link.path}
                    className="footer-link-line text-sm text-white/55 hover:text-white flex items-center gap-2 group transition-colors font-medium text-left w-fit"
                  >
                    <ArrowRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services links */}
          <div className="text-left">
            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-5 text-left">
              {t.services || 'Our Services'}
            </h4>
            <ul className="flex flex-col gap-3 text-left">
              {services.map((service) => (
                <li key={service.path} className="text-left">
                  <Link
                    href={service.path}
                    className="footer-link-line text-sm text-white/55 hover:text-white flex items-center gap-2 group transition-colors font-medium text-left w-fit"
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 opacity-0 group-hover:opacity-100 transition-all" style={{ backgroundColor: service.color }} />
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4 text-left">
            <h4 className="text-white font-black text-sm uppercase tracking-widest">Legal</h4>
            <ul className="flex flex-col gap-3">
              {legalLinks.map((link) => <li key={link.path}><Link href={link.path} className="footer-link-line group flex w-fit items-center gap-2 text-sm font-medium text-white/55 transition-colors hover:text-white"><ArrowRight className="h-3.5 w-3.5 text-primary transition-transform group-hover:translate-x-1" />{link.name}</Link></li>)}
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4 text-left">
            <h4 className="text-white font-black text-sm uppercase tracking-widest text-left">
              {language === 'gu' ? 'àª¸àª‚àªªàª°à«àª• àª®àª¾àª¹àª¿àª¤à«€' : language === 'hi' ? 'à¤¸à¤‚à¤ªà¤°à¥à¤• à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€' : 'Contact Info'}
            </h4>
            <ul className="flex flex-col gap-4 text-left">
              {address && <li className="flex items-start gap-3 text-sm text-white/55 font-medium text-left">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{address}</span>
              </li>}
              {phone && <li className="text-left">
                <a href={`tel:${phone}`} className="footer-link-line flex w-fit items-center gap-3 text-sm text-white/55 hover:text-white transition-colors font-medium text-left">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  {phone}
                </a>
              </li>}
              {email && <li className="text-left">
                <a href={`mailto:${email}`} className="footer-link-line flex w-fit items-center gap-3 text-sm text-white/55 hover:text-white transition-colors font-medium text-left">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  {email}
                </a>
              </li>}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/35 font-medium text-center md:text-left">
            Â© {new Date().getFullYear()} {language === 'gu' ? 'àª¤à«€àª¥àª¿ àªªà«‡àª•àª°à«àª¸ àªàª¨à«àª¡ àª®à«‚àªµàª°à«àª¸. àª¸àª°à«àªµàª¾àª§àª¿àª•àª¾àª° àª¸à«àª°àª•à«àª·àª¿àª¤.' : language === 'hi' ? 'à¤¤à¥€à¤¥à¤¿ à¤ªà¥ˆà¤•à¤°à¥à¤¸ à¤à¤‚à¤¡ à¤®à¥‚à¤µà¤°à¥à¤¸à¥¤ à¤¸à¤°à¥à¤µà¤¾à¤§à¤¿à¤•à¤¾à¤° à¤¸à¥à¤°à¤•à¥à¤·à¤¿à¤¤à¥¤' : 'Tithi Packers and Movers. All rights reserved.'}
          </p>
          <p className="text-xs text-white/35 flex items-center gap-1.5 font-medium">
            Made with <span className="text-red-400 animate-pulse">â¤ï¸</span> {language === 'gu' ? 'àª¸à«àª°àª¤àª®àª¾àª‚ àª¬àª¨àª¾àªµà«‡àª²' : language === 'hi' ? 'à¤¸à¥‚à¤°à¤¤, à¤—à¥à¤œà¤°à¤¾à¤¤ à¤®à¥‡à¤‚ à¤¬à¤¨à¤¾à¤¯à¤¾ à¤—à¤¯à¤¾' : 'in Surat, Gujarat'}
          </p>
        </div>
      </div>
    </footer>
  );
}

