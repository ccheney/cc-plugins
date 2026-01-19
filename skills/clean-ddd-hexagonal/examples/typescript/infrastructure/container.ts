// main.ts (composition root)
// or infrastructure/config/container.ts
import { Pool } from 'pg';
import { Container } from 'inversify';

// Domain interfaces
import { IOrderRepository } from '@/domain/order/repository';
import { IProductRepository } from '@/domain/product/repository';

// Application ports
import { IPlaceOrderUseCase } from '@/application/orders/place_order/port';
import { IUnitOfWork } from '@/application/shared/unit_of_work';
import { IEventPublisher } from '@/application/shared/event_publisher';

// Application handlers
import { PlaceOrderHandler } from '@/application/orders/place_order/handler';

// Infrastructure implementations
import { PostgresOrderRepository } from '@/infrastructure/persistence/postgres/order_repository';
import { PostgresProductRepository } from '@/infrastructure/persistence/postgres/product_repository';
import { PostgresUnitOfWork } from '@/infrastructure/persistence/postgres/unit_of_work';
import { RabbitMQEventPublisher } from '@/infrastructure/messaging/rabbitmq/event_publisher';

// Presentation
import { OrderController } from '@/presentation/rest/controllers/order_controller';

export function configureContainer(): Container {
  const container = new Container();

  // Database
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  container.bind<Pool>('Pool').toConstantValue(pool);

  // Repositories
  container.bind<IOrderRepository>('IOrderRepository')
    .to(PostgresOrderRepository);
  container.bind<IProductRepository>('IProductRepository')
    .to(PostgresProductRepository);

  // Infrastructure services
  container.bind<IUnitOfWork>('IUnitOfWork').to(PostgresUnitOfWork);
  container.bind<IEventPublisher>('IEventPublisher').to(RabbitMQEventPublisher);

  // Use cases
  container.bind<IPlaceOrderUseCase>('IPlaceOrderUseCase')
    .to(PlaceOrderHandler);

  // Controllers
  container.bind<OrderController>(OrderController).toSelf();

  return container;
}

// Environment-specific configurations
function configureDevelopment(container: Container): void {
  // Use in-memory adapters for fast local development
  container.bind<IOrderRepositoryPort>('IOrderRepositoryPort')
    .to(InMemoryOrderRepository);
  container.bind<IEventPublisherPort>('IEventPublisherPort')
    .to(InMemoryEventPublisher);
  container.bind<IPaymentGatewayPort>('IPaymentGatewayPort')
    .to(FakePaymentGateway);
}

function configureTest(container: Container): void {
  // Use in-memory adapters with spy capabilities
  container.bind<IOrderRepositoryPort>('IOrderRepositoryPort')
    .to(InMemoryOrderRepository);
  container.bind<IEventPublisherPort>('IEventPublisherPort')
    .to(SpyEventPublisher);
  container.bind<IPaymentGatewayPort>('IPaymentGatewayPort')
    .to(MockPaymentGateway);
}

function configureProduction(container: Container): void {
  // Use real adapters
  container.bind<IOrderRepositoryPort>('IOrderRepositoryPort')
    .to(PostgresOrderRepository);
  container.bind<IEventPublisherPort>('IEventPublisherPort')
    .to(RabbitMQEventPublisher);
  container.bind<IPaymentGatewayPort>('IPaymentGatewayPort')
    .to(StripePaymentGateway);
}
