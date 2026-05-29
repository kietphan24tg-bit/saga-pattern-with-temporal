import type {
  CancelOrderInput,
  ConfirmOrderInput,
  CreateOrderInput,
  ProcessPaymentInput,
  ReleaseInventoryInput,
  ReserveInventoryInput,
} from '../orders/orders.types';

export interface OrderSagaActivities {
  createOrder(input: CreateOrderInput): Promise<string>;
  reserveInventory(input: ReserveInventoryInput): Promise<string[]>;
  processPayment(input: ProcessPaymentInput): Promise<void>;
  confirmOrder(input: ConfirmOrderInput): Promise<void>;
  cancelOrder(input: CancelOrderInput): Promise<void>;
  releaseInventory(input: ReleaseInventoryInput): Promise<void>;
}
