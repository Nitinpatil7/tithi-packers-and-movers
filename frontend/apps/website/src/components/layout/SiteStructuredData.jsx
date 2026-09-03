'use client';

import { useSiteSetting } from '@tithi/hooks/useSiteSetting';

function splitAddress(address = '') {
  const parts = String(address).split(',').map((part) => part.trim()).filter(Boolean);
  return {
    streetAddress: parts.slice(0, -2).join(', ') || address,
    addressLocality: parts.find((part) => /surat/i.test(part)) || 'Surat',
    addressRegion: parts.find((part) => /gujarat/i.test(part)) || 'Gujarat',
  };
}

export default function SiteStructuredData() {
  const { data: site = {} } = useSiteSetting();
  const address = site.address || site.businessAddress || site.contactAddress || site.officeAddress || '';
  const parsedAddress = splitAddress(address);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MovingCompany',
    name: site.companyName || 'Tithi Packers and Movers',
    description: site.seo?.metaDescription || 'Professional packers and movers in Surat offering local shifting, intercity moving, and Labour & Vehicle service.',
    url: 'https://tithipackers.in',
    telephone: site.phone || '',
    email: site.email || '',
    address: {
      '@type': 'PostalAddress',
      streetAddress: parsedAddress.streetAddress,
      addressLocality: parsedAddress.addressLocality,
      addressRegion: parsedAddress.addressRegion,
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '21.1702',
      longitude: '72.8311',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '07:00',
      closes: '21:00',
    },
    priceRange: '₹₹',
    areaServed: ['Surat', 'Gujarat', 'India'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Moving Services',
      itemListElement: [
        { '@type': 'Offer', name: site.serviceLabels?.local_shifting || 'Local Shifting' },
        { '@type': 'Offer', name: site.serviceLabels?.intercity_moving || 'Intercity Moving' },
        { '@type': 'Offer', name: site.serviceLabels?.porter_labour_service || 'Labour & Vehicle' },
      ],
    },
    sameAs: Object.values(site.socialLinks || {}).filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export { SiteStructuredData };
