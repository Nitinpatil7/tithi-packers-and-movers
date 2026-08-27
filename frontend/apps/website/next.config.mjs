const isVercel = process.env.VERCEL === '1';
const iconCdnHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_ICON_CDN || 'https://pub-c7cc00b06c314fbca4060aee180a5d92.r2.dev').hostname;
  } catch {
    return 'pub-c7cc00b06c314fbca4060aee180a5d92.r2.dev';
  }
})();

const sharedAliases = {
  '@': './src',
  '@ui': '../../packages/ui',
  '@ui/Spinner': '../../packages/ui/Spinner.jsx',
  '@shared-components': '../../packages/components',
  '@hooks': '../../packages/hooks',
  '@hooks/useAddons': '../../packages/hooks/useAddons.js',
  '@hooks/useAuth': '../../packages/hooks/useAuth.js',
  '@hooks/useBooking': '../../packages/hooks/useBooking.js',
  '@hooks/useBookingDraft': '../../packages/hooks/useBookingDraft.js',
  '@hooks/useBookingPricingRules': '../../packages/hooks/useBookingPricingRules.js',
  '@hooks/useBranches': '../../packages/hooks/useBranches.js',
  '@hooks/useFaq': '../../packages/hooks/useFaq.js',
  '@hooks/useItems': '../../packages/hooks/useItems.js',
  '@hooks/useLegalPages': '../../packages/hooks/useLegalPages.js',
  '@hooks/useSiteSetting': '../../packages/hooks/useSiteSetting.js',
  '@hooks/useTestimonials': '../../packages/hooks/useTestimonials.js',
  '@lib': '../../packages/lib',
  '@lib/addonApi': '../../packages/lib/addonApi.js',
  '@lib/api': '../../packages/lib/api.js',
  '@lib/bookingDraftApi': '../../packages/lib/bookingDraftApi.js',
  '@lib/bookingPricingApi': '../../packages/lib/bookingPricingApi.js',
  '@lib/branchApi': '../../packages/lib/branchApi.js',
  '@lib/contactApi': '../../packages/lib/contactApi.js',
  '@lib/faqApi': '../../packages/lib/faqApi.js',
  '@lib/itemApi': '../../packages/lib/itemApi.js',
  '@lib/legalApi': '../../packages/lib/legalApi.js',
  '@lib/siteSettingApi': '../../packages/lib/siteSettingApi.js',
  '@lib/testimonialApi': '../../packages/lib/testimonialApi.js',
  '@utils': '../../packages/utils',
  '@utils/pricing': '../../packages/utils/pricing.js',
  '@utils/utils': '../../packages/utils/utils.js',
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isVercel ? {} : { output: 'standalone' }),
  transpilePackages: [
    '@tithi/ui',
    '@tithi/components',
    '@tithi/hooks',
    '@tithi/utils',
    '@tithi/lib',
    '@tithi/store',
    '@tithi/data',
    '@tithi/styles',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: iconCdnHost,
        pathname: '/icons/**',
      },
    ],
  },
  turbopack: {
    resolveAlias: sharedAliases,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
