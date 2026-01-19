// entities/product/api/queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, getProductById, createProduct } from './productApi';
import type { ProductFilters, Product } from '../model/types';

/**
 * Query key factory for product-related queries.
 *
 * @remarks
 * Provides a consistent structure for React Query cache keys.
 * Use these keys for cache invalidation and prefetching.
 *
 * @example
 * ```ts
 * // Invalidate all product queries
 * queryClient.invalidateQueries({ queryKey: productKeys.all });
 *
 * // Invalidate a specific product
 * queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
 * ```
 */
export const productKeys = {
  /** Base key for all product queries. */
  all: ['products'] as const,

  /** Key factory for product list queries. */
  lists: () => [...productKeys.all, 'list'] as const,

  /** Key factory for filtered product list queries. */
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,

  /** Key factory for product detail queries. */
  details: () => [...productKeys.all, 'detail'] as const,

  /** Key factory for a specific product detail query. */
  detail: (id: string) => [...productKeys.details(), id] as const,
};

/**
 * Fetches a paginated list of products with optional filters.
 *
 * @param filters - Optional filters for category, price range, etc.
 * @returns React Query result with product list data
 *
 * @example
 * ```tsx
 * function ProductList() {
 *   const { data, isLoading } = useProducts({ category: 'electronics' });
 *   // ...
 * }
 * ```
 */
export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: productKeys.list(filters ?? {}),
    queryFn: () => getProducts(filters),
  });
}

/**
 * Fetches a single product by its identifier.
 *
 * @param id - The product's unique identifier
 * @returns React Query result with product data
 *
 * @remarks
 * The query is disabled when `id` is falsy, allowing conditional fetching.
 *
 * @example
 * ```tsx
 * function ProductDetail({ productId }: { productId: string }) {
 *   const { data: product, isLoading } = useProduct(productId);
 *   // ...
 * }
 * ```
 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProductById(id),
    enabled: !!id,
  });
}

/**
 * Mutation hook for creating a new product.
 *
 * @returns React Query mutation result with create function
 *
 * @remarks
 * Automatically invalidates the product list cache on success,
 * ensuring the UI reflects the newly created product.
 *
 * @example
 * ```tsx
 * function CreateProductForm() {
 *   const { mutate: create, isPending } = useCreateProduct();
 *
 *   const handleSubmit = (data: NewProduct) => {
 *     create(data, {
 *       onSuccess: (product) => navigate(`/products/${product.id}`),
 *     });
 *   };
 * }
 * ```
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
