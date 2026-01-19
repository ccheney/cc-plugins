// entities/user/ui/UserAvatar.tsx
import type { User } from '../model/types';

/**
 * Props for the UserAvatar component.
 */
interface UserAvatarProps {
  /** The user whose avatar to display. */
  user: User;

  /** Size preset for the avatar dimensions. Defaults to 'md'. */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Displays a user's avatar image or a fallback with their initial.
 *
 * @remarks
 * When the user has an avatar URL, displays the image. Otherwise,
 * shows a gray circle with the first letter of their name.
 *
 * Size mappings:
 * - `sm` - 32x32px (w-8 h-8)
 * - `md` - 48x48px (w-12 h-12)
 * - `lg` - 64x64px (w-16 h-16)
 *
 * @example
 * ```tsx
 * <UserAvatar user={currentUser} size="lg" />
 * ```
 */
export function UserAvatar({ user, size = 'md' }: UserAvatarProps) {
  const sizeClass = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }[size];

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={`${sizeClass} rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-gray-300 flex items-center justify-center`}>
      <span className="text-gray-600 font-medium">
        {user.name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
