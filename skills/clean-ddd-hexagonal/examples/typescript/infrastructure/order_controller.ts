// infrastructure/adapters/driver/rest/order_controller.ts
// or presentation/rest/controllers/order_controller.ts
import { Router, Request, Response, NextFunction } from 'express';
import { IPlaceOrderPort } from '@/application/ports/driver/place_order_port';
import { IGetOrderPort } from '@/application/ports/driver/get_order_port';
import { PlaceOrderCommand } from '@/application/orders/place_order/command';
import { PlaceOrderRequest } from '../dto/requests/place_order_request';

export class OrderController {
  constructor(
    private readonly placeOrder: IPlaceOrderPort,
    private readonly getOrder: IGetOrderPort,
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = req.body as PlaceOrderRequest;

      // Map HTTP request to application command
      const orderId = await this.placeOrder.execute({
        customerId: req.user.id,
        items: request.items.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
        })),
      });

      res.status(201).json({ id: orderId.value });
    } catch (error) {
      next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await this.getOrder.execute({ orderId: req.params.id });

      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      res.json(order);
    } catch (error) {
      next(error);
    }
  }
}
