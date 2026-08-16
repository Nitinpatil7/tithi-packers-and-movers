const API_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

let refreshPromise = null;

const isCredentialed = (options = {}) => options.credentials === 'include';

const refreshAdminSession = async () => {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/api/admin-auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    }).finally(() => {
      refreshPromise = null;
    });
  }

  const response = await refreshPromise;
  if (!response.ok) return false;
  return true;
};

export const authFetch = async (url, options = {}) => {
  const { __retriedAfterRefresh, ...requestOptions } = options;
  const response = await fetch(url, requestOptions);
  if (response.status !== 401 || !isCredentialed(requestOptions) || __retriedAfterRefresh) {
    return response;
  }

  const refreshed = await refreshAdminSession();
  if (!refreshed) return response;

  return authFetch(url, { ...requestOptions, __retriedAfterRefresh: true });
};

export { refreshAdminSession };
