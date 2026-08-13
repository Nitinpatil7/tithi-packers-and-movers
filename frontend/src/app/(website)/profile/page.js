// src/app/profile/page.js
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, LogOut, ClipboardList } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useLanguageStore } from '@/store/languageStore';

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
    tag: "à¤—à¥à¤°à¤¾à¤¹à¤• à¤–à¤¾à¤¤à¤¾",
    title: "à¤†à¤ªà¤•à¤¾ à¤ªà¥à¤°à¥‹à¤«à¤¾à¤‡à¤²",
    verified: "à¤¸à¤¤à¥à¤¯à¤¾à¤ªà¤¿à¤¤ à¤—à¥à¤°à¤¾à¤¹à¤•",
    mobile: "à¤®à¥‹à¤¬à¤¾à¤‡à¤² à¤¨à¤‚à¤¬à¤°",
    email: "à¤ˆà¤®à¥‡à¤² à¤ªà¤¤à¤¾",
    notProvided: "à¤ªà¥à¤°à¤¦à¤¾à¤¨ à¤¨à¤¹à¥€à¤‚ à¤•à¤¿à¤¯à¤¾ à¤—à¤¯à¤¾",
    viewBookings: "à¤¶à¤¿à¤«à¥à¤Ÿà¤¿à¤‚à¤— à¤¬à¥à¤•à¤¿à¤‚à¤— à¤¦à¥‡à¤–à¥‡à¤‚",
    logout: "à¤²à¥‰à¤—à¤†à¤‰à¤Ÿ à¤•à¤°à¥‡à¤‚"
  },
  gu: {
    tag: "àª—à«àª°àª¾àª¹àª• àª–àª¾àª¤à«àª‚",
    title: "àª¤àª®àª¾àª°à«€ àªªà«àª°à«‹àª«àª¾àª‡àª²",
    verified: "àªµà«‡àª°à«€àª«àª¾àª‡àª¡ àª—à«àª°àª¾àª¹àª•",
    mobile: "àª®à«‹àª¬àª¾àªˆàª² àª¨àª‚àª¬àª°",
    email: "àª‡àª®à«‡àª‡àª² àª¸àª°àª¨àª¾àª®à«àª‚",
    notProvided: "àª¨àª¥à«€ àª†àªªà«‡àª²",
    viewBookings: "àª¶àª¿àª«à«àªŸàª¿àª‚àª— àª¬à«àª•àª¿àª‚àª— àªœà«àª“",
    logout: "àª²à«‹àª—àª†àª‰àªŸ àª•àª°à«‹"
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
      router.push('/website/my-bookings');
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
              href="/website/my-bookings"
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

