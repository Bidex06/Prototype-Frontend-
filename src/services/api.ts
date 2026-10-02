import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5212/api').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh tokens are single-use on the backend, so only ONE refresh may run at a time.
// Requests that fail with 401 while a refresh is running wait for it and reuse its result.
let refreshPromise: Promise<string> | null = null;

function redirectToLogin() {
  localStorage.clear();
  window.location.href = '/login';
}

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return Promise.reject(new Error('No refresh token'));
    }

    refreshPromise = axios
      .post(`${API_URL}/auth/refresh`, { refreshToken })
      .then((res) => {
        localStorage.setItem('accessToken', res.data.accessToken);
        // The backend rotates the refresh token; keep the new one or the next refresh fails.
        if (res.data.refreshToken) {
          localStorage.setItem('refreshToken', res.data.refreshToken);
        }
        return res.data.accessToken as string;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && original && !original._retried) {
      original._retried = true;

      try {
        const accessToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        redirectToLogin();
      }
    }

    return Promise.reject(error);
  }
);

export { api, API_URL };
