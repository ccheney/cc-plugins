// src/features/auth/api/actions.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { loginSchema } from '../model/schema';

/**
 * Server action for handling login form submissions.
 *
 * @param formData - Form data from the login form submission
 * @returns Validation errors if the login fails, otherwise redirects
 *
 * @remarks
 * This is a Next.js Server Action that:
 * 1. Extracts and validates form data using Zod
 * 2. Calls the authentication API
 * 3. Sets an HTTP-only cookie on success
 * 4. Redirects to the dashboard
 *
 * Server Actions provide a secure way to handle form submissions
 * without exposing API routes or handling CSRF manually.
 *
 * @example
 * ```tsx
 * // In a server component form
 * <form action={loginAction}>
 *   <input name="email" type="email" />
 *   <input name="password" type="password" />
 *   <button type="submit">Sign In</button>
 * </form>
 * ```
 *
 * @example
 * ```tsx
 * // Handling errors in the form
 * const [state, formAction] = useFormState(loginAction, null);
 *
 * {state?.errors?.email && <span>{state.errors.email}</span>}
 * ```
 */
export async function loginAction(formData: FormData) {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const result = loginSchema.safeParse(rawData);
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  // Call your auth API
  const response = await fetch(`${process.env.API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(result.data),
  });

  if (!response.ok) {
    return { errors: { form: ['Invalid credentials'] } };
  }

  const { token } = await response.json();
  cookies().set('token', token, { httpOnly: true });
  redirect('/dashboard');
}
