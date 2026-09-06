const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

const isLocalAssetHost = (hostname = '') => (
  ['localhost', '127.0.0.1', '::1'].includes(hostname)
  || /^(10|127|172\.(1[6-9]|2\d|3[01])|192\.168)\./.test(hostname)
);

const avoidMixedContent = (value = '') => {
  if (!value.toLowerCase().startsWith('http://')) return value;
  try {
    const url = new URL(value);
    if (isLocalAssetHost(url.hostname)) return value;
    url.protocol = 'https:';
    return url.toString();
  } catch {
    return value;
  }
};

export const resolveSiteAssetUrl = (value = '') => {
  const url = String(value || '').trim();
  if (!url) return '';
  if (/^(https?:|data:|blob:)/i.test(url)) return avoidMixedContent(url);
  if (url.startsWith('/')) return avoidMixedContent(API_URL ? `${API_URL}${url}` : url);
  return url;
};

export const versionSiteAssetUrl = (value = '', version = '') => {
  const url = String(value || '').trim();
  const assetVersion = String(version || '').trim();
  if (!url || !assetVersion || /^(data:|blob:)/i.test(url)) return url;

  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    parsed.searchParams.set('v', assetVersion);
    return parsed.toString();
  } catch {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${encodeURIComponent(assetVersion)}`;
  }
};

export const siteLogoRouteUrl = (version = '') => {
  const assetVersion = String(version || '').trim();
  return assetVersion ? `/site-logo?v=${encodeURIComponent(assetVersion)}` : '/site-logo';
};

export const resolveSiteLogoUrl = (_value = '', version = '') => siteLogoRouteUrl(version);
