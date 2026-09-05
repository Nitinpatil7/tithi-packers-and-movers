// apps/monitoring/src/app/layout.js
import React from 'react';
import localFont from 'next/font/local';
import Providers from '@tithi/components/layout/Providers';
import '@tithi/styles/globals.css';

const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
const hasUsableGoogleMapsKey = Boolean(googleMapsKey && !googleMapsKey.includes('PLACEHOLDER'));
const businessPhone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '';

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
  description: 'Trusted packers and movers in Surat. Book local shifting, intercity moving to all India, and Labour & Vehicle support online. Get free quote in 2 minutes.',
  keywords: ['packers and movers surat', 'local shifting surat', 'intercity moving surat to mumbai', 'labour vehicle service surat', 'home shifting surat', 'tithi packers movers'],
  icons: {
    icon: [
      { url: '/site-favicon' },
    ],
    shortcut: '/site-favicon',
    apple: '/site-favicon',
  },
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

const structuredData = {
  "@context": "https://schema.org",
  "@type": "MovingCompany",
  "name": "Tithi Packers and Movers",
  "description": "Professional packers and movers in Surat offering local shifting, intercity moving, and Labour & Vehicle support.",
  "url": "https://tithipacking.com",
  "telephone": businessPhone,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "102, Shanti Complex, Opp. Star Bazaar, Adajan",
    "addressLocality": "Surat",
    "addressRegion": "Gujarat",
    "postalCode": "395009",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "21.1702",
    "longitude": "72.8311"
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
    "opens": "07:00",
    "closes": "21:00"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "234"
  },
  "priceRange": "₹₹",
  "areaServed": ["Surat", "Gujarat", "India"],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Moving Services",
    "itemListElement": [
      { "@type": "Offer", "name": "Local Shifting Surat" },
      { "@type": "Offer", "name": "Intercity Moving" },
      { "@type": "Offer", "name": "Labour & Vehicle" }
    ]
  },
  "sameAs": [
    "https://instagram.com/tithipackers",
    "https://facebook.com/tithipackers"
  ]
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
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
        </Providers>
      </body>
    </html>
  );
}
