```ts
import axios from 'axios';

// Backend URL:
// Local development:
//   VITE_API_BASE_URL=http://localhost:8080
//
// Production/Render:
//   VITE_API_BASE_URL=https://keystone-backend-m4zd.onrender.com

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add JWT token to every protected API request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('keystone_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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
```
