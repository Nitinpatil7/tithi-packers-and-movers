// src/components/layout/Navbar.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '@tithi/store/themeStore';
import { PAGE_TRANSLATIONS } from '@/data/translations';
import { cn } from '@tithi/utils/utils';
import { resolveSiteAssetUrl } from '@tithi/utils/siteAssets';
import { useSiteSetting } from '@tithi/hooks/useSiteSetting';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const pathname = usePathname();
  const language = 'en';
  const { theme, setTheme } = useThemeStore();
  const { data: site = {} } = useSiteSetting();
  const logoSrc = resolveSiteAssetUrl(site.logoUrl);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const t = PAGE_TRANSLATIONS[language] || PAGE_TRANSLATIONS['en'];
  const serviceLabels = site.serviceLabels || {};

  const navLinks = [
    { name: t.home || 'Home', path: '/' },
    { name: t.aboutUs || 'About Us', path: '/about' },
    { name: t.contact || 'Contact', path: '/contact' },
    { name: t.trackBooking || 'Track Booking', path: '/my-bookings' },
  ];

  const services = [
    { name: serviceLabels.local_shifting || t.localShifting || 'Local Shifting', path: '/book/local-shifting', color: '#0EA5E9', desc: t.hubSurat || 'Within Surat' },
    { name: serviceLabels.intercity_moving || t.intercityMoving || 'Intercity Moving', path: '/book/intercity-moving', color: '#0284C7', desc: t.badgeZeroHidden || 'Pan India' },
    { name: serviceLabels.porter_labour_service || t.packingService || 'Labour & Porter', path: '/book/labour-service', color: '#38BDF8', desc: t.packingServiceDesc || 'Workers only' },
  ];

  const isBookingPage = pathname.startsWith('/book/');
  const isAdminPage = pathname.startsWith('/admin');
  if (isAdminPage) return null;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 w-full backdrop-blur-lg transition-all duration-400',
        scrolled
          ? 'border-b border-bg-border/50 bg-bg-page/65 py-2.5 sm:py-2'
          : 'border-b border-transparent bg-bg-page/20 py-3.5 sm:py-3'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 lg:gap-8">
          {/* Logo */}
          <Link href="/" className="flex min-w-0 items-center group shrink-0" aria-label={site.companyName || 'Home'}>
            {logoSrc && <Image unoptimized src={logoSrc} alt={site.companyName || 'Company logo'} width={220} height={68} className="h-14 w-auto max-w-[220px] object-contain sm:max-w-[230px]" />}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
            <Link
              href="/"
              className={cn(
                "text-sm font-semibold transition-colors relative group py-1",
                pathname === '/' ? "text-primary" : "text-text-secondary hover:text-text-primary"
              )}
            >
              Home
              {pathname === '/' && (
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
              href="/book/local-shifting"
              className="btn-orange inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold"
            >
              {t.bookNow || 'Book Now'} →
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-[52px] min-w-[52px] rounded-2xl border border-bg-border bg-white p-3 text-text-secondary transition-all hover:border-primary/30 hover:text-primary"
              >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
              <Link href="/" className={cn("text-base font-bold", pathname === '/' ? "text-primary" : "text-text-secondary")}>
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
                  General
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

              {/* Mobile Theme Selector */}
              <div className="flex flex-col gap-2 pt-2 border-t border-bg-border">
                <span className="text-xs uppercase font-bold tracking-widest text-text-tertiary">
                  Theme
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
                  href="/book/local-shifting"
                  className="btn-orange flex w-full items-center justify-center py-3 rounded-xl font-bold text-sm"
                >
                  {t.bookNow || 'Book Now'} →
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

