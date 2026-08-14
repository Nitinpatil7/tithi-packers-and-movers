const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

async function bookingRequest(path, options = {}) {
  const response = await fetch(`${API_URL}/api/bookings${path}`, {
    cache: 'no-store',
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || payload.error || 'Booking request failed.');
  return payload.data ?? payload;
}

export const createBookingDraft = (data) => bookingRequest('/draft', { method: 'POST', body: JSON.stringify(data) });
export const updateBookingDraft = (bookingId, draftToken, data) => bookingRequest(`/${encodeURIComponent(bookingId)}/draft`, { method: 'PATCH', headers: { 'x-draft-token': draftToken }, body: JSON.stringify(data) });
export const confirmBookingDraft = (bookingId, draftToken, data) => bookingRequest(`/${encodeURIComponent(bookingId)}/confirm`, { method: 'POST', headers: { 'x-draft-token': draftToken }, body: JSON.stringify(data) });
export const getBookingQuote = (bookingId, draftToken) => bookingRequest(`/${encodeURIComponent(bookingId)}/quote`, { headers: { 'x-draft-token': draftToken } });

