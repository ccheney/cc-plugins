// domain/order/order_factory.ts
import { Order } from './order';
import { Cart } from './cart';
import { Customer } from './customer';
import { Quantity } from './value_objects';
import { IPricingService } from './services';

export interface IOrderFactory {
  createFromCart(cart: Cart, customer: Customer): Order;
}

export class OrderFactory implements IOrderFactory {
  constructor(
    private readonly pricingService: IPricingService,
  ) {}

  createFromCart(cart: Cart, customer: Customer): Order {
    if (cart.isEmpty) {
      throw new EmptyCartError();
    }

    const order = Order.create(customer.id);

    for (const cartItem of cart.items) {
      order.addItem(
        cartItem.productId,
        Quantity.create(cartItem.quantity),
        cartItem.unitPrice,
      );
    }

    if (customer.defaultAddress) {
      order.setShippingAddress(customer.defaultAddress);
    }

    return order;
  }
}
