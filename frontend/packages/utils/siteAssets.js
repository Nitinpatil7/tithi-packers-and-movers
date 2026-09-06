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

export const resolveSiteLogoUrl = (value = '') => resolveSiteAssetUrl(value);
