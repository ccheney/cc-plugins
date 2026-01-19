// entities/user/ui/UserCard.tsx
import type { User } from '../model/types';
import { UserAvatar } from './UserAvatar';

/**
 * Props for the UserCard component.
 */
interface UserCardProps {
  /** The user to display in the card. */
  user: User;

  /** Optional click handler for card interaction. */
  onClick?: () => void;
}

/**
 * A clickable card displaying user information with their avatar.
 *
 * @remarks
 * Renders a bordered card with the user's avatar, name, and email.
 * Includes hover state styling when interactive.
 *
 * @example
 * ```tsx
 * <UserCard
 *   user={selectedUser}
 *   onClick={() => navigate(`/users/${selectedUser.id}`)}
 * />
 * ```
 */
export function UserCard({ user, onClick }: UserCardProps) {
  return (
    <div
      className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
      onClick={onClick}
    >
      <UserAvatar user={user} />
      <div>
        <p className="font-medium">{user.name}</p>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>
    </div>
  );
}
