const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
export const DEFAULT_SITE_LOGO = '/logo.png';

export const resolveSiteAssetUrl = (value = '') => {
  const url = String(value || '').trim();
  if (!url) return '';
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (url.startsWith('/')) return API_URL ? `${API_URL}${url}` : url;
  return url;
};

export const resolveSiteLogoUrl = (value = '', fallback = DEFAULT_SITE_LOGO) => resolveSiteAssetUrl(value) || fallback;
