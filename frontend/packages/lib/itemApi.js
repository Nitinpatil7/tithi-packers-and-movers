const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

const queryString = (filters = {}) => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') query.set(key, String(value));
  });
  return query.toString() ? `?${query}` : '';
};

async function itemRequest(path, options = {}) {
  const response = await fetch(`${API_URL}/api/items${path}`, {
    cache: 'no-store',
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || payload.error || 'Item request failed.');
  return payload.data ?? payload;
}

const asList = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) if (Array.isArray(payload?.[key])) return payload[key];
  return [];
};

export const getItemCatalog = (filters = {}) => itemRequest(`/catalog${queryString(filters)}`).then((data) => asList(data, ['sections', 'catalog', 'items']));
export const getAdminItemCatalog = (filters = {}) => itemRequest(`/admin/catalog${queryString(filters)}`, { credentials: 'include' }).then((data) => asList(data, ['sections', 'catalog', 'items']));
export const getAdminSections = (filters = {}) => itemRequest(`/admin/sections${queryString(filters)}`, { credentials: 'include' }).then((data) => asList(data, ['sections', 'items']));
export const getAdminGroups = (filters = {}) => itemRequest(`/admin/groups${queryString(filters)}`, { credentials: 'include' }).then((data) => asList(data, ['groups', 'items']));
export const getAdminSizes = (filters = {}) => itemRequest(`/admin/sizes${queryString(filters)}`, { credentials: 'include' }).then((data) => asList(data, ['sizes', 'items']));

const mutation = (resource, method, data, id) => itemRequest(`/admin/${resource}${id ? `/${encodeURIComponent(id)}` : ''}`, { method, credentials: 'include', ...(data ? { body: JSON.stringify(data) } : {}) });
export const createSection = (data) => mutation('sections', 'POST', data);
export const updateSection = (id, data) => mutation('sections', 'PATCH', data, id);
export const deleteSection = (id) => mutation('sections', 'DELETE', null, id);
export const createGroup = (data) => mutation('groups', 'POST', data);
export const updateGroup = (id, data) => mutation('groups', 'PATCH', data, id);
export const deleteGroup = (id) => mutation('groups', 'DELETE', null, id);
export const reorderGroups = (data) => mutation('groups/reorder', 'PATCH', data);
export const createSize = (data) => mutation('sizes', 'POST', data);
export const updateSize = (id, data) => mutation('sizes', 'PATCH', data, id);
export const deleteSize = (id) => mutation('sizes', 'DELETE', null, id);
export const createItem = (data) => mutation('items', 'POST', data);
export const updateItem = (id, data) => mutation('items', 'PATCH', data, id);
export const deleteItem = (id) => mutation('items', 'DELETE', null, id);
export const reorderItems = (data) => mutation('items/reorder', 'PATCH', data);
