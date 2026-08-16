import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_TITHI_APP: 'monitoring',
  },
  output: 'standalone',
  transpilePackages: [
    '@tithi/ui',
    '@tithi/components',
    '@tithi/lib',
    '@tithi/store',
    '@tithi/styles',
  ],
  images: {
    unoptimized: true,
  },
  experimental: {
    externalDir: true,
    outputFileTracingRoot: path.join(__dirname, '../../'),
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
