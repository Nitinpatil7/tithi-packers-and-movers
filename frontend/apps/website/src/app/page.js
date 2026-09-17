export const metadata = {
  title: 'No. 1 Packers and Movers in Surat',
  description: 'Book Tithi Packers & Movers, No. 1 Packers and Movers in Surat for local shifting, intercity moving, labour and vehicle support.',
  alternates: { canonical: '/' },
};

import React from 'react';
import dynamic from 'next/dynamic';
import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';

const HowItWorksSection = dynamic(() => import('@/components/home/HowItWorksSection'), { loading: () => null });
const WhyChooseUsSection = dynamic(() => import('@/components/home/WhyChooseUsSection'), { loading: () => null });
const BasePricePackagesSection = dynamic(() => import('@/components/home/BasePricePackagesSection'), { loading: () => null });
const ServiceDetailSection = dynamic(() => import('@/components/home/ServiceDetailSection'), { loading: () => null });
const TestimonialsSection = dynamic(() => import('@/components/home/TestimonialsSection'), { loading: () => null });
const CoverageMapSection = dynamic(() => import('@/components/home/RealisticCoverageMapSection'), { loading: () => null });
const FAQSection = dynamic(() => import('@/components/home/FAQSection'), { loading: () => null });
const CTABannerSection = dynamic(() => import('@/components/home/CTABannerSection'), { loading: () => null });

export default function Home() {
  return (
    <div className="flex flex-col w-full overflow-visible bg-bg-page text-text-primary">
      {/* 1. HeroSection */}
      <HeroSection />

      {/* 2. ServicesSection */}
      <ServicesSection />

      {/* 3. HowItWorksSection */}
      <div className="home-deferred-section">
        <HowItWorksSection />
      </div>

      {/* 4. WhyChooseUsSection */}
      <div className="home-deferred-section">
        <WhyChooseUsSection />
      </div>

      {/* 5. BasePricePackagesSection */}
      <div className="home-deferred-section">
        <BasePricePackagesSection />
      </div>

      {/* 6. ServiceDetailSection */}
      <div className="home-deferred-section">
        <ServiceDetailSection />
      </div>

      {/* 7. TestimonialsSection */}
      <div className="home-deferred-section">
        <TestimonialsSection />
      </div>

      {/* 8. CoverageMapSection */}
      <div className="home-deferred-section">
        <CoverageMapSection />
      </div>

      {/* 9. FAQSection */}
      <div className="home-deferred-section">
        <FAQSection />
      </div>

      {/* 10. CTABannerSection */}
      <div className="home-deferred-section">
        <CTABannerSection />
      </div>
    </div>
  );
}
