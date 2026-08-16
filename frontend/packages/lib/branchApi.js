import { authFetch } from './authFetch';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

async function request(path = '', options = {}) {
  const response = await authFetch(`${API_URL}/api/branch${path}`, { cache: 'no-store', ...options, headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || payload.error || 'Branch request failed.');
  return payload.data ?? payload;
}

const asList = (payload) => Array.isArray(payload) ? payload : payload?.branches || payload?.items || payload?.results || [];
export const getBranches = () => request().then(asList);
export const getMainBranch = () => request('/main');
export const getBranchById = (id) => request(`/${encodeURIComponent(id)}`);
export const createBranch = (data) => request('', { method: 'POST', credentials: 'include', body: JSON.stringify(data) });
export const updateBranch = (id, data) => request(`/${encodeURIComponent(id)}`, { method: 'PATCH', credentials: 'include', body: JSON.stringify(data) });
export const deleteBranch = (id) => request(`/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' });
