# src/application/place_order/command.py
"""Command DTOs for the place order use case.

Commands are simple data transfer objects that carry all information needed
to execute a use case. They have no behavior and are validated at the
application layer boundary.
"""
from dataclasses import dataclass
from typing import List


@dataclass
class PlaceOrderItemCommand:
    """Data for a single line item in a place order command.

    Attributes:
        product_id: The unique identifier of the product to order.
        quantity: The number of units to order. Must be positive.
    """

    product_id: str
    quantity: int


@dataclass
class PlaceOrderCommand:
    """Command to create and persist a new order.

    This command encapsulates all data required to place an order on behalf
    of a customer. It is processed by PlaceOrderHandler.

    Attributes:
        customer_id: The unique identifier of the customer placing the order.
        items: List of products and quantities to include in the order.
    """

    customer_id: str
    items: List[PlaceOrderItemCommand]
