// entities/user/model/types.ts

/**
 * Represents a user in the application domain.
 *
 * @remarks
 * This is the normalized domain model used throughout the application.
 * Use {@link mapUserDTO} to convert from the API response format.
 */
export interface User {
  /** Unique identifier for the user. */
  id: string;

  /** User's email address used for authentication. */
  email: string;

  /** User's display name. */
  name: string;

  /** URL to the user's avatar image, if set. */
  avatar?: string;

  /** User's permission level within the system. */
  role: UserRole;

  /** Timestamp when the user account was created. */
  createdAt: Date;
}

/**
 * Permission levels available in the system.
 *
 * - `admin` - Full system access and user management capabilities
 * - `user` - Standard authenticated user with normal permissions
 * - `guest` - Limited read-only access
 */
export type UserRole = 'admin' | 'user' | 'guest';

/**
 * Data Transfer Object representing user data from the API.
 *
 * @remarks
 * This matches the snake_case format returned by the backend API.
 * Convert to {@link User} using {@link mapUserDTO} before use in the UI.
 */
export interface UserDTO {
  /** Numeric database identifier. */
  id: number;

  /** User's email address. */
  email: string;

  /** User's display name. */
  name: string;

  /** Avatar URL or null if not set. */
  avatar_url: string | null;

  /** Role name as a string. */
  role: string;

  /** ISO 8601 timestamp string of account creation. */
  created_at: string;
}
