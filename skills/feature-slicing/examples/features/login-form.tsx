// features/auth/ui/LoginForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/shared/ui';
import { loginSchema } from '../model/schema';
import { login } from '../api/authApi';
import { useAuthStore } from '../model/store';
import type { LoginCredentials } from '../model/types';

/**
 * A complete login form with validation and submission handling.
 *
 * @remarks
 * Features:
 * - Email and password fields with real-time validation
 * - Zod schema validation via react-hook-form
 * - Loading state during submission
 * - Automatic auth state update on success
 *
 * This component handles the entire login flow internally. On successful
 * authentication, it updates the global auth store automatically.
 *
 * @example
 * ```tsx
 * function LoginPage() {
 *   return (
 *     <div className="max-w-md mx-auto mt-10">
 *       <h1>Sign In</h1>
 *       <LoginForm />
 *     </div>
 *   );
 * }
 * ```
 */
export function LoginForm() {
  const setAuth = useAuthStore((s) => s.setAuth);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  /**
   * Handles form submission by calling the login API.
   * @param data - Validated login credentials
   */
  const onSubmit = async (data: LoginCredentials) => {
    try {
      const { user, tokens } = await login(data);
      setAuth(user, tokens);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register('email')}
        type="email"
        placeholder="Email"
        error={errors.email?.message}
      />
      <Input
        {...register('password')}
        type="password"
        placeholder="Password"
        error={errors.password?.message}
      />
      <Button type="submit" loading={isSubmitting}>
        Sign In
      </Button>
    </form>
  );
}
