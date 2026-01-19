// infrastructure/persistence/postgres/order_repository.ts
import { Pool } from 'pg';
import { Order } from '@/domain/order/order';
import { OrderId } from '@/domain/order/value_objects';
import { IOrderRepository } from '@/domain/order/repository';
import { OrderMapper } from './mappers/order_mapper';

/**
 * PostgreSQL adapter for Order aggregate persistence.
 *
 * This class implements the IOrderRepository interface using PostgreSQL
 * as the backing store. It handles the mapping between domain objects
 * and relational database tables using a dedicated mapper.
 *
 * @example
 * ```typescript
 * const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 * const repo = new PostgresOrderRepository(pool);
 *
 * const order = await repo.findById(OrderId.from('order-123'));
 * ```
 */
export class PostgresOrderRepository implements IOrderRepository {
  /**
   * Create a new PostgresOrderRepository.
   *
   * @param pool - The pg connection pool for database operations
   */
  constructor(private readonly pool: Pool) {}

  /**
   * Find an Order by its unique identifier.
   *
   * Fetches the order and all its line items in a single query using
   * JSON aggregation, then reconstitutes the full aggregate.
   *
   * @param id - The OrderId to search for
   * @returns The Order if found, null otherwise
   */
  async findById(id: OrderId): Promise<Order | null> {
    const result = await this.pool.query(
      `SELECT o.*,
              json_agg(json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price
              )) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = $1
       GROUP BY o.id`,
      [id.value]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return OrderMapper.toDomain(result.rows[0]);
  }

  /**
   * Persist an Order aggregate using upsert semantics.
   *
   * Saves the order and all its line items. Uses INSERT ... ON CONFLICT
   * for idempotent saves. The order and items are updated independently
   * to handle both new and modified items.
   *
   * @param order - The Order aggregate to persist
   */
  async save(order: Order): Promise<void> {
    const data = OrderMapper.toPersistence(order);

    await this.pool.query(
      `INSERT INTO orders (id, customer_id, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         status = EXCLUDED.status,
         updated_at = EXCLUDED.updated_at`,
      [data.id, data.customerId, data.status, data.createdAt, data.updatedAt]
    );

    for (const item of data.items) {
      await this.pool.query(
        `INSERT INTO order_items (id, order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           quantity = EXCLUDED.quantity`,
        [item.id, data.id, item.productId, item.quantity, item.unitPrice]
      );
    }
  }

  /**
   * Remove an Order from the database.
   *
   * Order items are deleted via CASCADE foreign key constraint.
   *
   * @param order - The Order aggregate to delete
   */
  async delete(order: Order): Promise<void> {
    await this.pool.query('DELETE FROM orders WHERE id = $1', [order.id.value]);
  }
}
