// src/app/sitemap.js
export default async function sitemap() {
  const baseUrl = 'https://tithipacking.com';

  const routes = [
    '/website',
    '/website/about',
    '/website/contact',
    '/website/my-bookings',
    '/website/book/local-shifting',
    '/website/book/intercity-moving',
    '/website/book/labour-service',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'weekly',
    priority: route === '/website' ? 1.0 : 0.8,
  }));
}
