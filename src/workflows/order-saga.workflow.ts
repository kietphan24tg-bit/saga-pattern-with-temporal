import {
  OrderSagaInput,
  SagaExecutionResult,
  SagaStatus,
} from '../orders/orders.types';
import { proxyActivities } from '@temporalio/workflow';
import type { OrderSagaActivities } from './order-saga.activities';

const activities = proxyActivities<OrderSagaActivities>({
  startToCloseTimeout: '1 minute',
});

export async function orderSagaWorkflow(
  input: OrderSagaInput,
  workflowId: string,
): Promise<SagaExecutionResult> {
  let orderId: string | null = null;
  let reservationIds: string[] = [];

  try {
    orderId = await activities.createOrder({
      ...input,
      sagaId: workflowId,
    });

    reservationIds = await activities.reserveInventory({
      orderId,
      items: input.items,
    });

    await activities.processPayment({
      orderId,
      amount: input.totalAmount,
    });

    await activities.confirmOrder({ orderId });

    return {
      workflowId,
      orderId,
      status: SagaStatus.CONFIRMED,
    };
  } catch (error) {
    if (reservationIds.length > 0) {
      await activities.releaseInventory({ reservationIds });
    }

    if (orderId) {
      await activities.cancelOrder({ orderId });
    }

    const failureReason =
      error instanceof Error ? error.message : 'Unknown saga failure';

    return {
      workflowId,
      orderId,
      status: SagaStatus.FAILED,
      failureReason,
    };
  }
}
