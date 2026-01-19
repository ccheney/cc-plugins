// domain/order/value_objects.ts
import { ValueObject } from './value_object';

/**
 * A value object representing the unique identifier for an Order.
 *
 * OrderId encapsulates the format and validation rules for order identifiers,
 * ensuring only valid IDs can exist in the domain.
 *
 * @example
 * ```typescript
 * const newId = OrderId.generate();
 * const existingId = OrderId.from('550e8400-e29b-41d4-a716-446655440000');
 * ```
 */
export class OrderId extends ValueObject<{ value: string }> {
  /**
   * Private constructor to enforce use of factory methods.
   * @param value - The string value of the ID
   */
  private constructor(value: string) {
    super({ value });
  }

  /**
   * Generate a new unique OrderId using UUID v4.
   *
   * @returns A new OrderId with a randomly generated UUID
   */
  static generate(): OrderId {
    return new OrderId(crypto.randomUUID());
  }

  /**
   * Create an OrderId from an existing string value.
   *
   * Use this when reconstituting orders from persistence or external input.
   *
   * @param value - The string representation of the order ID
   * @returns A validated OrderId instance
   * @throws InvalidOrderIdError if value is empty or whitespace
   */
  static from(value: string): OrderId {
    if (!value || value.trim() === '') {
      throw new InvalidOrderIdError('Order ID cannot be empty');
    }
    return new OrderId(value);
  }

  /** Get the string representation of this ID. */
  get value(): string { return this.props.value; }
}

/**
 * Represents the lifecycle state of an Order.
 *
 * Orders progress through states:
 * Draft -> Pending -> Confirmed -> Shipped -> Delivered
 *
 * Cancelled is a terminal state reachable from Draft, Pending, or Confirmed.
 */
export enum OrderStatus {
  /** Order is being created, can be modified freely. */
  Draft = 'draft',
  /** Order submitted, awaiting payment confirmation. */
  Pending = 'pending',
  /** Payment received, order confirmed for fulfillment. */
  Confirmed = 'confirmed',
  /** Order has been dispatched to carrier. */
  Shipped = 'shipped',
  /** Order successfully delivered to customer. */
  Delivered = 'delivered',
  /** Order has been cancelled. */
  Cancelled = 'cancelled',
}
