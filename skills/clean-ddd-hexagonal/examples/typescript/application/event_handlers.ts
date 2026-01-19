// application/event_handlers/order_event_handlers.ts
import { Pool } from 'pg';
import { OrderCreated, OrderConfirmed, OrderShipped } from '@/domain/order/events';
import { IOrderRepository } from '@/domain/order/repository';
import { INotificationService } from '@/application/ports/notification';

// Update read model when order is created
export class OrderCreatedHandler {
  constructor(private readonly readDb: Pool) {}

  async handle(event: OrderCreated): Promise<void> {
    await this.readDb.query(`
      INSERT INTO orders_read (id, customer_id, status, created_at)
      VALUES ($1, $2, 'draft', $3)
    `, [event.orderId.value, event.customerId.value, event.occurredAt]);
  }
}

// Update read model when order is confirmed
export class OrderConfirmedHandler {
  constructor(private readonly readDb: Pool) {}

  async handle(event: OrderConfirmed): Promise<void> {
    await this.readDb.query(`
      UPDATE orders_read
      SET status = 'confirmed', total = $2, confirmed_at = $3
      WHERE id = $1
    `, [event.orderId.value, event.total.amount, event.occurredAt]);
  }
}

// Send notification when order ships
export class SendShippingNotificationHandler {
  constructor(
    private readonly orderRepo: IOrderRepository,
    private readonly notifier: INotificationService,
  ) {}

  async handle(event: OrderShipped): Promise<void> {
    const order = await this.orderRepo.findById(OrderId.from(event.orderId.value));
    if (!order) return;

    await this.notifier.sendEmail(order.customerEmail, {
      template: 'order-shipped',
      data: {
        orderId: event.orderId.value,
        trackingNumber: event.trackingNumber,
        carrier: event.carrier,
      },
    });
  }
}
