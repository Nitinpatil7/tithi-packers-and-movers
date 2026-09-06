import { authFetch } from './authFetch';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

const readResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || payload.error || 'Email notification request failed.');
  return payload.data ?? payload;
};

export const getEmailNotificationSettings = () => authFetch(`${API_URL}/api/email-notifications/admin/settings`, {
  credentials: 'include',
}).then(readResponse);

export const updateEmailNotificationSettings = (data) => authFetch(`${API_URL}/api/email-notifications/admin/settings`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify(data),
}).then(readResponse);
