// features/auth/model/schema.ts
import { z } from 'zod';

/**
 * Zod validation schema for login form data.
 *
 * @remarks
 * Validates:
 * - `email` - Must be a valid email format
 * - `password` - Minimum 8 characters
 *
 * @example
 * ```ts
 * const result = loginSchema.safeParse({ email, password });
 * if (!result.success) {
 *   setErrors(result.error.flatten().fieldErrors);
 * }
 * ```
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * Zod validation schema for registration form data.
 *
 * @remarks
 * Extends loginSchema with additional fields and includes a refinement
 * to ensure password and confirmPassword match.
 *
 * Validates:
 * - All fields from loginSchema
 * - `name` - Minimum 2 characters
 * - `confirmPassword` - Must match the password field
 *
 * @example
 * ```ts
 * const result = registerSchema.safeParse(formData);
 * if (!result.success) {
 *   const errors = result.error.flatten();
 *   // errors.fieldErrors contains per-field validation errors
 * }
 * ```
 */
export const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
