const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

async function legalRequest(path = '', options = {}) {
  const response = await fetch(`${API_URL}/api/legal${path}`, {
    cache: 'no-store',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || payload.error || 'Legal page request failed.');
  return payload.data ?? payload;
}

const asList = (payload) => {
  if (Array.isArray(payload)) return payload;
  return payload?.legalPages || payload?.pages || payload?.items || [];
};

export const getPublishedLegalPage = (slug) => legalRequest(`/${encodeURIComponent(slug)}`);

export const getLegalPages = async (filters = {}) => {
  const query = new URLSearchParams();
  if (filters.isPublished !== undefined && filters.isPublished !== '') query.set('isPublished', filters.isPublished);
  if (filters.type) query.set('type', filters.type);
  const suffix = query.toString() ? `?${query}` : '';
  return asList(await legalRequest(`/all${suffix}`, { credentials: 'include' }));
};

export const getLegalPageById = (id) => legalRequest(`/id/${encodeURIComponent(id)}`, { credentials: 'include' });
export const createLegalPage = (data) => legalRequest('', { method: 'POST', credentials: 'include', body: JSON.stringify(data) });
export const updateLegalPage = (id, data) => legalRequest(`/${encodeURIComponent(id)}`, { method: 'PATCH', credentials: 'include', body: JSON.stringify(data) });
export const unpublishLegalPage = (id) => legalRequest(`/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' });

