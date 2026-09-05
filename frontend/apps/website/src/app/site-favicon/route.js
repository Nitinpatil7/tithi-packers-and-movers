import { NextResponse } from 'next/server';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '').replace(/\/$/, '');

function resolveLogoUrl(value) {
  const url = String(value || '').trim();
  if (!url) return '';
  if (/^https?:/i.test(url)) return url;
  if (url.startsWith('/') && API_URL) return `${API_URL}${url}`;
  return '';
}

export async function GET() {
  if (!API_URL) return new NextResponse(null, { status: 204 });

  const settingResponse = await fetch(`${API_URL}/api/site-setting`, { cache: 'no-store' });
  if (!settingResponse.ok) return new NextResponse(null, { status: 204 });

  const payload = await settingResponse.json().catch(() => ({}));
  const logoUrl = resolveLogoUrl(payload.data?.logoUrl || payload.logoUrl);
  if (!logoUrl) return new NextResponse(null, { status: 204 });

  const logoResponse = await fetch(logoUrl, { cache: 'no-store' });
  if (!logoResponse.ok) return new NextResponse(null, { status: 204 });

  return new NextResponse(logoResponse.body, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Type': logoResponse.headers.get('content-type') || 'image/png',
    },
  });
}
