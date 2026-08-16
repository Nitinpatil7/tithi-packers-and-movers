'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { usePathname } from 'next/navigation';

export default function WebsiteChrome({ children }) {
  const pathname = usePathname();
  const isBookingPage = pathname.startsWith('/book/');

  return (
    <>
      <Navbar />
      <div className="flex-1 w-full">
        {children}
      </div>
      {!isBookingPage && <Footer />}
    </>
  );
}
