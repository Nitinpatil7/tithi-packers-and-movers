'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Mail, MapPin, ArrowRight, MessageCircle } from 'lucide-react';
import { PAGE_TRANSLATIONS } from '@/data/translations';
import { resolveSiteAssetUrl } from '@tithi/utils/siteAssets';
import { useSiteSetting } from '@tithi/hooks/useSiteSetting';

export default function Footer() {
  const pathname = usePathname();
  const language = 'en';
  const t = PAGE_TRANSLATIONS[language] || PAGE_TRANSLATIONS['en'];
  const { data: site = {} } = useSiteSetting();
  const companyName = site.companyName || 'Tithi Packers and Movers';
  const phone = site.phone || '';
  const whatsapp = site.whatsappNumber || '';
  const email = site.email || '';
  const address = site.address || '';
  const serviceLabels = site.serviceLabels || {};
  const logoSrc = resolveSiteAssetUrl(site.logoUrl);

  if (pathname.startsWith('/admin')) return null;

  const services = [
    { name: serviceLabels.local_shifting || t.localShifting || 'Local Shifting', path: '/book/local-shifting', color: '#0EA5E9' },
    { name: serviceLabels.intercity_moving || t.intercityMoving || 'Intercity Moving', path: '/book/intercity-moving', color: '#0284C7' },
    { name: serviceLabels.porter_labour_service || t.packingService || 'Labour & Porter Service', path: '/book/labour-service', color: '#38BDF8' },
  ];

  const quickLinks = [
    { name: t.home || 'Home', path: '/' },
    { name: t.aboutUs || 'About Us', path: '/about' },
    { name: t.contact || 'Contact Us', path: '/contact' },
    { name: t.trackBooking || 'Track My Booking', path: '/my-bookings' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', path: '/legal/privacy-policy' },
    { name: 'Terms & Conditions', path: '/legal/terms-conditions' },
    { name: 'Refund Policy', path: '/legal/refund-policy' },
    { name: 'Cancellation Policy', path: '/legal/cancellation-policy' },
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
              Ready to move? Get a free quote today!
            </p>
            <p className="text-white/50 text-sm font-medium mt-1">
              2-hour WhatsApp response · Zero hidden charges
            </p>
          </div>
          <div className="flex items-center gap-3">
            {phone && <a
              href={`tel:${phone}`}
              className="flex items-center gap-2 border border-white/20 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-white/10 hover:border-primary/50 active:scale-[.98] transition-all"
            >
                <Phone className="w-4 h-4" />
                Call Now
            </a>}
            <Link
              href="/book/local-shifting"
              className="btn-orange inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-bold active:scale-[.98] transition-transform"
            >
              {t.bookNow || 'Book Now'} →
            </Link>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand column */}
          <div className="flex flex-col gap-5 md:col-span-1">
            <Link href="/" className="flex w-fit flex-col text-left" aria-label={companyName}>
              {logoSrc && (
                <Image
                  unoptimized
                  src={logoSrc}
                  alt={`${companyName} logo`}
                  width={170}
                  height={52}
                  className="h-12 w-auto max-w-[180px] object-contain"
                />
              )}
            </Link>

            <p className="text-white/55 text-sm leading-relaxed font-medium text-left">
              Premium, hassle-free moving services based in Surat. Relocating you across India with speed, precision, and complete care.
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
              Company
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
              Contact Info
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
            © {new Date().getFullYear()} Tithi Packers and Movers. All rights reserved.
          </p>
          <p className="text-xs text-white/35 flex items-center gap-1.5 font-medium">
            Made with <span className="text-red-400 animate-pulse">❤️</span> in Surat, Gujarat
          </p>
        </div>
      </div>
    </footer>
  );
}

