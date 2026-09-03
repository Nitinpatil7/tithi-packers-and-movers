// src/app/(website)/about/page.js
import React from 'react';
import AboutClient from './AboutClient';

export const metadata = {
  title: 'About No. 1 Packers and Movers in Surat',
  description: 'Learn about Tithi Packers & Movers, No. 1 Packers and Movers in Surat for transparent pricing, safe packing and reliable relocation service.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return <AboutClient />;
}

