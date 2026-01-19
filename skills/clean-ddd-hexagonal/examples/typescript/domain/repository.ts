// domain/order/repository.ts
import { Order } from './order';
import { OrderId } from './order_id';

/**
 * Repository interface for Order aggregate persistence.
 *
 * This interface represents a driven port (secondary port) in hexagonal
 * architecture. It defines the persistence contract that the domain requires,
 * allowing the infrastructure layer to provide concrete implementations
 * for different storage mechanisms.
 *
 * Repositories operate on aggregates as a whole, not on individual entities
 * within the aggregate boundary.
 */
export interface IOrderRepository {
  /**
   * Find an Order by its unique identifier.
   *
   * @param id - The OrderId to search for
   * @returns The Order if found, null otherwise
   */
  findById(id: OrderId): Promise<Order | null>;

  /**
   * Find all Orders belonging to a customer.
   *
   * @param customerId - The customer's identifier
   * @returns Array of matching Orders
   */
  findByCustomerId(customerId: CustomerId): Promise<Order[]>;

  /**
   * Persist an Order aggregate.
   *
   * Handles both creation of new orders and updates to existing ones.
   * Should use optimistic concurrency control via the aggregate's version.
   *
   * @param order - The Order aggregate to persist
   */
  save(order: Order): Promise<void>;

  /**
   * Remove an Order from the persistence store.
   *
   * @param order - The Order aggregate to delete
   */
  delete(order: Order): Promise<void>;

  /**
   * Generate the next available OrderId.
   *
   * Useful for strategies that require database-generated IDs.
   *
   * @returns A new unique OrderId
   */
  nextId(): OrderId;
}

/**
 * Generic repository interface for aggregate persistence.
 *
 * Provides a base contract for repositories that can be extended
 * for specific aggregate types.
 *
 * @typeParam T - The aggregate root type
 * @typeParam ID - The aggregate's identifier type
 */
export interface IRepository<T extends AggregateRoot<ID>, ID> {
  /**
   * Find an aggregate by its identifier.
   *
   * @param id - The aggregate's identifier
   * @returns The aggregate if found, null otherwise
   */
  findById(id: ID): Promise<T | null>;

  /**
   * Persist an aggregate.
   *
   * @param aggregate - The aggregate to persist
   */
  save(aggregate: T): Promise<void>;

  /**
   * Remove an aggregate from persistence.
   *
   * @param aggregate - The aggregate to delete
   */
  delete(aggregate: T): Promise<void>;
}
