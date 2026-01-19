// domain/shared/domain_event.ts

/**
 * Base class for domain events.
 *
 * Domain events represent significant occurrences within the domain that domain
 * experts care about. They capture the fact that something happened and carry
 * all relevant data about that occurrence.
 *
 * Domain events should be:
 * - Named in past tense (e.g., OrderPlaced, PaymentReceived)
 * - Immutable after creation
 * - Self-contained with all necessary data
 *
 * @example
 * ```typescript
 * class OrderPlaced extends DomainEvent {
 *   readonly eventType = 'order.placed';
 *
 *   constructor(
 *     readonly orderId: OrderId,
 *     readonly customerId: CustomerId,
 *   ) {
 *     super();
 *   }
 *
 *   toPayload(): Record<string, unknown> {
 *     return {
 *       orderId: this.orderId.value,
 *       customerId: this.customerId.value,
 *     };
 *   }
 * }
 * ```
 */
export abstract class DomainEvent {
  /** Unique identifier for this event instance. */
  readonly eventId: string;

  /** Timestamp when this event occurred. */
  readonly occurredAt: Date;

  /** Event type identifier for routing and serialization. */
  abstract readonly eventType: string;

  /**
   * Create a new domain event.
   *
   * Automatically generates a unique event ID and records the current timestamp.
   */
  protected constructor() {
    this.eventId = crypto.randomUUID();
    this.occurredAt = new Date();
  }

  /**
   * Convert the event data to a serializable payload.
   *
   * Used for event persistence and message publishing.
   *
   * @returns A plain object containing the event data
   */
  abstract toPayload(): Record<string, unknown>;
}
