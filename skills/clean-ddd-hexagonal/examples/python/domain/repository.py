# src/domain/order/repository.py
"""Repository interface for Order aggregate persistence.

This module defines the abstract repository contract that the domain layer
uses to persist Order aggregates. Concrete implementations reside in the
infrastructure layer.
"""
from abc import ABC, abstractmethod
from typing import Optional
from .order import Order
from .value_objects import OrderId


class OrderRepository(ABC):
    """Abstract repository for Order aggregate persistence.

    This interface represents a driven port (secondary port) in hexagonal
    architecture. It defines the persistence contract that the domain requires,
    allowing the infrastructure layer to provide concrete implementations
    for different storage mechanisms.

    Repositories operate on aggregates as a whole, not on individual entities
    within the aggregate boundary.
    """

    @abstractmethod
    async def find_by_id(self, id: OrderId) -> Optional[Order]:
        """Retrieve an Order by its unique identifier.

        Args:
            id: The OrderId to search for.

        Returns:
            The Order if found, None otherwise.
        """
        pass

    @abstractmethod
    async def save(self, order: Order) -> None:
        """Persist an Order aggregate.

        This method handles both creation of new orders and updates to existing
        ones. Implementations should use optimistic concurrency control via
        the aggregate's version field.

        Args:
            order: The Order aggregate to persist.
        """
        pass

    @abstractmethod
    async def delete(self, order: Order) -> None:
        """Remove an Order from the persistence store.

        Args:
            order: The Order aggregate to delete.
        """
        pass
