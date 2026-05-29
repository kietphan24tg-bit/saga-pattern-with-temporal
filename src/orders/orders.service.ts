import { Injectable } from '@nestjs/common';
import { OrderActivities } from '../activities/order.activities';
import { TemporalService } from '../temporal/temporal.service';
import {
  CreateOrderDto,
  OrderStatusResponse,
  SagaExecutionResult,
} from './orders.types';

@Injectable()
export class OrdersService {
  constructor(
    private readonly temporalService: TemporalService,
    private readonly orderActivities: OrderActivities,
  ) {}

  async createOrder(input: CreateOrderDto): Promise<SagaExecutionResult> {
    return this.temporalService.startOrderSaga(input);
  }

  async getOrderById(orderId: string): Promise<OrderStatusResponse> {
    const order = await this.orderActivities.getOrder(orderId);

    return {
      orderId: order.id,
      workflowId: order.sagaId,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      customerId: order.customerId,
    };
  }

  async getOrderByWorkflowId(workflowId: string): Promise<OrderStatusResponse> {
    const order = await this.orderActivities.getOrderBySagaId(workflowId);

    return {
      orderId: order.id,
      workflowId: order.sagaId,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      customerId: order.customerId,
    };
  }
}
