// features/cart/model/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/entities/product';

/**
 * Represents a product with its quantity in the shopping cart.
 */
interface CartItem {
  /** The product data. */
  product: Product;

  /** Number of units of this product in the cart. */
  quantity: number;
}

/**
 * Shape of the shopping cart state and actions.
 */
interface CartState {
  /** Array of items currently in the cart. */
  items: CartItem[];

  /**
   * Adds a product to the cart or increments its quantity if already present.
   * @param product - The product to add
   * @param quantity - Number of units to add (defaults to 1)
   */
  addItem: (product: Product, quantity?: number) => void;

  /**
   * Removes a product entirely from the cart.
   * @param productId - ID of the product to remove
   */
  removeItem: (productId: string) => void;

  /**
   * Sets the quantity of a specific product in the cart.
   * @param productId - ID of the product to update
   * @param quantity - New quantity value
   */
  updateQuantity: (productId: string, quantity: number) => void;

  /** Removes all items from the cart. */
  clearCart: () => void;

  /**
   * Calculates the total number of items in the cart.
   * @returns Sum of all item quantities
   */
  totalItems: () => number;

  /**
   * Calculates the total price of all items in the cart.
   * @returns Sum of (price * quantity) for all items
   */
  totalPrice: () => number;
}

/**
 * Global shopping cart state store using Zustand.
 *
 * @remarks
 * Persists to localStorage under the key 'cart-storage'.
 * Provides methods for adding, removing, and managing cart items.
 *
 * @example
 * ```tsx
 * function AddToCartButton({ product }: { product: Product }) {
 *   const addItem = useCartStore((s) => s.addItem);
 *
 *   return (
 *     <Button onClick={() => addItem(product)}>
 *       Add to Cart
 *     </Button>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * function CartSummary() {
 *   const { items, totalItems, totalPrice } = useCartStore();
 *
 *   return (
 *     <div>
 *       <span>{totalItems()} items</span>
 *       <span>${totalPrice().toFixed(2)}</span>
 *     </div>
 *   );
 * }
 * ```
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, quantity }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
);
