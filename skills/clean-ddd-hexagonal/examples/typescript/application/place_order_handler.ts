// application/orders/place_order/handler.ts
import { Order } from '@/domain/order/order';
import { IOrderRepository } from '@/domain/order/repository';
import { IProductRepository } from '@/domain/product/repository';
import { IUnitOfWork } from '@/application/shared/unit_of_work';
import { IEventPublisher } from '@/application/shared/event_publisher';
import { PlaceOrderCommand } from './command';
import { OrderNotFoundError, ProductNotFoundError } from '@/application/shared/errors';

/**
 * Interface for the place order use case.
 *
 * Driver port (primary port) in hexagonal architecture that defines
 * how external actors can create new orders.
 */
export interface IPlaceOrderUseCase {
  /**
   * Execute the place order use case.
   *
   * @param command - The place order command data
   * @returns The ID of the newly created order
   */
  execute(command: PlaceOrderCommand): Promise<OrderId>;
}

/**
 * Application service that handles the place order use case.
 *
 * This handler orchestrates the workflow of creating an order, validating
 * products, persisting the aggregate, and publishing domain events. It
 * depends on abstractions (ports) rather than concrete implementations,
 * following the Dependency Inversion Principle.
 *
 * @example
 * ```typescript
 * const handler = new PlaceOrderHandler(orderRepo, productRepo, uow, publisher);
 * const orderId = await handler.execute({
 *   customerId: 'cust-123',
 *   items: [{ productId: 'prod-456', quantity: 2 }]
 * });
 * ```
 */
export class PlaceOrderHandler implements IPlaceOrderUseCase {
  /**
   * Create a new PlaceOrderHandler with dependencies.
   *
   * @param orderRepo - Repository for persisting Order aggregates
   * @param productRepo - Repository for retrieving Product information
   * @param uow - Unit of work for transaction management
   * @param eventPublisher - Service for publishing domain events
   */
  constructor(
    private readonly orderRepo: IOrderRepository,
    private readonly productRepo: IProductRepository,
    private readonly uow: IUnitOfWork,
    private readonly eventPublisher: IEventPublisher,
  ) {}

  /**
   * Execute the place order use case.
   *
   * Creates a new order with the specified items, validates that all
   * products exist and have sufficient stock, persists the order within
   * a transaction, and publishes resulting domain events.
   *
   * @param command - The place order command data
   * @returns The ID of the newly created order
   *
   * @throws ProductNotFoundError if any product does not exist
   * @throws InsufficientStockError if any product lacks stock
   * @throws PersistenceError if the save operation fails
   *
   * @remarks
   * Events are published after the transaction commits to ensure
   * consistency. Consider using the Outbox pattern for production
   * systems requiring stronger reliability guarantees.
   */
  async execute(command: PlaceOrderCommand): Promise<OrderId> {
    await this.uow.begin();

    try {
      const orderId = OrderId.generate();
      const order = Order.create(orderId, command.customerId);

      for (const item of command.items) {
        const product = await this.productRepo.findById(item.productId);
        if (!product) {
          throw new ProductNotFoundError(item.productId);
        }
        order.addItem(product, item.quantity);
      }

      await this.orderRepo.save(order);
      await this.uow.commit();

      // Publish events after successful commit
      await this.eventPublisher.publishAll(order.domainEvents);

      return orderId;
    } catch (error) {
      await this.uow.rollback();
      throw error;
    }
  }
}
