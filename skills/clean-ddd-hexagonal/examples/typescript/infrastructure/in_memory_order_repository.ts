// infrastructure/adapters/driven/in_memory/order_repository.ts
import { IOrderRepositoryPort } from '@/application/ports/driven/order_repository_port';
import { Order } from '@/domain/order/order';
import { OrderId } from '@/domain/order/value_objects';

/**
 * In-memory adapter for Order persistence, primarily for testing.
 *
 * This implementation stores orders in a Map, providing fast operations
 * without external dependencies. It's ideal for unit tests where database
 * isolation is desired.
 *
 * @example
 * ```typescript
 * const repo = new InMemoryOrderRepository();
 * await repo.save(order);
 *
 * // In tests
 * expect(repo.getAll()).toHaveLength(1);
 * repo.clear();
 * ```
 */
export class InMemoryOrderRepository implements IOrderRepositoryPort {
  /** Internal storage mapping order IDs to Order objects. */
  private orders: Map<string, Order> = new Map();

  /**
   * Find an Order by its identifier.
   *
   * @param id - The OrderId to search for
   * @returns The Order if found, null otherwise
   */
  async findById(id: OrderId): Promise<Order | null> {
    return this.orders.get(id.value) ?? null;
  }

  /**
   * Store an Order in memory.
   *
   * @param order - The Order to persist
   */
  async save(order: Order): Promise<void> {
    this.orders.set(order.id.value, order);
  }

  /**
   * Remove an Order from memory.
   *
   * @param order - The Order to delete
   */
  async delete(order: Order): Promise<void> {
    this.orders.delete(order.id.value);
  }

  // Test helpers

  /**
   * Remove all orders from the repository.
   *
   * Test helper method not part of the repository interface.
   */
  clear(): void {
    this.orders.clear();
  }

  /**
   * Retrieve all stored orders.
   *
   * Test helper method not part of the repository interface.
   *
   * @returns Array of all orders in the repository
   */
  getAll(): Order[] {
    return Array.from(this.orders.values());
  }
}
