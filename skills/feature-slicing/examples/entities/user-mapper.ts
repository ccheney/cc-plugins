// entities/user/model/mapper.ts
import type { User, UserDTO } from './types';

/**
 * Transforms a UserDTO from the API into the domain User model.
 *
 * @param dto - The raw user data transfer object from the API response
 * @returns A normalized User object for use in the application
 *
 * @remarks
 * Handles the following transformations:
 * - Converts numeric `id` to string
 * - Maps `avatar_url` to `avatar`, converting null to undefined
 * - Parses `created_at` ISO string to a Date object
 * - Casts the string `role` to the UserRole union type
 *
 * @example
 * ```ts
 * const dto: UserDTO = await fetchUser(id);
 * const user: User = mapUserDTO(dto);
 * ```
 */
export function mapUserDTO(dto: UserDTO): User {
  return {
    id: String(dto.id),
    email: dto.email,
    name: dto.name,
    avatar: dto.avatar_url ?? undefined,
    role: dto.role as User['role'],
    createdAt: new Date(dto.created_at),
  };
}
