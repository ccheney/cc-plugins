// src/pages/home/ui/HomePage.tsx
import { Header } from '@/widgets/header';
import { FeaturedProducts } from '@/widgets/featured-products';
import { HeroSection } from './HeroSection';

/**
 * Landing page displaying the main storefront content.
 *
 * @remarks
 * Composes top-level widgets to create the home page layout:
 * - Header widget with navigation and user controls
 * - Hero section with promotional content (local to this page)
 * - Featured products widget showcasing highlighted items
 *
 * This page slice follows FSD composition principles by orchestrating
 * widgets without containing direct business logic.
 *
 * @example
 * ```tsx
 * // Route configuration
 * {
 *   path: '/',
 *   element: <HomePage />,
 * }
 * ```
 */
export function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeaturedProducts />
      </main>
    </>
  );
}
