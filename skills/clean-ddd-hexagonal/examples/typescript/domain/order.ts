// domain/order/order.ts
import { AggregateRoot } from '../shared/aggregate_root';
import { OrderItem } from './order_item';
import { Money } from './value_objects';
import { OrderPlaced, OrderShipped } from './events';
import { InsufficientStockError } from './errors';

/**
 * Aggregate root representing a customer's purchase order.
 *
 * The Order aggregate maintains the consistency boundary for all order-related
 * operations. It enforces business rules such as:
 * - Products must have sufficient stock before being added
 * - Only confirmed orders can be shipped
 * - Items cannot be added to shipped or cancelled orders
 *
 * Domain events are emitted on significant state changes to enable
 * event-driven integration with other bounded contexts.
 *
 * @example
 * ```typescript
 * const order = Order.create(OrderId.generate(), customerId);
 * order.addItem(product, 2);
 * order.confirm();
 *
 * // Publish events after persistence
 * for (const event of order.domainEvents) {
 *   await eventBus.publish(event);
 * }
 * order.clearDomainEvents();
 * ```
 */
export class Order extends AggregateRoot<OrderId> {
  /** Line items in this order. */
  private items: OrderItem[] = [];

  /** Current lifecycle state. */
  private status: OrderStatus;

  /**
   * Private constructor to enforce use of factory methods.
   *
   * @param id - The unique order identifier
   * @param customerId - The customer placing the order
   */
  private constructor(id: OrderId, customerId: CustomerId) {
    super(id);
    this.customerId = customerId;
    this.status = OrderStatus.Draft;
  }

  /**
   * Create a new Order in Draft status.
   *
   * This factory method is the only way to create new orders, ensuring
   * the OrderPlaced event is always emitted.
   *
   * @param id - The unique identifier for the order
   * @param customerId - The customer placing the order
   * @returns A new Order instance with an OrderPlaced event
   */
  static create(id: OrderId, customerId: CustomerId): Order {
    const order = new Order(id, customerId);
    order.addDomainEvent(new OrderPlaced(id, customerId));
    return order;
  }

  /**
   * Add a product to the order.
   *
   * If the product already exists in the order, its quantity is increased.
   * Otherwise, a new line item is created.
   *
   * @param product - The product to add (must have sufficient stock)
   * @param quantity - The number of units to order
   * @throws InvalidQuantityError if quantity is not positive
   * @throws InsufficientStockError if product stock is insufficient
   */
  addItem(product: Product, quantity: number): void {
    if (quantity <= 0) {
      throw new InvalidQuantityError(quantity);
    }
    if (!product.hasStock(quantity)) {
      throw new InsufficientStockError(product.id, quantity);
    }

    const existingItem = this.items.find(i => i.productId.equals(product.id));
    if (existingItem) {
      existingItem.increaseQuantity(quantity);
    } else {
      this.items.push(OrderItem.create(product.id, product.price, quantity));
    }
  }

  /**
   * Ship the order to the customer.
   *
   * Only confirmed orders can be shipped. Emits an OrderShipped event.
   *
   * @throws InvalidOrderStateError if order is not confirmed
   */
  ship(): void {
    if (this.status !== OrderStatus.Confirmed) {
      throw new InvalidOrderStateError('Cannot ship unconfirmed order');
    }
    this.status = OrderStatus.Shipped;
    this.addDomainEvent(new OrderShipped(this.id));
  }

  /**
   * Calculate the total monetary value of the order.
   *
   * @returns The sum of all line item subtotals
   */
  get total(): Money {
    return this.items.reduce(
      (sum, item) => sum.add(item.subtotal),
      Money.zero()
    );
  }
}
