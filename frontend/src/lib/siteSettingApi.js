const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

async function request(options = {}) {
  const response = await fetch(`${API_URL}/api/site-setting`, { cache: 'no-store', ...options, headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || payload.error || 'Site settings request failed.');
  return payload.data ?? payload;
}

export const getSiteSetting = () => request();
export const updateSiteSetting = (data) => request({ method: 'PATCH', credentials: 'include', body: JSON.stringify(data) });

