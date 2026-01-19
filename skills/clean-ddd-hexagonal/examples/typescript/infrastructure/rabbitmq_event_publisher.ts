// infrastructure/adapters/driven/rabbitmq/event_publisher.ts
import { Channel, Connection } from 'amqplib';
import { IEventPublisherPort } from '@/application/ports/driven/event_publisher_port';
import { DomainEvent } from '@/domain/shared/domain_event';

export class RabbitMQEventPublisher implements IEventPublisherPort {
  private channel: Channel | null = null;

  constructor(private readonly connection: Connection) {}

  async publish(event: DomainEvent): Promise<void> {
    const channel = await this.getChannel();
    const exchange = 'domain_events';
    const routingKey = event.eventType;

    await channel.assertExchange(exchange, 'topic', { durable: true });
    channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify({
        eventId: event.eventId,
        eventType: event.eventType,
        occurredAt: event.occurredAt.toISOString(),
        payload: event.toPayload(),
      })),
      { persistent: true }
    );
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  private async getChannel(): Promise<Channel> {
    if (!this.channel) {
      this.channel = await this.connection.createChannel();
    }
    return this.channel;
  }
}
