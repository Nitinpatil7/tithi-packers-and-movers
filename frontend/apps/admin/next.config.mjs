const isVercel = process.env.VERCEL === '1';

const sharedAliases = {
  '@': './src',
  '@ui': '../../packages/ui',
  '@ui/Button': '../../packages/ui/Button.jsx',
  '@ui/Card': '../../packages/ui/Card.jsx',
  '@ui/Input': '../../packages/ui/Input.jsx',
  '@ui/Modal': '../../packages/ui/Modal.jsx',
  '@ui/Spinner': '../../packages/ui/Spinner.jsx',
  '@shared-components': '../../packages/components',
  '@hooks': '../../packages/hooks',
  '@hooks/useAddons': '../../packages/hooks/useAddons.js',
  '@hooks/useAuth': '../../packages/hooks/useAuth.js',
  '@hooks/useBookingPricingRules': '../../packages/hooks/useBookingPricingRules.js',
  '@hooks/useBranches': '../../packages/hooks/useBranches.js',
  '@hooks/useFaq': '../../packages/hooks/useFaq.js',
  '@hooks/useItems': '../../packages/hooks/useItems.js',
  '@hooks/useLegalPages': '../../packages/hooks/useLegalPages.js',
  '@hooks/useSiteSetting': '../../packages/hooks/useSiteSetting.js',
  '@hooks/useTestimonials': '../../packages/hooks/useTestimonials.js',
  '@lib': '../../packages/lib',
  '@lib/addonApi': '../../packages/lib/addonApi.js',
  '@lib/authFetch': '../../packages/lib/authFetch.js',
  '@lib/bookingDraftApi': '../../packages/lib/bookingDraftApi.js',
  '@lib/bookingPricingApi': '../../packages/lib/bookingPricingApi.js',
  '@lib/branchApi': '../../packages/lib/branchApi.js',
  '@lib/contactApi': '../../packages/lib/contactApi.js',
  '@lib/faqApi': '../../packages/lib/faqApi.js',
  '@lib/itemApi': '../../packages/lib/itemApi.js',
  '@lib/legalApi': '../../packages/lib/legalApi.js',
  '@lib/testimonialApi': '../../packages/lib/testimonialApi.js',
  '@utils': '../../packages/utils',
  '@utils/freeAllowanceDisplay': '../../packages/utils/freeAllowanceDisplay.js',
  '@utils/itemIcons': '../../packages/utils/itemIcons.jsx',
  '@utils/pricing': '../../packages/utils/pricing.js',
  '@utils/siteAssets': '../../packages/utils/siteAssets.js',
  '@utils/truckVisuals': '../../packages/utils/truckVisuals.js',
  '@utils/utils': '../../packages/utils/utils.js',
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_TITHI_APP: 'admin',
  },
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
    unoptimized: true,
  },
  turbopack: {
    resolveAlias: sharedAliases,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
