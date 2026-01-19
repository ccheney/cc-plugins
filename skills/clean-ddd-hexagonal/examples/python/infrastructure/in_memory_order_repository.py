# src/infrastructure/in_memory/order_repository.py
"""In-memory implementation of the Order repository for testing.

This module provides a simple in-memory adapter for the OrderRepository
interface, suitable for unit tests and local development without a database.
"""
from typing import Optional, Dict, List
from domain.order.aggregate import Order
from domain.order.repository import OrderRepository
from domain.order.value_objects import OrderId


class InMemoryOrderRepository(OrderRepository):
    """In-memory adapter for Order persistence, primarily for testing.

    This implementation stores orders in a dictionary, providing fast
    operations without external dependencies. It's ideal for unit tests
    where database isolation is desired.

    Attributes:
        _orders: Internal storage mapping order ID strings to Order objects.
    """

    def __init__(self) -> None:
        """Initialize an empty in-memory repository."""
        self._orders: Dict[str, Order] = {}

    async def find_by_id(self, id: OrderId) -> Optional[Order]:
        """Retrieve an Order by its identifier.

        Args:
            id: The OrderId to search for.

        Returns:
            The Order if found, None otherwise.
        """
        return self._orders.get(id.value)

    async def save(self, order: Order) -> None:
        """Store an Order in memory.

        Args:
            order: The Order to persist.
        """
        self._orders[order.id.value] = order

    async def delete(self, order: Order) -> None:
        """Remove an Order from memory.

        Args:
            order: The Order to delete.
        """
        self._orders.pop(order.id.value, None)

    # Test helpers

    def clear(self) -> None:
        """Remove all orders from the repository.

        This is a test helper method not part of the repository interface.
        """
        self._orders.clear()

    def get_all(self) -> List[Order]:
        """Retrieve all stored orders.

        This is a test helper method not part of the repository interface.

        Returns:
            List of all orders currently in the repository.
        """
        return list(self._orders.values())
