// features/auth/index.ts (PUBLIC API)
/**
 * @fileoverview Public API for the Authentication feature slice.
 *
 * @remarks
 * This module exposes the public interface for authentication functionality.
 * Import from this file rather than reaching into internal modules.
 *
 * @example
 * ```ts
 * // Correct: Import from the public API
 * import { LoginForm, useAuthStore, login } from '@/features/auth';
 *
 * // Incorrect: Deep imports into the slice
 * import { useAuthStore } from '@/features/auth/model/store';
 * ```
 */

// UI Components
export { LoginForm } from './ui/LoginForm';
export { LogoutButton } from './ui/LogoutButton';

// API Functions
export { login, register, logout, refreshTokens } from './api/authApi';

// State Management
export { useAuthStore } from './model/store';

// Validation Schemas
export { loginSchema, registerSchema } from './model/schema';

// Types
export type { LoginCredentials, RegisterCredentials, AuthTokens } from './model/types';
