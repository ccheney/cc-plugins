# src/domain/order/events.py
"""Domain events for the Order aggregate.

Domain events represent significant occurrences within the domain that domain
experts care about. They enable loose coupling between aggregates and support
event-driven architectures.
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from .value_objects import OrderId, CustomerId, Money


@dataclass
class DomainEvent:
    """Base class for all domain events.

    Domain events capture the fact that something significant happened in the
    domain. They are named in past tense (e.g., OrderCreated, PaymentReceived)
    and are immutable records of state changes.

    Attributes:
        occurred_at: Timestamp when the event was created.
    """

    occurred_at: Optional[datetime] = field(default=None)

    def __post_init__(self) -> None:
        """Set the occurred_at timestamp if not provided."""
        if self.occurred_at is None:
            self.occurred_at = datetime.utcnow()


@dataclass
class OrderCreated(DomainEvent):
    """Event raised when a new Order is created.

    This event signals that a customer has initiated a new order, which may
    trigger downstream processes like inventory reservation or customer
    notifications.

    Attributes:
        order_id: The identifier of the newly created order.
        customer_id: The identifier of the customer who placed the order.
    """

    order_id: OrderId = None
    customer_id: CustomerId = None


@dataclass
class OrderConfirmed(DomainEvent):
    """Event raised when an Order is confirmed for fulfillment.

    This event indicates the order has been finalized and payment has been
    processed. It may trigger shipping preparation, inventory deduction,
    and confirmation notifications.

    Attributes:
        order_id: The identifier of the confirmed order.
        total: The final monetary total for the order.
    """

    order_id: OrderId = None
    total: Money = None
