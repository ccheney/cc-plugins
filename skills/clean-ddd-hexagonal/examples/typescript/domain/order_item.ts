// domain/order/order_item.ts
import { Entity } from './entity';
import { Money } from './money';

/**
 * An entity representing a single line item within an Order.
 *
 * Order items track the product, quantity, and unit price at the time of
 * ordering. The unit price is captured when the item is added to preserve
 * historical pricing accuracy even if product prices change later.
 *
 * @example
 * ```typescript
 * const item = OrderItem.create(
 *   ProductId.from('prod-123'),
 *   Quantity.create(2),
 *   Money.create(29.99, 'USD')
 * );
 * console.log(item.subtotal); // Money { amount: 59.98, currency: 'USD' }
 * ```
 */
export class OrderItem extends Entity<OrderItemId> {
  /** The identifier of the ordered product. */
  private _productId: ProductId;

  /** The number of units ordered. */
  private _quantity: Quantity;

  /** The price per unit at time of ordering. */
  private _unitPrice: Money;

  /**
   * Private constructor to enforce use of factory methods.
   *
   * @param id - The unique identifier for this line item
   * @param productId - The product identifier
   * @param quantity - The order quantity
   * @param unitPrice - The price per unit
   */
  private constructor(
    id: OrderItemId,
    productId: ProductId,
    quantity: Quantity,
    unitPrice: Money,
  ) {
    super(id);
    this._productId = productId;
    this._quantity = quantity;
    this._unitPrice = unitPrice;
  }

  /**
   * Create a new OrderItem with an auto-generated ID.
   *
   * @param productId - The product being ordered
   * @param quantity - The number of units to order
   * @param unitPrice - The current price per unit
   * @returns A new OrderItem instance
   */
  static create(
    productId: ProductId,
    quantity: Quantity,
    unitPrice: Money,
  ): OrderItem {
    return new OrderItem(
      OrderItemId.generate(),
      productId,
      quantity,
      unitPrice,
    );
  }

  /**
   * Add more units to this line item.
   *
   * @param amount - The number of units to add
   */
  increaseQuantity(amount: number): void {
    this._quantity = this._quantity.add(amount);
  }

  /**
   * Calculate the total price for this line item.
   *
   * @returns The unit price multiplied by quantity
   */
  get subtotal(): Money {
    return this._unitPrice.multiply(this._quantity.value);
  }

  /** Get the product identifier. */
  get productId(): ProductId { return this._productId; }

  /** Get the current quantity. */
  get quantity(): Quantity { return this._quantity; }

  /** Get the captured unit price. */
  get unitPrice(): Money { return this._unitPrice; }
}
