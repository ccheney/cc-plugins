// infrastructure/adapters/driver/grpc/order_service.ts
import { IPlaceOrderPort } from '@/application/ports/driver/place_order_port';
import { PlaceOrderCommand } from '@/application/orders/place_order/command';

// Generated from protobuf
interface PlaceOrderRequest {
  getCustomerId(): string;
  getItemsList(): Array<{
    getProductId(): string;
    getQuantity(): number;
  }>;
}

interface PlaceOrderResponse {
  setOrderId(id: string): void;
}

interface OrderServiceServer {
  placeOrder(request: PlaceOrderRequest): Promise<PlaceOrderResponse>;
}

export class GrpcOrderService implements OrderServiceServer {
  constructor(private readonly placeOrder: IPlaceOrderPort) {}

  async placeOrder(
    request: PlaceOrderRequest,
  ): Promise<PlaceOrderResponse> {
    // Adapt gRPC request to port command
    const command: PlaceOrderCommand = {
      customerId: request.getCustomerId(),
      items: request.getItemsList().map(item => ({
        productId: item.getProductId(),
        quantity: item.getQuantity(),
      })),
    };

    const orderId = await this.placeOrder.execute(command);

    const response = {} as PlaceOrderResponse;
    response.setOrderId(orderId.value);
    return response;
  }
}
