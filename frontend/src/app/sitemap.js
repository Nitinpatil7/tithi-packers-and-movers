// src/app/sitemap.js
export default async function sitemap() {
  const baseUrl = 'https://tithipacking.com';

  const routes = [
    '',
    '/about',
    '/contact',
    '/my-bookings',
    '/book/local-shifting',
    '/book/intercity-moving',
    '/book/labour-service',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
