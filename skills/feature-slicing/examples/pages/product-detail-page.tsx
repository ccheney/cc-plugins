// pages/product-detail/ui/ProductDetailPage.tsx
import { useLoaderData } from 'react-router-dom';
import { ProductCard, type Product } from '@/entities/product';
import { AddToCart } from '@/features/add-to-cart';
import { ProductReviews } from '@/widgets/product-reviews';

/**
 * Product detail page displaying full product information.
 *
 * @remarks
 * Composes features and widgets to create the complete product view.
 * Receives product data from the route loader, avoiding loading states.
 *
 * Layout:
 * - Hero section with product image and details in a two-column grid
 * - Add to cart functionality
 * - Product reviews widget below the main content
 *
 * @example
 * ```tsx
 * // Route configuration
 * {
 *   path: '/products/:id',
 *   element: <ProductDetailPage />,
 *   loader: productDetailLoader,
 * }
 * ```
 */
export function ProductDetailPage() {
  const { product } = useLoaderData() as { product: Product };

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full rounded-lg"
        />

        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl text-green-600">${product.price}</p>
          <p className="text-gray-600">{product.description}</p>

          <AddToCart product={product} />
        </div>
      </div>

      <ProductReviews productId={product.id} />
    </div>
  );
}
