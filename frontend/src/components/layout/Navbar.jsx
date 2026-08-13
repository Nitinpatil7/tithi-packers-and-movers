// src/components/layout/Navbar.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Globe, Sun, Moon, Monitor } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { useThemeStore } from '@/store/themeStore';
import { PAGE_TRANSLATIONS } from '@/data/translations';
import { cn } from '@/lib/utils';
import { useSiteSetting } from '@/hooks/useSiteSetting';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const pathname = usePathname();
  const { language, setLanguage, initializeLanguage } = useLanguageStore();
  const { theme, setTheme } = useThemeStore();
  const { data: site = {} } = useSiteSetting();

  useEffect(() => {
    initializeLanguage();
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [initializeLanguage]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const t = PAGE_TRANSLATIONS[language] || PAGE_TRANSLATIONS['en'];
  const serviceLabels = site.serviceLabels || {};

  const navLinks = [
    { name: t.home || 'Home', path: '/' },
    { name: t.aboutUs || 'About Us', path: '/website/about' },
    { name: t.contact || 'Contact', path: '/website/contact' },
    { name: t.trackBooking || 'Track Booking', path: '/website/my-bookings' },
  ];

  const services = [
    { name: serviceLabels.local_shifting || t.localShifting || 'Local Shifting', path: '/website/book/local-shifting', color: '#0EA5E9', desc: t.hubSurat || 'Within Surat' },
    { name: serviceLabels.intercity_moving || t.intercityMoving || 'Intercity Moving', path: '/website/book/intercity-moving', color: '#0284C7', desc: t.badgeZeroHidden || 'Pan India' },
    { name: serviceLabels.porter_labour_service || t.packingService || 'Labour & Porter', path: '/website/book/labour-service', color: '#38BDF8', desc: t.packingServiceDesc || 'Workers only' },
  ];

  const isBookingPage = pathname.startsWith('/website/book/');
  const isAdminPage = pathname.startsWith('/admin');
  if (isAdminPage) return null;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 w-full backdrop-blur-lg transition-all duration-400',
        scrolled
          ? 'border-b border-bg-border/50 bg-bg-page/65 py-1.5'
          : 'border-b border-transparent bg-bg-page/20 py-2.5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 lg:gap-8">
          {/* Logo */}
          <Link href="/website" className="flex min-w-0 items-center group shrink-0">
            {site.logoUrl && <Image unoptimized src={site.logoUrl} alt={site.companyName || 'Company logo'} width={32} height={32} className="mr-2.5 h-8 w-8 rounded-lg object-contain" />}
            <span className="flex max-w-[180px] flex-col leading-tight sm:max-w-[220px]">
            <span className={cn(
              "truncate text-base font-black tracking-wide transition-colors font-heading sm:text-lg",
              scrolled ? "text-text-primary" : "text-text-primary"
            )}>
              {site.companyName || 'TITHI'}
            </span>
            <span className="truncate text-[8px] uppercase font-bold tracking-[0.22em] text-primary sm:text-[9px] sm:tracking-[0.3em]">
              {site.tagline || 'Packers & Movers'}
            </span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
            <Link
              href="/website"
              className={cn(
                "text-sm font-semibold transition-colors relative group py-1",
                pathname === '/website' ? "text-primary" : "text-text-secondary hover:text-text-primary"
              )}
            >
              Home
              {pathname === '/website' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>

            {/* Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button
                className={cn(
                  "flex items-center gap-1 text-sm font-semibold transition-colors focus:outline-none py-1",
                  isBookingPage ? "text-primary" : "text-text-secondary hover:text-text-primary"
                )}
              >
                Services
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", dropdownOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-72 bg-white border border-bg-border rounded-2xl shadow-xl p-3 z-50"
                    style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}
                  >
                    {services.map((service) => (
                      <Link
                        key={service.path}
                        href={service.path}
                        prefetch
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-section transition-colors group"
                      >
                        <span
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: service.color + '18', color: service.color }}
                        >
                          <span className="text-xs font-black">{service.name.charAt(0)}</span>
                        </span>
                        <div>
                          <div className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{service.name}</div>
                          <div className="text-xs text-text-tertiary">{service.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {navLinks.slice(1).map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={cn(
                  "text-sm font-semibold transition-colors relative py-1",
                  pathname === link.path ? "text-primary" : "text-text-secondary hover:text-text-primary"
                )}
              >
                {link.name}
                {pathname === link.path && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* CTAs */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {/* Desktop Language Selector */}
            <div className="relative group shrink-0 flex items-center">
              <button
                className="flex items-center gap-1.5 text-text-secondary hover:text-primary transition-colors px-3 py-2 rounded-xl bg-bg-section border border-bg-border text-xs font-bold focus:outline-none"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="uppercase">{language}</span>
                <ChevronDown className="w-3 h-3 text-text-tertiary" />
              </button>
              <div className="absolute right-0 top-full pt-2 w-28 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                <div className="bg-white border border-bg-border rounded-xl shadow-lg p-1.5 flex flex-col gap-0.5">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'hi', label: 'à¤¹à¤¿à¤‚à¤¦à¥€ (Hindi)' },
                    { code: 'gu', label: 'àª—à«àªœàª°àª¾àª¤à«€' }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={cn(
                        "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors",
                        language === lang.code ? "bg-primary-soft text-primary" : "text-text-secondary hover:bg-bg-section"
                      )}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Theme Selector */}
            <div className="relative group shrink-0 flex items-center">
              <button
                className="flex items-center justify-center text-text-secondary hover:text-primary transition-colors p-2.5 rounded-xl bg-bg-section border border-bg-border text-xs font-bold focus:outline-none"
              >
                {theme === 'dark' ? <Moon className="w-4 h-4 text-primary" /> : theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Monitor className="w-4 h-4" />}
              </button>
              <div className="absolute right-0 top-full pt-2 w-32 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                <div className="bg-white border border-bg-border rounded-xl shadow-lg p-1.5 flex flex-col gap-0.5">
                  {[
                    { code: 'light', label: t.themeLight || 'Light', icon: Sun },
                    { code: 'dark', label: t.themeDark || 'Dark', icon: Moon },
                    { code: 'system', label: t.themeSystem || 'System', icon: Monitor }
                  ].map((th) => {
                    const Icon = th.icon;
                    return (
                      <button
                        key={th.code}
                        onClick={() => setTheme(th.code)}
                        className={cn(
                          "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors text-left",
                          theme === th.code ? "bg-primary-soft text-primary" : "text-text-secondary hover:bg-bg-section"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {th.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <Link
              href="/website/book/local-shifting"
              className="btn-orange inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold"
            >
              {t.bookNow || 'Book Now'} â†’
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-bg-border bg-white text-text-secondary hover:text-primary hover:border-primary/30 transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden bg-white border-b border-bg-border overflow-y-auto max-h-[calc(100vh-80px)] shadow-xl"
          >
            <div className="px-5 py-6 flex flex-col gap-5">
              <Link href="/website" className={cn("text-base font-bold", pathname === '/website' ? "text-primary" : "text-text-secondary")}>
                {t.home || 'Home'}
              </Link>

              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase font-bold tracking-widest text-text-tertiary">
                  {t.services || 'Services'}
                </span>
                {services.map((service) => (
                  <Link
                    key={service.path}
                    href={service.path}
                    prefetch
                    className="pl-3 flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-primary transition-colors py-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: service.color }} />
                    {service.name}
                  </Link>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase font-bold tracking-widest text-text-tertiary">
                  {language === 'gu' ? 'àª¸àª¾àª®àª¾àª¨à«àª¯' : language === 'hi' ? 'à¤¸à¤¾à¤®à¤¾à¤¨à¥à¤¯' : 'General'}
                </span>
                {navLinks.slice(1).map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={cn("text-base font-semibold pl-3", pathname === link.path ? "text-primary" : "text-text-secondary")}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              {/* Mobile Language Selector */}
              <div className="flex flex-col gap-2 pt-2 border-t border-bg-border">
                <span className="text-xs uppercase font-bold tracking-widest text-text-tertiary">
                  Language / àª­àª¾àª·àª¾ / à¤­à¤¾à¤·à¤¾
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'hi', label: 'à¤¹à¤¿à¤‚à¤¦à¥€' },
                    { code: 'gu', label: 'àª—à«àªœàª°àª¾àª¤à«€' }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={cn(
                        "py-2 text-center rounded-xl text-xs font-bold border transition-all",
                        language === lang.code 
                          ? "bg-primary text-white border-primary shadow-orange"
                          : "bg-bg-section border-bg-border text-text-secondary"
                      )}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Theme Selector */}
              <div className="flex flex-col gap-2 pt-2 border-t border-bg-border">
                <span className="text-xs uppercase font-bold tracking-widest text-text-tertiary">
                  Theme / àª¥à«€àª® / à¤¥à¥€à¤®
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'light', label: t.themeLight || 'Light', icon: Sun },
                    { code: 'dark', label: t.themeDark || 'Dark', icon: Moon },
                    { code: 'system', label: t.themeSystem || 'System', icon: Monitor }
                  ].map((th) => {
                    const Icon = th.icon;
                    const isSelected = theme === th.code;
                    return (
                      <button
                        key={th.code}
                        onClick={() => setTheme(th.code)}
                        className={cn(
                          "py-2 px-1 flex flex-col items-center justify-center gap-1 rounded-xl text-xs font-bold border transition-all",
                          isSelected 
                            ? "bg-primary text-white border-primary shadow-orange"
                            : "bg-bg-section border-bg-border text-text-secondary"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{th.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-bg-border flex flex-col gap-3">
                <Link
                  href="/website/book/local-shifting"
                  className="btn-orange flex w-full items-center justify-center py-3 rounded-xl font-bold text-sm"
                >
                  {t.bookNow || 'Book Now'} â†’
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

