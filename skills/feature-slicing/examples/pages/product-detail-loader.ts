// pages/product-detail/api/loader.ts
import { getProductById } from '@/entities/product';

/**
 * Route loader for the product detail page.
 *
 * @param params - Route parameters containing the product ID
 * @returns Object containing the loaded product data
 * @throws {Error} When the product is not found or request fails
 *
 * @remarks
 * This loader function is used with React Router's data loading pattern.
 * It fetches product data before the component renders, enabling:
 * - Parallel data fetching with other loaders
 * - Proper loading states via useNavigation
 * - Error boundaries for fetch failures
 *
 * @example
 * ```tsx
 * // In route configuration
 * const routes = [
 *   {
 *     path: '/products/:id',
 *     element: <ProductDetailPage />,
 *     loader: productDetailLoader,
 *   },
 * ];
 * ```
 */
export async function productDetailLoader({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);
  return { product };
}
