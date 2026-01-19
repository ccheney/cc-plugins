// domain/order/events.ts
import { DomainEvent } from './domain_event';
import { OrderId } from './order_id';
import { Money } from './money';

/**
 * Event raised when a new Order is created.
 *
 * This event signals that a customer has initiated a new order. It may
 * trigger downstream processes such as inventory reservation, customer
 * notifications, or analytics tracking.
 */
export class OrderCreated extends DomainEvent {
  /** Event type identifier for routing and serialization. */
  readonly eventType = 'order.created';

  /**
   * Create a new OrderCreated event.
   *
   * @param orderId - The identifier of the newly created order
   * @param customerId - The identifier of the customer who placed the order
   */
  constructor(
    readonly orderId: OrderId,
    readonly customerId: CustomerId,
  ) {
    super();
  }

  /**
   * Convert the event to a serializable payload.
   * @returns Plain object with event data
   */
  toPayload(): Record<string, unknown> {
    return {
      orderId: this.orderId.value,
      customerId: this.customerId.value,
    };
  }
}

/**
 * Event raised when an Order is confirmed for fulfillment.
 *
 * This event indicates the order has been finalized and payment has been
 * processed. It may trigger shipping preparation, inventory deduction,
 * and confirmation notifications.
 */
export class OrderConfirmed extends DomainEvent {
  /** Event type identifier for routing and serialization. */
  readonly eventType = 'order.confirmed';

  /**
   * Create a new OrderConfirmed event.
   *
   * @param orderId - The identifier of the confirmed order
   * @param total - The final monetary total for the order
   */
  constructor(
    readonly orderId: OrderId,
    readonly total: Money,
  ) {
    super();
  }

  /**
   * Convert the event to a serializable payload.
   * @returns Plain object with event data
   */
  toPayload(): Record<string, unknown> {
    return {
      orderId: this.orderId.value,
      total: {
        amount: this.total.amount,
        currency: this.total.currency,
      },
    };
  }
}

/**
 * Event raised when an Order has been shipped.
 *
 * This event indicates the order has been dispatched to the carrier.
 * It may trigger customer notifications with tracking information and
 * update the order status in any read models.
 */
export class OrderShipped extends DomainEvent {
  /** Event type identifier for routing and serialization. */
  readonly eventType = 'order.shipped';

  /**
   * Create a new OrderShipped event.
   *
   * @param orderId - The identifier of the shipped order
   * @param trackingNumber - The carrier's tracking number
   */
  constructor(
    readonly orderId: OrderId,
    readonly trackingNumber: TrackingNumber,
  ) {
    super();
  }

  /**
   * Convert the event to a serializable payload.
   * @returns Plain object with event data
   */
  toPayload(): Record<string, unknown> {
    return {
      orderId: this.orderId.value,
      trackingNumber: this.trackingNumber.value,
    };
  }
}
