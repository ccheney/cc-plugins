// tests/fixtures/order_fixtures.ts
import { Order } from '@/domain/order/order';
import { CustomerId, ProductId, Quantity } from '@/domain/order/value_objects';
import { Money } from '@/domain/shared/money';
import { Address } from '@/domain/shared/address';

export class OrderBuilder {
  private customerId: CustomerId = CustomerId.from('default-customer');
  private items: Array<{ productId: ProductId; quantity: Quantity; price: Money }> = [];
  private status: 'draft' | 'confirmed' | 'shipped' | 'cancelled' = 'draft';

  withCustomer(id: string): this {
    this.customerId = CustomerId.from(id);
    return this;
  }

  withItem(productId: string, quantity: number, price: number): this {
    this.items.push({
      productId: ProductId.from(productId),
      quantity: Quantity.create(quantity),
      price: Money.create(price, 'USD'),
    });
    return this;
  }

  confirmed(): this {
    this.status = 'confirmed';
    return this;
  }

  build(): Order {
    const order = Order.create(this.customerId);

    for (const item of this.items) {
      order.addItem(item.productId, item.quantity, item.price);
    }

    if (this.status === 'confirmed') {
      order.setShippingAddress(new AddressBuilder().build());
      order.confirm();
    }

    order.clearEvents(); // Clear events from building
    return order;
  }
}

export class AddressBuilder {
  private street: string = '123 Main St';
  private city: string = 'New York';
  private postalCode: string = '10001';
  private country: string = 'US';

  withStreet(street: string): this {
    this.street = street;
    return this;
  }

  withCity(city: string): this {
    this.city = city;
    return this;
  }

  build(): Address {
    return new Address(this.street, this.city, this.postalCode, this.country);
  }
}

// Usage example:
// const order = new OrderBuilder()
//   .withCustomer('cust-123')
//   .withItem('prod-1', 2, 10.00)
//   .withItem('prod-2', 1, 25.00)
//   .confirmed()
//   .build();
