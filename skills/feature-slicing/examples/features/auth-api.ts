// features/auth/api/authApi.ts
import { apiClient } from '@/shared/api';
import type { User } from '@/entities/user';
import type { LoginCredentials, RegisterCredentials, AuthTokens } from '../model/types';

/**
 * Response shape from authentication endpoints.
 */
interface AuthResponse {
  /** The authenticated user's profile data. */
  user: User;

  /** JWT tokens for session management. */
  tokens: AuthTokens;
}

/**
 * Authenticates a user with email and password credentials.
 *
 * @param credentials - The user's login credentials
 * @returns The authenticated user and session tokens
 * @throws {AxiosError} When credentials are invalid or request fails
 *
 * @example
 * ```ts
 * try {
 *   const { user, tokens } = await login({ email, password });
 *   setAuth(user, tokens);
 *   navigate('/dashboard');
 * } catch (error) {
 *   showError('Invalid credentials');
 * }
 * ```
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return data;
}

/**
 * Creates a new user account and authenticates them.
 *
 * @param credentials - The new user's registration data
 * @returns The created user and session tokens
 * @throws {AxiosError} When registration fails (e.g., email already exists)
 *
 * @example
 * ```ts
 * const { user, tokens } = await register({
 *   email: 'new@example.com',
 *   password: 'secure123',
 *   name: 'New User',
 *   confirmPassword: 'secure123',
 * });
 * ```
 */
export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', credentials);
  return data;
}

/**
 * Terminates the current user session on the server.
 *
 * @remarks
 * Call this before clearing local auth state to ensure server-side
 * session cleanup. The refresh token will be invalidated.
 *
 * @throws {AxiosError} When the logout request fails
 *
 * @example
 * ```ts
 * await logout();
 * clearAuth();
 * navigate('/login');
 * ```
 */
export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

/**
 * Exchanges a refresh token for a new token pair.
 *
 * @param refreshToken - The current valid refresh token
 * @returns A new access/refresh token pair
 * @throws {AxiosError} When the refresh token is invalid or expired
 *
 * @remarks
 * Use this to silently refresh the session before the access token expires.
 * If this fails, the user should be redirected to login.
 *
 * @example
 * ```ts
 * const newTokens = await refreshTokens(currentTokens.refreshToken);
 * updateTokens(newTokens);
 * ```
 */
export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const { data } = await apiClient.post<AuthTokens>('/auth/refresh', { refreshToken });
  return data;
}
