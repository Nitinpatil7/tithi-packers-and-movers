import { authFetch } from './authFetch';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

async function testimonialRequest(path = '', options = {}) {
  const response = await authFetch(`${API_URL}/api/testimonial${path}`, {
    cache: 'no-store',
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || payload.error || 'Testimonial request failed.');
  return payload.data ?? payload;
}

const asList = (payload) => {
  if (Array.isArray(payload)) return payload;
  return payload?.testimonials || payload?.items || payload?.results || [];
};

const toQuery = (filters = {}) => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== 'all') query.set(key, value);
  });
  return query.toString() ? `?${query}` : '';
};

export const getPublicTestimonials = (filters = {}) => testimonialRequest(toQuery(filters)).then(asList);
export const getAdminTestimonials = (filters = {}) => testimonialRequest(`/admin/all${toQuery(filters)}`, { credentials: 'include' }).then(asList);
export const getTestimonialById = (id) => testimonialRequest(`/${encodeURIComponent(id)}`, { credentials: 'include' });
export const createTestimonial = (data) => testimonialRequest('', { method: 'POST', credentials: 'include', body: JSON.stringify(data) });
export const updateTestimonial = (id, data) => testimonialRequest(`/${encodeURIComponent(id)}`, { method: 'PATCH', credentials: 'include', body: JSON.stringify(data) });
export const deleteTestimonial = (id) => testimonialRequest(`/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' });
export const reorderTestimonials = (orderedIds) => testimonialRequest('/admin/reorder', { method: 'PATCH', credentials: 'include', body: JSON.stringify({ orderedIds }) });
