const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

const queryString = (filters = {}) => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') query.set(key, Array.isArray(value) ? value.join(',') : String(value));
  });
  return query.toString() ? `?${query}` : '';
};

async function addonRequest(path, options = {}) {
  const response = await fetch(`${API_URL}/api/addon${path}`, {
    cache: 'no-store', ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || payload.error || 'Add-on request failed.');
  return payload.data ?? payload;
}

const list = (payload) => Array.isArray(payload) ? payload : payload?.addons || payload?.items || payload?.results || [];
const addonKeyFromName = (name = '') => String(name)
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '');
const withGeneratedKey = (data = {}) => ({ ...data, key: data.key || addonKeyFromName(data.name) });
export const getAvailableAddons = (filters) => addonRequest(`/available${queryString(filters)}`).then(list);
export const getAdminAddons = (filters = {}) => addonRequest(`/admin/all${queryString(filters)}`, { credentials: 'include' }).then(list);
export const getTriggerGroups = (filters = {}) => addonRequest(`/admin/trigger-groups${queryString(filters)}`, { credentials: 'include' }).then(list);
export const createAddon = (data) => addonRequest('', { method: 'POST', credentials: 'include', body: JSON.stringify(withGeneratedKey(data)) });
export const updateAddon = (id, data) => addonRequest(`/${encodeURIComponent(id)}`, { method: 'PATCH', credentials: 'include', body: JSON.stringify(data) });
export const deleteAddon = (id) => addonRequest(`/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' });
