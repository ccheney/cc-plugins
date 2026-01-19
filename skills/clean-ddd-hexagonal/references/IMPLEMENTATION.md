# Implementation Examples

Multi-language examples implementing Clean Architecture + DDD + Hexagonal patterns.

## Project Structure (Language-Agnostic)

```
src/
├── domain/                 # Core business logic
│   ├── order/
│   │   ├── aggregate       # Order aggregate root
│   │   ├── entities        # OrderItem, etc.
│   │   ├── value_objects   # OrderId, Money, etc.
│   │   ├── events          # OrderCreated, etc.
│   │   ├── repository      # Interface only
│   │   └── errors          # Domain errors
│   └── shared/
│       └── base classes
├── application/            # Use cases
│   ├── place_order/
│   │   ├── command
│   │   ├── handler
│   │   └── port
│   └── ports/
│       └── driven/
├── infrastructure/         # Adapters
│   ├── persistence/
│   ├── messaging/
│   └── http/
└── main                    # Composition root
```

---

## Go Implementation

### Project Structure

```
internal/
├── domain/
│   ├── order/
│   │   ├── order.go
│   │   ├── order_item.go
│   │   ├── value_objects.go
│   │   ├── events.go
│   │   ├── repository.go
│   │   └── errors.go
│   └── shared/
│       ├── entity.go
│       ├── aggregate.go
│       └── value_object.go
├── application/
│   ├── place_order/
│   │   ├── command.go
│   │   └── handler.go
│   └── ports/
│       ├── order_repository.go
│       └── event_publisher.go
├── infrastructure/
│   ├── postgres/
│   │   └── order_repository.go
│   ├── rabbitmq/
│   │   └── event_publisher.go
│   └── http/
│       └── order_handler.go
└── cmd/
    └── api/
        └── main.go
```

### Domain Layer

See: [`examples/go/domain/`](../examples/go/domain/)

- [Entity base](../examples/go/domain/entity.go) - Generic entity with identity
- [Aggregate root](../examples/go/domain/aggregate.go) - Base with domain events
- [Value objects](../examples/go/domain/value_objects.go) - OrderId, Money
- [Order aggregate](../examples/go/domain/order.go) - Complete order logic
- [Repository interface](../examples/go/domain/repository.go) - Persistence abstraction

### Application Layer

See: [`examples/go/application/`](../examples/go/application/)

- [Command](../examples/go/application/command.go) - PlaceOrder command DTO
- [Handler](../examples/go/application/handler.go) - Use case orchestration

### Infrastructure Layer

See: [`examples/go/infrastructure/`](../examples/go/infrastructure/)

- [PostgreSQL repository](../examples/go/infrastructure/postgres_order_repository.go) - Database adapter

---

## Rust Implementation

### Project Structure (Cargo Workspace)

```
Cargo.toml                    # Workspace root
crates/
├── domain/
│   ├── Cargo.toml
│   └── src/
│       ├── lib.rs
│       ├── order/
│       │   ├── mod.rs
│       │   ├── aggregate.rs
│       │   ├── value_objects.rs
│       │   ├── events.rs
│       │   └── repository.rs
│       └── shared/
│           ├── mod.rs
│           └── entity.rs
├── application/
│   ├── Cargo.toml           # depends on domain
│   └── src/
│       ├── lib.rs
│       ├── place_order/
│       │   ├── mod.rs
│       │   ├── command.rs
│       │   └── handler.rs
│       └── ports/
│           └── mod.rs
├── infrastructure/
│   ├── Cargo.toml           # depends on domain, application
│   └── src/
│       ├── lib.rs
│       ├── postgres/
│       │   └── order_repository.rs
│       └── http/
│           └── handlers.rs
└── api/
    ├── Cargo.toml           # depends on all
    └── src/
        └── main.rs
```

### Domain Layer

See: [`examples/rust/domain/`](../examples/rust/domain/)

- [Entity traits](../examples/rust/domain/entity.rs) - Entity and AggregateRoot traits
- [Value objects](../examples/rust/domain/value_objects.rs) - OrderId, Money with error types
- [Order aggregate](../examples/rust/domain/order.rs) - Complete order with status machine
- [Repository trait](../examples/rust/domain/repository.rs) - Async repository interface

### Application Layer

See: [`examples/rust/application/`](../examples/rust/application/)

- [Command](../examples/rust/application/command.rs) - PlaceOrderCommand structs
- [Handler](../examples/rust/application/handler.rs) - Async handler with error types

---

## Python Implementation

### Project Structure

```
src/
├── domain/
│   ├── __init__.py
│   ├── order/
│   │   ├── __init__.py
│   │   ├── aggregate.py
│   │   ├── value_objects.py
│   │   ├── events.py
│   │   ├── repository.py
│   │   └── errors.py
│   └── shared/
│       ├── __init__.py
│       ├── entity.py
│       └── value_object.py
├── application/
│   ├── __init__.py
│   ├── place_order/
│   │   ├── __init__.py
│   │   ├── command.py
│   │   └── handler.py
│   └── ports/
│       ├── __init__.py
│       └── repositories.py
├── infrastructure/
│   ├── __init__.py
│   ├── postgres/
│   │   └── order_repository.py
│   └── fastapi/
│       └── routes.py
└── main.py
```

### Domain Layer

See: [`examples/python/domain/`](../examples/python/domain/)

- [Entity base](../examples/python/domain/entity.py) - Generic Entity and AggregateRoot
- [Value objects](../examples/python/domain/value_objects.py) - Frozen dataclasses for OrderId, Money
- [Order aggregate](../examples/python/domain/order.py) - Order with status and items
- [Domain events](../examples/python/domain/events.py) - OrderCreated, OrderConfirmed
- [Repository interface](../examples/python/domain/repository.py) - ABC for persistence

### Application Layer

See: [`examples/python/application/`](../examples/python/application/)

- [Command](../examples/python/application/command.py) - PlaceOrderCommand dataclass
- [Handler](../examples/python/application/handler.py) - Async use case handler

### Infrastructure Layer

See: [`examples/python/infrastructure/`](../examples/python/infrastructure/)

- [PostgreSQL repository](../examples/python/infrastructure/postgres_order_repository.py) - asyncpg implementation
- [In-memory repository](../examples/python/infrastructure/in_memory_order_repository.py) - For testing

---

## TypeScript Implementation

### Project Structure

```
src/
├── domain/
│   ├── order/
│   │   ├── Order.ts
│   │   ├── OrderItem.ts
│   │   ├── OrderId.ts
│   │   ├── Money.ts
│   │   ├── OrderRepository.ts
│   │   └── events/
│   └── shared/
│       ├── Entity.ts
│       ├── AggregateRoot.ts
│       └── ValueObject.ts
├── application/
│   ├── place-order/
│   │   ├── PlaceOrderCommand.ts
│   │   └── PlaceOrderHandler.ts
│   └── ports/
├── infrastructure/
│   ├── persistence/
│   │   └── PostgresOrderRepository.ts
│   ├── http/
│   │   └── OrderController.ts
│   └── messaging/
│       └── RabbitMQEventPublisher.ts
└── main.ts
```

### Domain Layer

See: [`examples/typescript/domain/`](../examples/typescript/domain/)

- [Entity base](../examples/typescript/domain/entity.ts) - Abstract entity class
- [Aggregate root](../examples/typescript/domain/aggregate_root.ts) - With domain events
- [Value object](../examples/typescript/domain/value_object.ts) - Immutable base
- [Order aggregate](../examples/typescript/domain/order.ts) - Complete order logic
- [OrderId & Status](../examples/typescript/domain/order_id.ts) - Identity and enum
- [Money](../examples/typescript/domain/money.ts) - Currency value object
- [Domain events](../examples/typescript/domain/events.ts) - OrderCreated, OrderConfirmed
- [Repository interface](../examples/typescript/domain/repository.ts) - Persistence port
- [Specification](../examples/typescript/domain/specification.ts) - Query patterns
- [Domain services](../examples/typescript/domain/services.ts) - Cross-aggregate logic
- [Factory](../examples/typescript/domain/factory.ts) - Complex creation

### Application Layer

See: [`examples/typescript/application/`](../examples/typescript/application/)

- [Command](../examples/typescript/application/command.ts) - PlaceOrderCommand
- [Handler](../examples/typescript/application/place_order_handler.ts) - Use case
- [Query](../examples/typescript/application/query.ts) - Read model queries
- [Ports](../examples/typescript/application/ports.ts) - Driven port interfaces
- [Event handlers](../examples/typescript/application/event_handlers.ts) - Async processing
- [Event dispatcher](../examples/typescript/application/event_dispatcher.ts) - Event routing

### Infrastructure Layer

See: [`examples/typescript/infrastructure/`](../examples/typescript/infrastructure/)

- [PostgreSQL repository](../examples/typescript/infrastructure/postgres_order_repository.ts)
- [In-memory repository](../examples/typescript/infrastructure/in_memory_order_repository.ts)
- [Stripe payment gateway](../examples/typescript/infrastructure/stripe_payment_gateway.ts)
- [Stripe ACL](../examples/typescript/infrastructure/stripe_payment_acl.ts)
- [RabbitMQ publisher](../examples/typescript/infrastructure/rabbitmq_event_publisher.ts)
- [HTTP controller](../examples/typescript/infrastructure/order_controller.ts)
- [gRPC service](../examples/typescript/infrastructure/grpc_order_service.ts)
- [CLI adapter](../examples/typescript/infrastructure/cli_command.ts)
- [DI container](../examples/typescript/infrastructure/container.ts)
- [Read model](../examples/typescript/infrastructure/read_model.ts)
- [Outbox pattern](../examples/typescript/infrastructure/outbox.ts)

### Tests

See: [`examples/typescript/tests/`](../examples/typescript/tests/)

- [Order unit tests](../examples/typescript/tests/order.test.ts)
- [Money tests](../examples/typescript/tests/money.test.ts)
- [Handler tests](../examples/typescript/tests/place_order_handler.test.ts)
- [Repository integration](../examples/typescript/tests/postgres_order_repository.test.ts)
- [API E2E tests](../examples/typescript/tests/orders_api.test.ts)
- [Test fixtures](../examples/typescript/tests/fixtures.ts)

---

## Reference Implementations

### Go
- [bxcodec/go-clean-arch](https://github.com/bxcodec/go-clean-arch)
- [evrone/go-clean-template](https://github.com/evrone/go-clean-template)

### Rust
- [flosse/clean-architecture-with-rust](https://github.com/flosse/clean-architecture-with-rust)

### Python
- [cdddg/py-clean-arch](https://github.com/cdddg/py-clean-arch)

### TypeScript/Node.js
- [jbuget/nodejs-clean-architecture-app](https://github.com/jbuget/nodejs-clean-architecture-app)

### .NET
- [jasontaylordev/CleanArchitecture](https://github.com/jasontaylordev/CleanArchitecture)

### Java
- [thombergs/buckpal](https://github.com/thombergs/buckpal)
