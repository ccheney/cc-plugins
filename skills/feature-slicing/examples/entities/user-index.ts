// entities/user/index.ts (PUBLIC API)
/**
 * @fileoverview Public API for the User entity slice.
 *
 * @remarks
 * This module exposes the public interface for the user entity.
 * Import from this file rather than reaching into internal modules.
 *
 * @example
 * ```ts
 * // Correct: Import from the public API
 * import { User, UserCard, getCurrentUser } from '@/entities/user';
 *
 * // Incorrect: Deep imports into the slice
 * import { User } from '@/entities/user/model/types';
 * ```
 */

// UI Components
export { UserAvatar } from './ui/UserAvatar';
export { UserCard } from './ui/UserCard';

// API Functions
export { getCurrentUser, getUserById, updateUser } from './api/userApi';

// Types and Models
export type { User, UserRole, UserDTO } from './model/types';
export { userSchema, type UserFormData } from './model/schema';
export { mapUserDTO } from './model/mapper';
