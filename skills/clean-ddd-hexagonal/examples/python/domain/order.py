# src/domain/order/aggregate.py
"""Order aggregate root implementation.

This module contains the Order aggregate, which is the central domain model
for purchase transactions. It enforces business rules around order lifecycle,
item management, and state transitions.
"""
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import List
from .entity import AggregateRoot
from .value_objects import OrderId, Money, CustomerId, ProductId
from .events import OrderCreated, OrderConfirmed
from .errors import OrderError


class OrderStatus(Enum):
    """Lifecycle states for an Order.

    Orders progress through states: DRAFT -> CONFIRMED -> SHIPPED.
    CANCELLED is a terminal state reachable from DRAFT or CONFIRMED.
    """

    DRAFT = "draft"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    CANCELLED = "cancelled"


@dataclass
class OrderItem:
    """A line item within an Order representing a single product purchase.

    Order items track the product, quantity, and price at the time of ordering.
    The unit price is captured when the item is added to preserve historical
    pricing accuracy.

    Attributes:
        _product_id: Identifier of the ordered product.
        _quantity: Number of units ordered.
        _unit_price: Price per unit at time of ordering.
    """

    _product_id: ProductId
    _quantity: int
    _unit_price: Money

    @property
    def product_id(self) -> ProductId:
        """Return the product identifier for this line item."""
        return self._product_id

    @property
    def quantity(self) -> int:
        """Return the number of units ordered."""
        return self._quantity

    @property
    def subtotal(self) -> Money:
        """Calculate the total price for this line item.

        Returns:
            The unit price multiplied by quantity.
        """
        return self._unit_price.multiply(self._quantity)

    def increase_quantity(self, amount: int) -> None:
        """Add additional units to this line item.

        Args:
            amount: Number of units to add (must be positive).
        """
        self._quantity += amount


@dataclass
class Order(AggregateRoot[OrderId]):
    """Aggregate root representing a customer's purchase order.

    The Order aggregate maintains the consistency boundary for all order-related
    operations. It enforces business rules such as:
    - Only draft orders can be modified
    - Orders must have items before confirmation
    - Cancelled orders cannot be modified

    Domain events are emitted on significant state changes to enable
    event-driven integration with other bounded contexts.

    Attributes:
        _customer_id: The customer who placed this order.
        _items: Line items in this order.
        _status: Current lifecycle state.
        _created_at: Timestamp when the order was created.
    """

    _customer_id: CustomerId
    _items: List[OrderItem] = field(default_factory=list)
    _status: OrderStatus = OrderStatus.DRAFT
    _created_at: datetime = field(default_factory=datetime.utcnow)

    @classmethod
    def create(cls, customer_id: CustomerId) -> 'Order':
        """Create a new Order in draft status.

        This factory method is the only way to create new orders, ensuring
        the OrderCreated event is always emitted.

        Args:
            customer_id: The identifier of the customer placing the order.

        Returns:
            A new Order instance in DRAFT status with an OrderCreated event.
        """
        order_id = OrderId.generate()
        order = cls(
            _id=order_id,
            _customer_id=customer_id,
        )
        order.add_event(OrderCreated(order_id=order_id, customer_id=customer_id))
        return order

    def add_item(self, product_id: ProductId, quantity: int, unit_price: Money) -> None:
        """Add a product to the order or increase quantity if already present.

        This method implements idempotent item addition - adding the same
        product twice will increase the quantity rather than creating
        duplicate line items.

        Args:
            product_id: The identifier of the product to add.
            quantity: Number of units to order (must be positive).
            unit_price: The current price per unit.

        Raises:
            OrderError: If the order is cancelled or quantity is not positive.
        """
        if self._status == OrderStatus.CANCELLED:
            raise OrderError("Cannot modify cancelled order")
        if quantity <= 0:
            raise OrderError("Quantity must be positive")

        for item in self._items:
            if item.product_id == product_id:
                item.increase_quantity(quantity)
                return

        self._items.append(OrderItem(
            _product_id=product_id,
            _quantity=quantity,
            _unit_price=unit_price,
        ))

    def confirm(self) -> None:
        """Transition the order from draft to confirmed status.

        Confirmation represents the customer's intent to purchase and typically
        occurs after payment processing. Only draft orders with at least one
        item can be confirmed.

        Raises:
            OrderError: If order is not in draft status or has no items.
        """
        if self._status != OrderStatus.DRAFT:
            raise OrderError("Can only confirm draft orders")
        if not self._items:
            raise OrderError("Cannot confirm empty order")

        self._status = OrderStatus.CONFIRMED
        self.add_event(OrderConfirmed(order_id=self._id, total=self.total))

    @property
    def total(self) -> Money:
        """Calculate the sum of all line item subtotals.

        Returns:
            The total order amount in the default currency (USD).
        """
        result = Money.zero()
        for item in self._items:
            result = result.add(item.subtotal)
        return result

    @property
    def status(self) -> OrderStatus:
        """Return the current lifecycle state of the order."""
        return self._status

    @property
    def items(self) -> List[OrderItem]:
        """Return a copy of order items to prevent external mutation.

        Returns:
            A new list containing all order items.
        """
        return self._items.copy()
