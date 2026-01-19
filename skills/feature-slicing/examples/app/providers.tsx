// src/app/providers/index.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';

/**
 * Shared QueryClient instance for React Query.
 *
 * @remarks
 * Created outside the component to maintain a stable reference
 * and prevent recreating the client on each render.
 */
const queryClient = new QueryClient();

/**
 * Props for the Providers component.
 */
interface ProvidersProps {
  /** Child components to wrap with providers. */
  children: React.ReactNode;
}

/**
 * Application-wide context providers wrapper.
 *
 * @remarks
 * Wraps the application with essential providers:
 * - QueryClientProvider: Enables React Query for data fetching
 * - ThemeProvider: Enables dark/light mode with system preference detection
 *
 * This is a client component ('use client') because providers typically
 * require client-side React context.
 *
 * @example
 * ```tsx
 * // In app/layout.tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <Providers>{children}</Providers>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system">
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
