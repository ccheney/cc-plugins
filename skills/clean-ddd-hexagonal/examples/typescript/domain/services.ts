// domain/order/services/pricing_service.ts
import { Order } from './order';
import { Customer } from './customer';
import { Money } from './money';

export interface IPricingService {
  calculateDiscount(order: Order, customer: Customer): Money;
}

export class PricingService implements IPricingService {
  calculateDiscount(order: Order, customer: Customer): Money {
    let discount = Money.zero();

    // Volume discount
    if (order.itemCount > 10) {
      discount = discount.add(order.total.multiply(0.05));
    }

    // Loyalty discount
    if (customer.isVIP) {
      discount = discount.add(order.total.multiply(0.10));
    }

    // Cap at 20%
    const maxDiscount = order.total.multiply(0.20);
    return discount.amount > maxDiscount.amount ? maxDiscount : discount;
  }
}

// domain/shipping/services/shipping_cost_calculator.ts
export interface IShippingCostCalculator {
  calculate(items: ReadonlyArray<OrderItem>, destination: Address): Money;
}

export class ShippingCostCalculator implements IShippingCostCalculator {
  calculate(items: ReadonlyArray<OrderItem>, destination: Address): Money {
    const baseRate = Money.create(5.99, 'USD');
    const perItemRate = Money.create(1.50, 'USD');

    const itemCost = perItemRate.multiply(items.length);
    let total = baseRate.add(itemCost);

    // International shipping surcharge
    if (destination.country !== 'US') {
      total = total.add(Money.create(15.00, 'USD'));
    }

    return total;
  }
}
