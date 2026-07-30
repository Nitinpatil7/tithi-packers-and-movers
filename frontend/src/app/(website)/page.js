export const metadata = {
  title: 'Tithi Packers and Movers | #1 Shifting Service in Surat',
  description: 'Book local shifting, intercity moving, business relocation, and ordinary services (packing, unpacking, loading, unloading) in Surat, Gujarat. Get a free quote in 2 hours.',
  alternates: {
    canonical: 'https://tithipacking.com',
  },
};

import React from 'react';
import Image from 'next/image';
import HeroSection from '@/components/home/HeroSection';
import BasePricePackagesSection from '@/components/home/BasePricePackagesSection';
import ServicesSection from '@/components/home/ServicesSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import WhyChooseUsSection from '@/components/home/WhyChooseUsSection';
import ServiceDetailSection from '@/components/home/ServiceDetailSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import CoverageMapSection from '@/components/home/RealisticCoverageMapSection';
import FAQSection from '@/components/home/FAQSection';
import CTABannerSection from '@/components/home/CTABannerSection';

export default function Home() {
  return (
    <div className="flex flex-col w-full overflow-hidden bg-bg-page text-text-primary">
      {/* 1. HeroSection */}
      <HeroSection />

      <div className="relative z-20 -mt-4 -mb-4 flex justify-end overflow-hidden py-3 pl-4 lg:hidden">
        <div className="hero-front-truck-bridge pointer-events-none relative h-28 w-full max-w-[420px] overflow-hidden sm:h-36 md:h-40 md:max-w-[520px]">
          <Image
            src="/front_truck.png"
            alt=""
            width={560}
            height={320}
            priority
            className="absolute -right-[14%] top-1/2 w-[96%] max-w-[440px] -translate-y-1/2 object-contain drop-shadow-[0_22px_28px_rgba(15,23,42,0.20)] md:max-w-[520px]"
          />
        </div>
      </div>

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
