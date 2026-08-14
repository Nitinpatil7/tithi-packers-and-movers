const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

async function contactRequest(path = '', options = {}) {
  const response = await fetch(`${API_URL}/api/contact${path}`, {
    cache: 'no-store',
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || payload.error || 'Contact request failed.');
  return payload.data ?? payload;
}

const extractContacts = (payload) => {
  if (Array.isArray(payload)) return payload;
  return payload?.contacts || payload?.inquiries || payload?.items || payload?.results || [];
};

export const submitContact = (data) => contactRequest('', { method: 'POST', body: JSON.stringify(data) });
export const getContacts = (status) => contactRequest(status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '', { credentials: 'include' }).then(extractContacts);
export const getContactById = (id) => contactRequest(`/${id}`, { credentials: 'include' });
export const updateContact = (id, data) => contactRequest(`/${id}`, { method: 'PATCH', credentials: 'include', body: JSON.stringify(data) });
export const deleteContact = (id) => contactRequest(`/${id}`, { method: 'DELETE', credentials: 'include' });
