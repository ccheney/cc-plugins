// infrastructure/read_models/order_read_model.ts
import { Pool } from 'pg';
import { OrderDTO, PaginatedResult } from '@/application/orders/get_order/result';

export interface IOrderReadModel {
  findById(orderId: string): Promise<OrderDTO | null>;
  findByCustomer(
    customerId: string,
    status?: OrderStatus,
    page?: number,
    pageSize?: number
  ): Promise<PaginatedResult<OrderDTO>>;
  search(criteria: OrderSearchCriteria): Promise<OrderDTO[]>;
}

export class PostgresOrderReadModel implements IOrderReadModel {
  constructor(private readonly pool: Pool) {}

  async findById(orderId: string): Promise<OrderDTO | null> {
    // Optimized query joining all needed data
    const result = await this.pool.query(`
      SELECT
        o.id,
        o.status,
        o.total,
        o.created_at,
        o.confirmed_at,
        c.id as customer_id,
        c.name as customer_name,
        json_agg(json_build_object(
          'productId', oi.product_id,
          'productName', p.name,
          'quantity', oi.quantity,
          'unitPrice', oi.unit_price,
          'subtotal', oi.quantity * oi.unit_price
        )) as items
      FROM orders_read o
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN order_items_read oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = $1
      GROUP BY o.id, c.id
    `, [orderId]);

    return result.rows[0] ? this.mapToDTO(result.rows[0]) : null;
  }

  async findByCustomer(
    customerId: string,
    status?: OrderStatus,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResult<OrderDTO>> {
    // Implementation for paginated customer orders
    const offset = (page - 1) * pageSize;

    let query = `
      SELECT * FROM orders_read
      WHERE customer_id = $1
    `;
    const params: any[] = [customerId];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(pageSize, offset);

    const result = await this.pool.query(query, params);

    return {
      items: result.rows.map(this.mapToDTO),
      page,
      pageSize,
      total: result.rowCount || 0,
    };
  }

  private mapToDTO(row: any): OrderDTO {
    return {
      id: row.id,
      customerId: row.customer_id,
      customerName: row.customer_name,
      status: row.status,
      items: row.items,
      total: row.total,
      createdAt: row.created_at,
      confirmedAt: row.confirmed_at,
    };
  }
}
