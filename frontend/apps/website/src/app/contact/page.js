// src/app/(website)/contact/page.js
import React from 'react';
import ContactClient from './ContactClient';

export const metadata = {
  title: 'Contact Tithi Packers and Movers Surat | Shifting Hub in Adajan',
  description: 'Get in touch with Tithi Packers and Movers in Surat. Call +91 98765 43210 or email support@tithipacking.com. Get a 2-hour WhatsApp estimate for local and national relocations.',
  alternates: {
    canonical: 'https://tithipacking.com/contact',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}

