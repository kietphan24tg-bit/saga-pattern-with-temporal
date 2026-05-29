import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/order.entity';
import {
  CancelOrderInput,
  ConfirmOrderInput,
  CreateOrderInput,
} from '../orders/orders.types';

@Injectable()
export class OrderActivities {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async createOrder(input: CreateOrderInput): Promise<string> {
    const order = this.orderRepository.create({
      customerId: input.customerId,
      items: input.items,
      totalAmount: input.totalAmount,
      status: OrderStatus.PENDING,
      sagaId: input.sagaId,
    });

    const savedOrder = await this.orderRepository.save(order);
    return savedOrder.id;
  }

  async confirmOrder(input: ConfirmOrderInput): Promise<void> {
    const order = await this.getOrderOrThrow(input.orderId);
    order.status = OrderStatus.CONFIRMED;
    await this.orderRepository.save(order);
  }

  async cancelOrder(input: CancelOrderInput): Promise<void> {
    const order = await this.getOrderOrThrow(input.orderId);
    order.status = OrderStatus.CANCELLED;
    await this.orderRepository.save(order);
  }

  async getOrder(orderId: string): Promise<Order> {
    return this.getOrderOrThrow(orderId);
  }

  async getOrderBySagaId(sagaId: string): Promise<Order> {
    const order = await this.orderRepository.findOneBy({ sagaId });
    if (!order) {
      throw new NotFoundException(`Order with workflow ${sagaId} was not found`);
    }

    return order;
  }

  private async getOrderOrThrow(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOneBy({ id: orderId });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} was not found`);
    }

    return order;
  }
}
