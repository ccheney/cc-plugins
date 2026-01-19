// infrastructure/events/event_dispatcher.ts
import { DomainEvent } from '@/domain/shared/domain_event';

export interface IEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

export class EventDispatcher {
  private handlers: Map<string, IEventHandler<any>[]> = new Map();

  register<T extends DomainEvent>(
    eventType: string,
    handler: IEventHandler<T>,
  ): void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }

  async dispatch(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) ?? [];
    await Promise.all(handlers.map(h => h.handle(event)));
  }

  async dispatchAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.dispatch(event);
    }
  }
}

// Setup example
// const dispatcher = new EventDispatcher();
// dispatcher.register('order.created', new OrderCreatedHandler(readDb));
// dispatcher.register('order.confirmed', new OrderConfirmedHandler(readDb));
// dispatcher.register('order.confirmed', new PublishOrderConfirmedIntegrationEvent(broker, orderRepo));
// dispatcher.register('order.shipped', new SendShippingNotificationHandler(orderRepo, notifier));
