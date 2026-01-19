// domain/shared/aggregate_root.ts
import { Entity } from './entity';
import { DomainEvent } from './domain_event';

/**
 * Base class for aggregate roots in Domain-Driven Design.
 *
 * An aggregate root is a cluster of domain objects that are treated as a single
 * unit for data changes. The aggregate root is the only entry point for modifications
 * and ensures all invariants within the aggregate boundary are maintained.
 *
 * Aggregate roots collect domain events that represent significant state changes.
 * These events are typically published after the aggregate is successfully persisted.
 *
 * @typeParam T - The type of the aggregate's identifier
 *
 * @example
 * ```typescript
 * class Order extends AggregateRoot<OrderId> {
 *   static create(id: OrderId, customerId: CustomerId): Order {
 *     const order = new Order(id);
 *     order.addDomainEvent(new OrderCreated(id, customerId));
 *     return order;
 *   }
 * }
 * ```
 */
export abstract class AggregateRoot<T> extends Entity<T> {
  /** Collection of uncommitted domain events. */
  private _domainEvents: DomainEvent[] = [];

  /** Version number for optimistic concurrency control. */
  private _version: number = 0;

  /**
   * Record a domain event that occurred during a state change.
   *
   * Events are collected and should be published after the aggregate
   * is successfully persisted.
   *
   * @param event - The domain event to record
   */
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * Get all uncommitted domain events.
   * @returns A readonly array of pending domain events
   */
  get domainEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents;
  }

  /**
   * Clear all collected domain events.
   *
   * Call this after events have been successfully published to prevent
   * duplicate event processing.
   */
  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  /**
   * Get the current version of this aggregate.
   *
   * Used for optimistic concurrency control during persistence operations.
   *
   * @returns The current version number
   */
  get version(): number {
    return this._version;
  }

  /**
   * Increment the version number.
   *
   * Typically called by the repository after a successful save operation.
   */
  incrementVersion(): void {
    this._version++;
  }
}
