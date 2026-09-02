'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SiteStructuredData from '@/components/layout/SiteStructuredData';
import { usePathname } from 'next/navigation';

export default function WebsiteChrome({ children }) {
  const pathname = usePathname();
  const isBookingPage = pathname.startsWith('/book/');
  const isFeedbackPage = pathname === '/feedback' || pathname.startsWith('/feedback/');

  return (
    <>
      <SiteStructuredData />
      <Navbar minimal={isFeedbackPage} />
      <div className="public-theme flex-1 w-full">
        {children}
      </div>
      {!isBookingPage && !isFeedbackPage && <Footer />}
    </>
  );
}
