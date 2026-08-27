// apps/website/src/app/layout.js
import React from 'react';
import localFont from 'next/font/local';
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
  metadataBase: new URL('https://tithipacking.com'),
  title: {
    default: 'Tithi Packers and Movers | #1 Packers & Movers in Surat',
    template: '%s | Tithi Packers and Movers Surat'
  },
  description: 'Trusted packers and movers in Surat. Book local shifting, intercity moving to all India, packing service, and commercial relocation online. Get free quote in 2 minutes.',
  keywords: ['packers and movers surat', 'local shifting surat', 'intercity moving surat to mumbai', 'packing service surat', 'office relocation surat', 'home shifting surat', 'tithi packers movers'],
  openGraph: {
    title: 'Tithi Packers and Movers Surat — Book Online',
    description: 'Trusted local & intercity moving service. Book in 2 minutes, get quote in 2 hours.',
    url: 'https://tithipacking.com',
    siteName: 'Tithi Packers and Movers',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    locale: 'en_IN',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tithi Packers and Movers | Surat',
    description: 'Trusted moving service in Surat. Book online, get free quote.',
    images: ['/og-image.jpg']
  },
  alternates: {
    canonical: 'https://tithipacking.com'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true }
  }
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      style={{ '--font-heading': 'var(--font-display)' }}
    >
      <head>
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
        </Providers>
      </body>
    </html>
  );
}
