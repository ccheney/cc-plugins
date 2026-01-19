// features/auth/ui/LogoutButton.tsx
import { Button } from '@/shared/ui';
import { logout } from '../api/authApi';
import { useAuthStore } from '../model/store';

/**
 * A button that logs the user out when clicked.
 *
 * @remarks
 * Performs both server-side logout (API call) and client-side
 * cleanup (clearing auth store). Uses the ghost button variant
 * for subtle appearance in navigation areas.
 *
 * @example
 * ```tsx
 * function Header() {
 *   return (
 *     <nav>
 *       <Logo />
 *       <LogoutButton />
 *     </nav>
 *   );
 * }
 * ```
 */
export function LogoutButton() {
  const clearAuth = useAuthStore((s) => s.clearAuth);

  /**
   * Handles the logout flow by calling the API and clearing local state.
   */
  const handleLogout = async () => {
    await logout();
    clearAuth();
  };

  return (
    <Button variant="ghost" onClick={handleLogout}>
      Sign Out
    </Button>
  );
}
