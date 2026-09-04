// apps/website/src/app/layout.js
import React from 'react';
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/next';
import Providers from '@tithi/components/layout/Providers';
import WebsiteChrome from '@/components/layout/WebsiteChrome';
import '@tithi/styles/globals.css';

const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
const hasUsableGoogleMapsKey = Boolean(googleMapsKey && !googleMapsKey.includes('PLACEHOLDER'));
const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-display',
  display: 'swap',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://tithipackers.in'),
  title: {
    default: 'Packers and Movers in Surat | Tithi Packers & Movers',
    template: '%s | Tithi Packers & Movers',
  },
  description: 'Professional packers and movers in Surat for local shifting, intercity moving, packing, loading, unloading and labour services.',
  keywords: ['packers and movers surat', 'no 1 packers and movers surat', 'local shifting surat', 'intercity moving surat', 'labour service surat', 'home shifting surat', 'tithi packers movers'],
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Tithi Packers & Movers',
    description: 'Professional packers and movers in Surat for local and intercity moving services.',
    url: 'https://tithipackers.in',
    siteName: 'Tithi Packers & Movers',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tithi Packers & Movers | Surat',
    description: 'Professional packers and movers in Surat. Book online, get a free quote.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      style={{ '--font-heading': 'var(--font-display)' }}
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        {/* Never load Google with a placeholder key: its SDK corrupts inputs
            with a repeating error image when authentication fails. */}
        {hasUsableGoogleMapsKey && (
          <script
            src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsKey}&libraries=places&language=en&loading=async`}
            async
          />
        )}
      </head>
      <body className="bg-bg-page text-text-primary min-h-screen flex flex-col justify-between">
        <Providers>
          <WebsiteChrome>{children}</WebsiteChrome>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
