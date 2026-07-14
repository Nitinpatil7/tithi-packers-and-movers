const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

async function adminRequest(path, options = {}) {
  const response = await fetch(`${API_URL}/api/admin-auth${path}`, {
    credentials: 'include',
    cache: 'no-store',
    ...options,
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
