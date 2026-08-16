import { authFetch } from './authFetch';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

async function faqRequest(path = '', options = {}) {
  const response = await authFetch(`${API_URL}/api/faq${path}`, {
    cache: 'no-store',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || payload.error || 'FAQ request failed.');
  }
  return payload.data ?? payload;
}

export const getFaqs = (category) => {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  return faqRequest(query);
};

export const getFaqById = (id) => faqRequest(`/${id}`);

export const createFaq = (faq) => faqRequest('', {
  method: 'POST',
  credentials: 'include',
  body: JSON.stringify(faq),
});

export const updateFaq = (id, faq) => faqRequest(`/${id}`, {
  method: 'PATCH',
  credentials: 'include',
  body: JSON.stringify(faq),
});

export const reorderFaqs = (orderedIds) => faqRequest('/reorder', {
  method: 'PATCH',
  credentials: 'include',
  body: JSON.stringify({ orderedIds }),
});

export const deleteFaq = (id) => faqRequest(`/${id}`, {
  method: 'DELETE',
  credentials: 'include',
});
