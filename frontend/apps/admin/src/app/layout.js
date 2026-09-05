// apps/admin/src/app/layout.js
import React from 'react';
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/next';
import Providers from '@tithi/components/layout/Providers';
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
    default: 'Tithi Packers & Movers Admin',
    template: '%s | Tithi Admin',
  },
  description: 'Internal booking, pricing and website operations dashboard for Tithi Packers & Movers.',
  icons: {
    icon: [
      { url: '/site-favicon' },
    ],
    shortcut: '/site-favicon',
    apple: '/site-favicon',
  },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
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
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
