import axios from 'axios';

// The server holds no session - every request must carry the bearer token itself.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('keystone_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Expired/invalid token - clear it and force a fresh login.
      localStorage.removeItem('keystone_token');
      localStorage.removeItem('keystone_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export function apiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || err.message;
  }
  return 'Something went wrong';
}
