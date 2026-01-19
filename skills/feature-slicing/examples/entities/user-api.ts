// entities/user/api/userApi.ts
import { apiClient } from '@/shared/api';
import { mapUserDTO } from '../model/mapper';
import type { User, UserDTO } from '../model/types';

/**
 * Fetches the currently authenticated user's profile.
 *
 * @returns The current user's data
 * @throws {AxiosError} When the request fails or user is not authenticated
 *
 * @example
 * ```ts
 * const user = await getCurrentUser();
 * console.log(`Welcome, ${user.name}`);
 * ```
 */
export async function getCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<UserDTO>('/users/me');
  return mapUserDTO(data);
}

/**
 * Fetches a user by their unique identifier.
 *
 * @param id - The user's unique identifier
 * @returns The requested user's data
 * @throws {AxiosError} When the user is not found or request fails
 *
 * @example
 * ```ts
 * const user = await getUserById('user-123');
 * ```
 */
export async function getUserById(id: string): Promise<User> {
  const { data } = await apiClient.get<UserDTO>(`/users/${id}`);
  return mapUserDTO(data);
}

/**
 * Updates a user's profile information.
 *
 * @param id - The user's unique identifier
 * @param updates - Partial user data to update
 * @returns The updated user data
 * @throws {AxiosError} When the update fails or user is not found
 *
 * @example
 * ```ts
 * const updated = await updateUser('user-123', { name: 'New Name' });
 * ```
 */
export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  const { data } = await apiClient.patch<UserDTO>(`/users/${id}`, updates);
  return mapUserDTO(data);
}
