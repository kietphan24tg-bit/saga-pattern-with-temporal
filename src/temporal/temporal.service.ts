import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Client, Connection } from '@temporalio/client';
import { orderSagaWorkflow } from '../workflows/order-saga.workflow';
import {
  CreateOrderDto,
  SagaExecutionResult,
  SagaStatus,
} from '../orders/orders.types';

@Injectable()
export class TemporalService implements OnModuleDestroy {
  private connection?: Connection;
  private client?: Client;

  async startOrderSaga(input: CreateOrderDto): Promise<SagaExecutionResult> {
    const client = await this.getClient();
    const workflowId = `order-${randomUUID()}`;
    const handle = await client.workflow.start(orderSagaWorkflow, {
      args: [input, workflowId],
      taskQueue: process.env.TEMPORAL_TASK_QUEUE ?? 'order-saga-queue',
      workflowId,
    });

    return {
      workflowId: handle.workflowId,
      runId: handle.firstExecutionRunId,
      orderId: null,
      status: SagaStatus.STARTED,
    };
  }

  async onModuleDestroy(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
    }
  }

  private async getClient(): Promise<Client> {
    if (this.client) {
      return this.client;
    }

    this.connection = await Connection.connect({
      address: process.env.TEMPORAL_ADDRESS ?? 'localhost:7233',
    });
    this.client = new Client({ connection: this.connection });
    return this.client;
  }
}
