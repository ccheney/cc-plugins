// tests/integration/postgres/order_repository.test.ts
import { Pool } from 'pg';
import { PostgresOrderRepository } from '@/infrastructure/persistence/postgres/order_repository';
import { Order } from '@/domain/order/order';
import { OrderId, CustomerId, ProductId, Quantity } from '@/domain/order/value_objects';
import { Money } from '@/domain/shared/money';

describe('PostgresOrderRepository', () => {
  let pool: Pool;
  let repository: PostgresOrderRepository;

  beforeAll(async () => {
    pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
    repository = new PostgresOrderRepository(pool);
  });

  beforeEach(async () => {
    // Clean database before each test
    await pool.query('TRUNCATE orders, order_items CASCADE');
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('save and findById', () => {
    it('persists and retrieves order', async () => {
      // Arrange
      const order = Order.create(CustomerId.from('cust-123'));
      order.addItem(ProductId.from('prod-1'), Quantity.create(2), Money.create(10, 'USD'));

      // Act
      await repository.save(order);
      const retrieved = await repository.findById(order.id);

      // Assert
      expect(retrieved).not.toBeNull();
      expect(retrieved!.id.value).toBe(order.id.value);
      expect(retrieved!.items).toHaveLength(1);
      expect(retrieved!.items[0].quantity.value).toBe(2);
    });

    it('updates existing order', async () => {
      const order = Order.create(CustomerId.from('cust-123'));
      order.addItem(ProductId.from('prod-1'), Quantity.create(1), Money.create(10, 'USD'));
      await repository.save(order);

      // Modify and save again
      order.addItem(ProductId.from('prod-2'), Quantity.create(3), Money.create(20, 'USD'));
      await repository.save(order);

      const retrieved = await repository.findById(order.id);
      expect(retrieved!.items).toHaveLength(2);
    });

    it('returns null for nonexistent order', async () => {
      const result = await repository.findById(OrderId.from('nonexistent'));

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('removes order from database', async () => {
      const order = Order.create(CustomerId.from('cust-123'));
      await repository.save(order);

      await repository.delete(order);

      const retrieved = await repository.findById(order.id);
      expect(retrieved).toBeNull();
    });
  });
});
