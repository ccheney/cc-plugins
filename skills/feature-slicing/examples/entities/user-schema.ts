// entities/user/model/schema.ts
import { z } from 'zod';

/**
 * Zod validation schema for user form data.
 *
 * @remarks
 * Validates:
 * - `email` - Must be a valid email format
 * - `name` - Minimum 2 characters
 * - `role` - Must be one of: 'admin', 'user', 'guest'
 *
 * @example
 * ```ts
 * const result = userSchema.safeParse(formData);
 * if (!result.success) {
 *   console.error(result.error.flatten().fieldErrors);
 * }
 * ```
 */
export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['admin', 'user', 'guest']),
});

/**
 * TypeScript type inferred from the userSchema validation.
 *
 * @remarks
 * Use this type for form state and submission handlers.
 */
export type UserFormData = z.infer<typeof userSchema>;
