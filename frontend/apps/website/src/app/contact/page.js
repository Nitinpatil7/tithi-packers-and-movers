// src/app/(website)/contact/page.js
import React from 'react';
import ContactClient from './ContactClient';

export const metadata = {
  title: 'Contact Packers and Movers in Surat',
  description: 'Contact Tithi Packers & Movers, No. 1 Packers and Movers in Surat, for local shifting, intercity moving and labour service quotes.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return <ContactClient />;
}

