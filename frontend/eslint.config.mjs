import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

export default [
  {
    ignores: [
      '**/.next/**',
      '**/node_modules/**',
      '**/out/**',
      '**/dist/**',
      '**/coverage/**',
    ],
  },
  ...nextCoreWebVitals,
  {
    settings: {
      next: {
        rootDir: [
          'apps/admin/',
          'apps/monitoring/',
          'apps/website/',
        ],
      },
    },
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
    },
  },
];
