// tests/integration/http/orders_api.test.ts
import request from 'supertest';
import { Express } from 'express';
import { Pool } from 'pg';
import { createApp } from '@/main';

describe('Orders API', () => {
  let app: Express;
  let pool: Pool;

  beforeAll(async () => {
    pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
    app = createApp(pool); // Configures real repositories
  });

  beforeEach(async () => {
    await pool.query('TRUNCATE orders, order_items, products CASCADE');
    // Seed test data
    await pool.query(`
      INSERT INTO products (id, name, price) VALUES
      ('prod-1', 'Product 1', 1000),
      ('prod-2', 'Product 2', 2000)
    `);
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /orders', () => {
    it('creates order and returns 201', async () => {
      const response = await request(app)
        .post('/orders')
        .send({
          customer_id: 'cust-123',
          items: [
            { product_id: 'prod-1', quantity: 2 },
            { product_id: 'prod-2', quantity: 1 },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
    });

    it('returns 400 for invalid product', async () => {
      const response = await request(app)
        .post('/orders')
        .send({
          customer_id: 'cust-123',
          items: [{ product_id: 'nonexistent', quantity: 1 }],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Product not found');
    });
  });

  describe('GET /orders/:id', () => {
    it('returns order details', async () => {
      // Create order first
      const createResponse = await request(app)
        .post('/orders')
        .send({
          customer_id: 'cust-123',
          items: [{ product_id: 'prod-1', quantity: 2 }],
        });

      const orderId = createResponse.body.id;

      // Get order
      const response = await request(app).get(`/orders/${orderId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(orderId);
      expect(response.body.items).toHaveLength(1);
    });

    it('returns 404 for nonexistent order', async () => {
      const response = await request(app).get('/orders/nonexistent');

      expect(response.status).toBe(404);
    });
  });
});
