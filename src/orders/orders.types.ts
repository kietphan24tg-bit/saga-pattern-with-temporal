import { OrderItem } from './order.entity';

export interface CreateOrderDto {
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
}

export interface CreateOrderInput extends CreateOrderDto {
  sagaId: string;
}

export interface ReserveInventoryInput {
  orderId: string;
  items: OrderItem[];
}

export interface ReleaseInventoryInput {
  reservationIds: string[];
}

export interface ProcessPaymentInput {
  orderId: string;
  amount: number;
}

export interface ConfirmOrderInput {
  orderId: string;
}

export interface CancelOrderInput {
  orderId: string;
}

export type OrderSagaInput = CreateOrderDto;

export enum SagaStatus {
  STARTED = 'STARTED',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

export interface SagaExecutionResult {
  workflowId: string;
  orderId: string | null;
  status: SagaStatus;
  runId?: string;
  failureReason?: string;
}

export interface OrderStatusResponse {
  orderId: string;
  workflowId: string | null;
  status: string;
  totalAmount: number;
  customerId: string;
}
