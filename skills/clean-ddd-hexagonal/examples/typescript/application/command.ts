// application/orders/place_order/command.ts

/**
 * Command to place a new order.
 *
 * Commands are simple data transfer objects that carry all information
 * needed to execute a use case. They have no behavior and are validated
 * at the application layer boundary.
 */
export interface PlaceOrderCommand {
  /** The unique identifier of the customer placing the order. */
  customerId: string;

  /** The items to include in the order. */
  items: Array<{
    /** The unique identifier of the product to order. */
    productId: string;
    /** The number of units to order (must be positive). */
    quantity: number;
  }>;
}

/**
 * Command to confirm an order for fulfillment.
 *
 * Confirming an order indicates payment has been received and the
 * order should proceed to the fulfillment stage.
 */
export interface ConfirmOrderCommand {
  /** Command type discriminator for type narrowing. */
  type: 'ConfirmOrder';
  /** The unique identifier of the order to confirm. */
  orderId: string;
}

/**
 * Command to cancel an existing order.
 *
 * Cancellation is only allowed for orders that have not yet shipped.
 * A reason must be provided for audit purposes.
 */
export interface CancelOrderCommand {
  /** Command type discriminator for type narrowing. */
  type: 'CancelOrder';
  /** The unique identifier of the order to cancel. */
  orderId: string;
  /** The reason for cancellation (required for audit). */
  reason: string;
}
