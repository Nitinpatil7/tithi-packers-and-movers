// src/app/profile/page.js
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, LogOut, ClipboardList } from 'lucide-react';
import { useAuthStore } from '@tithi/store/authStore';
import Card from '@tithi/ui/Card';
import Button from '@tithi/ui/Button';
import Link from 'next/link';
import { useLanguageStore } from '@tithi/store/languageStore';

const PROFILE_TRANSLATIONS = {
  en: {
    tag: "Customer Account",
    title: "Your Profile",
    verified: "Verified Client",
    mobile: "Mobile Number",
    email: "Email Address",
    notProvided: "Not provided",
    viewBookings: "View Shifting Bookings",
    logout: "Logout Account"
  },
  hi: {
    tag: "ग्राहक खाता",
    title: "आपका प्रोफाइल",
    verified: "सत्यापित ग्राहक",
    mobile: "मोबाइल नंबर",
    email: "ईमेल पता",
    notProvided: "प्रदान नहीं किया गया",
    viewBookings: "शिफ्टिंग बुकिंग देखें",
    logout: "लॉगआउट करें"
  },
  gu: {
    tag: "ગ્રાહક ખાતું",
    title: "તમારી પ્રોફાઇલ",
    verified: "વેરીફાઇડ ગ્રાહક",
    mobile: "મોબાઈલ નંબર",
    email: "ઇમેઇલ સરનામું",
    notProvided: "નથી આપેલ",
    viewBookings: "શિફ્ટિંગ બુકિંગ જુઓ",
    logout: "લોગઆઉટ કરો"
  }
};

export default function ProfilePage() {
  const { user, isAuthenticated, logout, initializeAuth } = useAuthStore();
  const { language } = useLanguageStore();
  const t = PROFILE_TRANSLATIONS[language] || PROFILE_TRANSLATIONS['en'];
  const router = useRouter();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // If not authenticated, redirect to sign-in page
    if (!isAuthenticated) {
      router.push('/my-bookings');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-page text-text-primary pt-32 pb-16">
      <div className="max-w-md mx-auto px-4 text-left flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase font-bold tracking-widest text-primary">{t.tag}</span>
          <h1 className="text-2xl font-black text-text-primary">{t.title}</h1>
        </div>

        {/* Profile Card */}
        <Card className="p-6 bg-bg-white border border-bg-border/60 shadow-xs flex flex-col gap-5">
          <div className="flex items-center gap-4 border-b border-bg-border/60 pb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-black border border-primary/20">
              {user.name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-text-primary text-base">{user.name}</span>
              <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-bold">{t.verified}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 text-xs">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <div>
                <span className="text-text-tertiary block">{t.mobile}</span>
                <span className="text-text-primary font-mono font-bold mt-0.5">{user.mobile}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <div>
                <span className="text-text-tertiary block">{t.email}</span>
                <span className="text-text-primary font-bold mt-0.5">{user.email || t.notProvided}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-bg-border/60 pt-4 mt-2 flex flex-col gap-3">
            <Link
              href="/my-bookings"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-bg-border bg-white px-5 py-2 text-xs font-bold text-text-primary shadow-xs transition-all duration-200 hover:border-primary/30 hover:text-primary active:scale-[0.98]"
            >
              <ClipboardList className="w-4 h-4" />
              {t.viewBookings}
            </Link>

            <Button 
              variant="ghost" 
              onClick={logout}
              className="w-full flex gap-2 text-xs py-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent"
              icon={LogOut}
            >
              {t.logout}
            </Button>
          </div>
        </Card>

      </div>
    </div>
  );
}

