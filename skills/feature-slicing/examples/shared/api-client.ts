// shared/api/client.ts
import axios, { type AxiosInstance } from 'axios';

/**
 * Pre-configured Axios HTTP client for API communication.
 *
 * @remarks
 * This client is configured with:
 * - Base URL from environment variables
 * - 10 second timeout
 * - JSON content type headers
 * - Automatic Bearer token injection from localStorage
 * - Automatic redirect to login on 401 responses
 *
 * @example
 * ```ts
 * import { apiClient } from '@/shared/api';
 *
 * const { data } = await apiClient.get<User>('/users/me');
 * ```
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor that attaches the Bearer token to outgoing requests.
 *
 * @remarks
 * Retrieves the access token from localStorage and adds it to the
 * Authorization header if present.
 */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor that handles authentication errors.
 *
 * @remarks
 * On 401 Unauthorized responses:
 * - Removes the access token from localStorage
 * - Redirects the user to the login page
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
