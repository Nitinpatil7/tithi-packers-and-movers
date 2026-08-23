import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isVercel = process.env.VERCEL === '1';
const resolveAliasPath = (target) => (
  process.platform === 'win32' ? target : path.resolve(__dirname, target)
);

const sharedAliases = {
  '@': resolveAliasPath('./src'),
  '@ui': resolveAliasPath('../../packages/ui'),
  '@ui/Spinner': resolveAliasPath('../../packages/ui/Spinner.jsx'),
  '@shared-components': resolveAliasPath('../../packages/components'),
  '@hooks': resolveAliasPath('../../packages/hooks'),
  '@hooks/useAddons': resolveAliasPath('../../packages/hooks/useAddons.js'),
  '@hooks/useAuth': resolveAliasPath('../../packages/hooks/useAuth.js'),
  '@hooks/useBooking': resolveAliasPath('../../packages/hooks/useBooking.js'),
  '@hooks/useBookingDraft': resolveAliasPath('../../packages/hooks/useBookingDraft.js'),
  '@hooks/useBookingPricingRules': resolveAliasPath('../../packages/hooks/useBookingPricingRules.js'),
  '@hooks/useBranches': resolveAliasPath('../../packages/hooks/useBranches.js'),
  '@hooks/useFaq': resolveAliasPath('../../packages/hooks/useFaq.js'),
  '@hooks/useItems': resolveAliasPath('../../packages/hooks/useItems.js'),
  '@hooks/useLegalPages': resolveAliasPath('../../packages/hooks/useLegalPages.js'),
  '@hooks/useSiteSetting': resolveAliasPath('../../packages/hooks/useSiteSetting.js'),
  '@hooks/useTestimonials': resolveAliasPath('../../packages/hooks/useTestimonials.js'),
  '@lib': resolveAliasPath('../../packages/lib'),
  '@lib/addonApi': resolveAliasPath('../../packages/lib/addonApi.js'),
  '@lib/api': resolveAliasPath('../../packages/lib/api.js'),
  '@lib/bookingDraftApi': resolveAliasPath('../../packages/lib/bookingDraftApi.js'),
  '@lib/bookingPricingApi': resolveAliasPath('../../packages/lib/bookingPricingApi.js'),
  '@lib/branchApi': resolveAliasPath('../../packages/lib/branchApi.js'),
  '@lib/contactApi': resolveAliasPath('../../packages/lib/contactApi.js'),
  '@lib/faqApi': resolveAliasPath('../../packages/lib/faqApi.js'),
  '@lib/itemApi': resolveAliasPath('../../packages/lib/itemApi.js'),
  '@lib/legalApi': resolveAliasPath('../../packages/lib/legalApi.js'),
  '@lib/siteSettingApi': resolveAliasPath('../../packages/lib/siteSettingApi.js'),
  '@lib/testimonialApi': resolveAliasPath('../../packages/lib/testimonialApi.js'),
  '@utils': resolveAliasPath('../../packages/utils'),
  '@utils/itemIcons': resolveAliasPath('../../packages/utils/itemIcons.jsx'),
  '@utils/pricing': resolveAliasPath('../../packages/utils/pricing.js'),
  '@utils/utils': resolveAliasPath('../../packages/utils/utils.js'),
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
