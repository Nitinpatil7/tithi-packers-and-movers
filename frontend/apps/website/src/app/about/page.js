// src/app/(website)/about/page.js
import React from 'react';
import AboutClient from './AboutClient';

export const metadata = {
  title: 'About Tithi Packers and Movers Surat | Shifting Journey & Core Values',
  description: 'Learn about Tithi Packers and Movers Surat. We specialize in transparent pricing, zero hidden charges, safe packing materials, and on-time relocation services in Surat, Gujarat.',
  alternates: {
    canonical: 'https://tithipacking.com/about',
  },
};

export default function AboutPage() {
  return <AboutClient />;
}

