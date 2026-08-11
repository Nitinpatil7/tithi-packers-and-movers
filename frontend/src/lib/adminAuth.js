const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
const ADMIN_REQUEST_TIMEOUT_MS = 5000;

async function adminRequest(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ADMIN_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}/api/admin-auth${path}`, {
      credentials: 'include',
      cache: 'no-store',
      ...options,
      signal: options.signal || controller.signal,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.message || data.error || 'Unable to complete the request.');
      error.status = response.status;
      throw error;
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Admin API timed out. Please check the backend server.');
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const adminLogin = (email, password) => adminRequest('/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});

export const getAdminMe = () => adminRequest('/me');
export const adminLogout = () => adminRequest('/logout', { method: 'POST' });
export const changeAdminPassword = (currentPassword, newPassword) => adminRequest('/change-password', {
  method: 'PATCH',
  body: JSON.stringify({ currentPassword, newPassword }),
});
