// widgets/header/ui/Header.tsx
import { Link } from 'react-router-dom';
import { SearchProducts } from '@/features/search-products';
import { LogoutButton, useAuthStore } from '@/features/auth';
import { UserAvatar } from '@/entities/user';
import { Logo } from '@/shared/ui';

/**
 * Main application header widget with navigation and user controls.
 *
 * @remarks
 * Composes multiple features and entities to create the top navigation bar.
 * Displays different content based on authentication state:
 * - Authenticated: Shows user avatar link to profile and logout button
 * - Unauthenticated: Shows sign-in link
 *
 * This widget follows FSD principles by composing lower-level slices
 * without containing business logic itself.
 *
 * @example
 * ```tsx
 * function Layout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <>
 *       <Header />
 *       <main>{children}</main>
 *     </>
 *   );
 * }
 * ```
 */
export function Header() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b">
      <Link to="/">
        <Logo />
      </Link>

      <SearchProducts />

      <nav className="flex items-center gap-4">
        {isAuthenticated && user ? (
          <>
            <Link to="/profile">
              <UserAvatar user={user} size="sm" />
            </Link>
            <LogoutButton />
          </>
        ) : (
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        )}
      </nav>
    </header>
  );
}
