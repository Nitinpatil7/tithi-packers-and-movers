import { authFetch } from './authFetch';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

async function request(options = {}) {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const response = await authFetch(`${API_URL}/api/site-setting`, {
    cache: 'no-store',
    ...options,
    headers: {
      ...(options.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || payload.error || 'Site settings request failed.');
  return payload.data ?? payload;
}

export const getSiteSetting = () => request();
export const updateSiteSetting = (data) => request({ method: 'PATCH', credentials: 'include', body: JSON.stringify(data) });
export const uploadSiteLogo = (file) => {
  const formData = new FormData();
  formData.append('logo', file);
  return request({ method: 'POST', credentials: 'include', body: formData });
};
