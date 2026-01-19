// features/auth/model/types.ts

/**
 * Credentials required for user authentication.
 *
 * @example
 * ```ts
 * const credentials: LoginCredentials = {
 *   email: 'user@example.com',
 *   password: 'securePassword123',
 * };
 * ```
 */
export interface LoginCredentials {
  /** User's email address for authentication. */
  email: string;

  /** User's password in plain text (transmitted over HTTPS). */
  password: string;
}

/**
 * Extended credentials for new user registration.
 *
 * @extends LoginCredentials
 *
 * @example
 * ```ts
 * const newUser: RegisterCredentials = {
 *   email: 'newuser@example.com',
 *   password: 'securePassword123',
 *   name: 'John Doe',
 *   confirmPassword: 'securePassword123',
 * };
 * ```
 */
export interface RegisterCredentials extends LoginCredentials {
  /** Display name for the new user account. */
  name: string;

  /** Password confirmation to prevent typos during registration. */
  confirmPassword: string;
}

/**
 * JWT token pair for authenticated session management.
 *
 * @remarks
 * The access token is short-lived and used for API requests.
 * The refresh token has a longer lifespan and is used to obtain new access tokens.
 */
export interface AuthTokens {
  /** Short-lived JWT for API authorization headers. */
  accessToken: string;

  /** Long-lived token for obtaining new access tokens. */
  refreshToken: string;
}
