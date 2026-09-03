const baseUrl = 'https://tithipackers.in';

const routes = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/book/local-shifting', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/book/intercity-moving', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/book/labour-service', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/feedback', changeFrequency: 'monthly', priority: 0.55 },
  { path: '/my-bookings', changeFrequency: 'monthly', priority: 0.45 },
  { path: '/profile', changeFrequency: 'monthly', priority: 0.35 },
];

export default function sitemap() {
  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
