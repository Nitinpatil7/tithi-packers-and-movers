import { NextResponse } from 'next/server';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '').replace(/\/$/, '');
const ASSET_REVALIDATE_SECONDS = 30 * 60;
const ASSET_CACHE_CONTROL = 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400';

function resolveLogoUrl(value) {
  const url = String(value || '').trim();
  if (!url) return '';
  if (/^https?:/i.test(url)) return url;
  if (url.startsWith('/') && API_URL) return `${API_URL}${url}`;
  return '';
}

export async function GET() {
  if (!API_URL) return new NextResponse(null, { status: 204 });

  const settingResponse = await fetch(`${API_URL}/api/site-setting`, { next: { revalidate: ASSET_REVALIDATE_SECONDS } });
  if (!settingResponse.ok) return new NextResponse(null, { status: 204 });

  const payload = await settingResponse.json().catch(() => ({}));
  const logoUrl = resolveLogoUrl(payload.data?.logoUrl || payload.logoUrl);
  if (!logoUrl) return new NextResponse(null, { status: 204 });

  const logoResponse = await fetch(logoUrl, { next: { revalidate: ASSET_REVALIDATE_SECONDS } });
  if (!logoResponse.ok) return new NextResponse(null, { status: 204 });

  return new NextResponse(logoResponse.body, {
    headers: {
      'Cache-Control': ASSET_CACHE_CONTROL,
      'Content-Type': logoResponse.headers.get('content-type') || 'image/png',
    },
  });
}
