// infrastructure/persistence/outbox.ts
import { Pool, PoolClient } from 'pg';
import { DomainEvent } from '@/domain/shared/domain_event';
import { IMessageBroker } from '@/application/ports/message_broker';

interface OutboxMessage {
  id: string;
  eventType: string;
  payload: string;
  createdAt: Date;
  processedAt: Date | null;
}

export class OutboxRepository {
  constructor(private readonly pool: Pool) {}

  async save(event: DomainEvent, tx: PoolClient): Promise<void> {
    await tx.query(`
      INSERT INTO outbox (id, event_type, payload, created_at)
      VALUES ($1, $2, $3, $4)
    `, [
      event.eventId,
      event.eventType,
      JSON.stringify(event.toPayload()),
      event.occurredAt,
    ]);
  }

  async getUnprocessed(limit: number = 100): Promise<OutboxMessage[]> {
    const result = await this.pool.query(`
      SELECT * FROM outbox
      WHERE processed_at IS NULL
      ORDER BY created_at
      LIMIT $1
      FOR UPDATE SKIP LOCKED
    `, [limit]);
    return result.rows;
  }

  async markProcessed(id: string): Promise<void> {
    await this.pool.query(`
      UPDATE outbox SET processed_at = NOW() WHERE id = $1
    `, [id]);
  }
}

// Command handler with outbox pattern
export class PlaceOrderHandlerWithOutbox {
  constructor(
    private readonly pool: Pool,
    private readonly orderRepo: IOrderRepository,
    private readonly outbox: OutboxRepository,
  ) {}

  async handle(command: PlaceOrderCommand): Promise<OrderId> {
    const order = Order.create(CustomerId.from(command.customerId));
    // ... add items ...

    // Save aggregate AND events in same transaction
    await this.pool.transaction(async (tx) => {
      await this.orderRepo.save(order, tx);

      // Save events to outbox (same transaction)
      for (const event of order.domainEvents) {
        await this.outbox.save(event, tx);
      }
    });

    return order.id;
  }
}

// Background worker publishes from outbox
export class OutboxProcessor {
  constructor(
    private readonly outbox: OutboxRepository,
    private readonly messageBroker: IMessageBroker,
  ) {}

  async process(): Promise<void> {
    const messages = await this.outbox.getUnprocessed();

    for (const message of messages) {
      try {
        await this.messageBroker.publish(message.eventType, message.payload);
        await this.outbox.markProcessed(message.id);
      } catch (error) {
        // Will retry on next iteration
        console.error(`Failed to process outbox message ${message.id}`, error);
      }
    }
  }
}
