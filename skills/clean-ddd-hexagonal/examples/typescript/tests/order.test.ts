// tests/domain/order/order.test.ts
import { Order } from '@/domain/order/order';
import { OrderItem } from '@/domain/order/order_item';
import { OrderId, OrderStatus, CustomerId, ProductId, Quantity } from '@/domain/order/value_objects';
import { Money } from '@/domain/shared/money';
import { OrderCreated, OrderConfirmed } from '@/domain/order/events';
import { InvalidOrderStateError, EmptyOrderError, InvalidQuantityError } from '@/domain/order/errors';

describe('Order', () => {
  describe('create', () => {
    it('creates order with draft status', () => {
      const customerId = CustomerId.from('cust-123');

      const order = Order.create(customerId);

      expect(order.status).toBe(OrderStatus.Draft);
      expect(order.customerId).toEqual(customerId);
      expect(order.items).toHaveLength(0);
    });

    it('emits OrderCreated event', () => {
      const customerId = CustomerId.from('cust-123');

      const order = Order.create(customerId);

      expect(order.domainEvents).toHaveLength(1);
      expect(order.domainEvents[0]).toBeInstanceOf(OrderCreated);
    });
  });

  describe('addItem', () => {
    it('adds item to order', () => {
      const order = createDraftOrder();
      const productId = ProductId.from('prod-123');
      const quantity = Quantity.create(2);
      const price = Money.create(10.00, 'USD');

      order.addItem(productId, quantity, price);

      expect(order.items).toHaveLength(1);
      expect(order.items[0].productId).toEqual(productId);
      expect(order.items[0].quantity).toEqual(quantity);
    });

    it('increases quantity for existing product', () => {
      const order = createDraftOrder();
      const productId = ProductId.from('prod-123');
      const price = Money.create(10.00, 'USD');

      order.addItem(productId, Quantity.create(2), price);
      order.addItem(productId, Quantity.create(3), price);

      expect(order.items).toHaveLength(1);
      expect(order.items[0].quantity.value).toBe(5);
    });

    it('throws when order is cancelled', () => {
      const order = createCancelledOrder();

      expect(() => {
        order.addItem(ProductId.from('prod-123'), Quantity.create(1), Money.create(10, 'USD'));
      }).toThrow(InvalidOrderStateError);
    });

    it('throws when quantity is zero', () => {
      const order = createDraftOrder();

      expect(() => {
        order.addItem(ProductId.from('prod-123'), Quantity.create(0), Money.create(10, 'USD'));
      }).toThrow(InvalidQuantityError);
    });
  });

  describe('confirm', () => {
    it('changes status to confirmed', () => {
      const order = createOrderWithItems();

      order.confirm();

      expect(order.status).toBe(OrderStatus.Confirmed);
    });

    it('emits OrderConfirmed event', () => {
      const order = createOrderWithItems();

      order.confirm();

      const events = order.domainEvents.filter(e => e instanceof OrderConfirmed);
      expect(events).toHaveLength(1);
    });

    it('throws when order is empty', () => {
      const order = createDraftOrder();

      expect(() => order.confirm()).toThrow(EmptyOrderError);
    });

    it('throws when already confirmed', () => {
      const order = createConfirmedOrder();

      expect(() => order.confirm()).toThrow(InvalidOrderStateError);
    });
  });

  describe('total', () => {
    it('calculates total from all items', () => {
      const order = createDraftOrder();
      order.addItem(ProductId.from('p1'), Quantity.create(2), Money.create(10, 'USD'));
      order.addItem(ProductId.from('p2'), Quantity.create(1), Money.create(25, 'USD'));

      expect(order.total.amount).toBe(45); // 2*10 + 1*25
    });

    it('returns zero for empty order', () => {
      const order = createDraftOrder();

      expect(order.total.amount).toBe(0);
    });
  });
});

// Test helpers (builders)
function createDraftOrder(): Order {
  return Order.create(CustomerId.from('cust-123'));
}

function createOrderWithItems(): Order {
  const order = createDraftOrder();
  order.addItem(ProductId.from('prod-123'), Quantity.create(1), Money.create(10, 'USD'));
  return order;
}

function createConfirmedOrder(): Order {
  const order = createOrderWithItems();
  order.setShippingAddress(createTestAddress());
  order.confirm();
  return order;
}

function createCancelledOrder(): Order {
  const order = createOrderWithItems();
  order.cancel('Test cancellation');
  return order;
}
