import LegalPageClient from './LegalPageClient';

const titleFromSlug = (slug = '') => String(slug)
  .split('-')
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';
  const title = titleFromSlug(slug) || 'Legal Information';

  return {
    title: `${title} for Tithi Packers & Movers`,
    description: `Read ${title.toLowerCase()} details for Tithi Packers & Movers, No. 1 Packers and Movers in Surat.`,
    alternates: { canonical: `/legal/${slug}` },
  };
}

export default async function LegalPage({ params }) {
  const resolvedParams = await params;
  return <LegalPageClient params={resolvedParams} />;
}
