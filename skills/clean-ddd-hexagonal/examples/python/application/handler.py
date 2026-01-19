# src/application/place_order/handler.py
"""Use case handler for placing orders.

This module implements the application service that orchestrates the
place order workflow, coordinating between domain objects and
infrastructure services.
"""
from dataclasses import dataclass
from domain.order.aggregate import Order
from domain.order.repository import OrderRepository
from domain.order.value_objects import CustomerId, ProductId
from application.ports.repositories import ProductRepository
from application.ports.event_publisher import EventPublisher
from .command import PlaceOrderCommand


@dataclass
class PlaceOrderHandler:
    """Application service that handles the place order use case.

    This handler orchestrates the workflow of creating an order, validating
    products, persisting the aggregate, and publishing domain events. It
    depends on abstractions (ports) rather than concrete implementations.

    Attributes:
        order_repo: Repository for persisting Order aggregates.
        product_repo: Repository for retrieving Product information.
        event_publisher: Service for publishing domain events.
    """

    order_repo: OrderRepository
    product_repo: ProductRepository
    event_publisher: EventPublisher

    async def handle(self, command: PlaceOrderCommand) -> str:
        """Execute the place order use case.

        Create a new order with the specified items, validate products exist,
        persist the order, and publish resulting domain events.

        Args:
            command: The place order command containing customer and item data.

        Returns:
            The ID of the newly created order as a string.

        Raises:
            ValueError: If customer_id is invalid or a product is not found.
            OrderError: If domain rules are violated during order creation.

        Note:
            This implementation publishes events after persistence. For
            production systems, consider using the Outbox pattern to ensure
            reliable event delivery.
        """
        customer_id = CustomerId.from_string(command.customer_id)

        order = Order.create(customer_id)

        for item in command.items:
            product = await self.product_repo.find_by_id(item.product_id)
            if not product:
                raise ValueError(f"Product not found: {item.product_id}")

            product_id = ProductId.from_string(item.product_id)
            order.add_item(product_id, item.quantity, product.price)

        await self.order_repo.save(order)

        # Publish domain events after successful persistence
        for event in order.domain_events:
            await self.event_publisher.publish(event)
        order.clear_events()

        return order.id.value
