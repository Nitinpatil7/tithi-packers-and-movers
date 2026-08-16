import { authFetch } from './authFetch';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

const queryString = (filters = {}) => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') query.set(key, String(value));
  });
  return query.toString() ? `?${query}` : '';
};

async function pricingRequest(path, options = {}) {
  const response = await authFetch(`${API_URL}/api/booking-pricing-rules${path}`, {
    cache: 'no-store',
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || payload.error || 'Booking pricing request failed.');
  return payload.data ?? payload;
}

const list = (payload) => Array.isArray(payload) ? payload : payload?.rules || payload?.items || payload?.results || [];

export const getPublicPricingRules = (filters = {}) => pricingRequest(queryString(filters));
export const getPublicPricingRule = (serviceType) => pricingRequest(`/${encodeURIComponent(serviceType)}`);
export const getAdminPricingRules = (filters = {}) => pricingRequest(`/admin/all${queryString(filters)}`, { credentials: 'include' }).then(list);
export const getAdminPricingRule = (id) => pricingRequest(`/admin/${encodeURIComponent(id)}`, { credentials: 'include' });
export const createDefaultPricingRules = () => pricingRequest('/admin/defaults', { method: 'POST', credentials: 'include' });
export const createPricingRule = (data) => pricingRequest('/admin', { method: 'POST', credentials: 'include', body: JSON.stringify(data) });
export const updatePricingRule = (id, data) => pricingRequest(`/admin/${encodeURIComponent(id)}`, { method: 'PATCH', credentials: 'include', body: JSON.stringify(data) });
export const deletePricingRule = (id) => pricingRequest(`/admin/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' });
