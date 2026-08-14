'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function WebsiteChrome({ children }) {
  return (
    <>
      <Navbar />
      <div className="flex-1 w-full">
        {children}
      </div>
      <Footer />
    </>
  );
}
