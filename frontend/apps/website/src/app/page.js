export const metadata = {
  title: 'No. 1 Packers and Movers in Surat',
  description: 'Book Tithi Packers & Movers, No. 1 Packers and Movers in Surat for local shifting, intercity moving, labour, vehicle and packing services.',
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
      <HowItWorksSection />

      {/* 4. WhyChooseUsSection */}
      <WhyChooseUsSection />

      {/* 5. BasePricePackagesSection */}
      <BasePricePackagesSection />

      {/* 6. ServiceDetailSection */}
      <ServiceDetailSection />

      {/* 7. TestimonialsSection */}
      <TestimonialsSection />

      {/* 8. CoverageMapSection */}
      <CoverageMapSection />

      {/* 9. FAQSection */}
      <FAQSection />

      {/* 10. CTABannerSection */}
      <CTABannerSection />
    </div>
  );
}
