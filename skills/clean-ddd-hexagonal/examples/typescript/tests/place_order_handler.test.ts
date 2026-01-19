// tests/application/place_order/handler.test.ts
import { PlaceOrderHandler } from '@/application/orders/place_order/handler';
import { PlaceOrderCommand } from '@/application/orders/place_order/command';
import { Order } from '@/domain/order/order';
import { OrderId } from '@/domain/order/value_objects';
import { OrderCreated } from '@/domain/order/events';
import { IOrderRepository } from '@/domain/order/repository';
import { IProductRepository } from '@/domain/product/repository';
import { IEventPublisher } from '@/application/shared/event_publisher';
import { ProductNotFoundError } from '@/application/shared/errors';
import { DomainEvent } from '@/domain/shared/domain_event';

describe('PlaceOrderHandler', () => {
  let handler: PlaceOrderHandler;
  let orderRepo: MockOrderRepository;
  let productRepo: MockProductRepository;
  let eventPublisher: MockEventPublisher;

  beforeEach(() => {
    orderRepo = new MockOrderRepository();
    productRepo = new MockProductRepository();
    eventPublisher = new MockEventPublisher();

    handler = new PlaceOrderHandler(orderRepo, productRepo, eventPublisher);
  });

  it('creates order with items and saves', async () => {
    // Arrange
    productRepo.addProduct(createTestProduct('prod-1', 10.00));
    productRepo.addProduct(createTestProduct('prod-2', 20.00));

    const command: PlaceOrderCommand = {
      customerId: 'cust-123',
      items: [
        { productId: 'prod-1', quantity: 2 },
        { productId: 'prod-2', quantity: 1 },
      ],
    };

    // Act
    const orderId = await handler.handle(command);

    // Assert
    expect(orderId).toBeDefined();

    const savedOrder = await orderRepo.findById(OrderId.from(orderId));
    expect(savedOrder).not.toBeNull();
    expect(savedOrder!.items).toHaveLength(2);
    expect(savedOrder!.total.amount).toBe(40); // 2*10 + 1*20
  });

  it('publishes domain events', async () => {
    productRepo.addProduct(createTestProduct('prod-1', 10.00));

    const command: PlaceOrderCommand = {
      customerId: 'cust-123',
      items: [{ productId: 'prod-1', quantity: 1 }],
    };

    await handler.handle(command);

    expect(eventPublisher.publishedEvents).toHaveLength(1);
    expect(eventPublisher.publishedEvents[0]).toBeInstanceOf(OrderCreated);
  });

  it('throws when product not found', async () => {
    const command: PlaceOrderCommand = {
      customerId: 'cust-123',
      items: [{ productId: 'nonexistent', quantity: 1 }],
    };

    await expect(handler.handle(command)).rejects.toThrow(ProductNotFoundError);
  });

  it('rolls back on error', async () => {
    productRepo.addProduct(createTestProduct('prod-1', 10.00));
    orderRepo.simulateErrorOnSave();

    const command: PlaceOrderCommand = {
      customerId: 'cust-123',
      items: [{ productId: 'prod-1', quantity: 1 }],
    };

    await expect(handler.handle(command)).rejects.toThrow();
    expect(orderRepo.savedOrders).toHaveLength(0);
  });
});

// Mock implementations
class MockOrderRepository implements IOrderRepository {
  savedOrders: Order[] = [];
  private shouldError = false;

  async findById(id: OrderId): Promise<Order | null> {
    return this.savedOrders.find(o => o.id.equals(id)) ?? null;
  }

  async save(order: Order): Promise<void> {
    if (this.shouldError) {
      throw new Error('Simulated save error');
    }
    this.savedOrders.push(order);
  }

  async delete(order: Order): Promise<void> {
    const index = this.savedOrders.findIndex(o => o.id.equals(order.id));
    if (index >= 0) {
      this.savedOrders.splice(index, 1);
    }
  }

  simulateErrorOnSave(): void {
    this.shouldError = true;
  }
}

class MockEventPublisher implements IEventPublisher {
  publishedEvents: DomainEvent[] = [];

  async publish(event: DomainEvent): Promise<void> {
    this.publishedEvents.push(event);
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    this.publishedEvents.push(...events);
  }
}
