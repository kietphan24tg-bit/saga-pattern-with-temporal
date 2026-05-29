import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import type {
  CreateOrderDto,
  OrderStatusResponse,
  SagaExecutionResult,
} from './orders.types';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<SagaExecutionResult> {
    return this.ordersService.createOrder(createOrderDto);
  }

  @Get('workflow/:workflowId')
  async getOrderByWorkflowId(
    @Param('workflowId') workflowId: string,
  ): Promise<OrderStatusResponse> {
    return this.ordersService.getOrderByWorkflowId(workflowId);
  }

  @Get(':orderId')
  async getOrderById(
    @Param('orderId') orderId: string,
  ): Promise<OrderStatusResponse> {
    return this.ordersService.getOrderById(orderId);
  }
}
