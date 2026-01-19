// features/auth/model/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/entities/user';
import type { AuthTokens } from './types';

/**
 * Shape of the authentication state and actions.
 */
interface AuthState {
  /** Currently authenticated user, or null if not logged in. */
  user: User | null;

  /** JWT tokens for the current session. */
  tokens: AuthTokens | null;

  /** Computed flag indicating if the user is authenticated. */
  isAuthenticated: boolean;

  /**
   * Sets the authenticated user and tokens after successful login.
   * @param user - The authenticated user data
   * @param tokens - The JWT token pair
   */
  setAuth: (user: User, tokens: AuthTokens) => void;

  /** Clears all auth state, effectively logging out the user. */
  clearAuth: () => void;
}

/**
 * Global authentication state store using Zustand.
 *
 * @remarks
 * Persists to localStorage under the key 'auth-storage'.
 * Use this store to check authentication status and access user data.
 *
 * @example
 * ```tsx
 * function Profile() {
 *   const { user, isAuthenticated } = useAuthStore();
 *
 *   if (!isAuthenticated) {
 *     return <Navigate to="/login" />;
 *   }
 *
 *   return <div>Welcome, {user.name}</div>;
 * }
 * ```
 *
 * @example
 * ```ts
 * // Setting auth after login
 * const { setAuth } = useAuthStore();
 * const { user, tokens } = await login(credentials);
 * setAuth(user, tokens);
 * ```
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      setAuth: (user, tokens) => set({ user, tokens, isAuthenticated: true }),
      clearAuth: () => set({ user: null, tokens: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);
