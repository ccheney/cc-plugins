# src/infrastructure/postgres/order_repository.py
"""PostgreSQL implementation of the Order repository.

This module provides the concrete adapter for persisting Order aggregates
to a PostgreSQL database using asyncpg for async database operations.
"""
from typing import Optional
import asyncpg
from domain.order.aggregate import Order
from domain.order.repository import OrderRepository
from domain.order.value_objects import OrderId


class PostgresOrderRepository(OrderRepository):
    """PostgreSQL adapter for Order aggregate persistence.

    This class implements the OrderRepository interface using PostgreSQL
    as the backing store. It handles the mapping between domain objects
    and relational database tables.

    Attributes:
        _pool: The asyncpg connection pool for database operations.
    """

    def __init__(self, pool: asyncpg.Pool) -> None:
        """Initialize the repository with a database connection pool.

        Args:
            pool: An asyncpg connection pool. The caller is responsible
                for managing the pool lifecycle.
        """
        self._pool = pool

    async def find_by_id(self, id: OrderId) -> Optional[Order]:
        """Retrieve an Order aggregate by its identifier.

        Fetches the order and all its line items from the database,
        reconstituting the full aggregate.

        Args:
            id: The OrderId to search for.

        Returns:
            The reconstituted Order if found, None otherwise.
        """
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM orders WHERE id = $1",
                id.value
            )
            if not row:
                return None

            items = await conn.fetch(
                "SELECT * FROM order_items WHERE order_id = $1",
                id.value
            )

            return self._map_to_domain(row, items)

    async def save(self, order: Order) -> None:
        """Persist an Order aggregate using upsert semantics.

        Saves the order and all its line items within a single transaction
        to maintain aggregate consistency. Uses INSERT ... ON CONFLICT for
        idempotent saves.

        Args:
            order: The Order aggregate to persist.
        """
        async with self._pool.acquire() as conn:
            async with conn.transaction():
                await conn.execute("""
                    INSERT INTO orders (id, customer_id, status, created_at)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (id) DO UPDATE SET
                      status = EXCLUDED.status
                """, order.id.value, order._customer_id.value,
                    order.status.value, order._created_at)

                for item in order.items:
                    await conn.execute("""
                        INSERT INTO order_items (order_id, product_id, quantity, unit_price)
                        VALUES ($1, $2, $3, $4)
                        ON CONFLICT (order_id, product_id) DO UPDATE SET
                          quantity = EXCLUDED.quantity
                    """, order.id.value, item.product_id.value,
                        item.quantity, item._unit_price.amount)

    async def delete(self, order: Order) -> None:
        """Remove an Order and its items from the database.

        Deletes within a transaction to ensure consistency. Items are
        deleted first due to foreign key constraints.

        Args:
            order: The Order aggregate to delete.
        """
        async with self._pool.acquire() as conn:
            async with conn.transaction():
                await conn.execute(
                    "DELETE FROM order_items WHERE order_id = $1",
                    order.id.value
                )
                await conn.execute(
                    "DELETE FROM orders WHERE id = $1",
                    order.id.value
                )

    def _map_to_domain(self, row, items) -> Order:
        """Convert database rows to an Order aggregate.

        Args:
            row: The order table row.
            items: List of order_items table rows.

        Returns:
            A reconstituted Order aggregate.
        """
        # Implementation would reconstitute the aggregate from persisted data
        # using internal constructors or factory methods
        pass
