import { Inject, Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy, Optional } from '@nestjs/common';
import { Worker } from '@temporalio/worker';
import { join } from 'path';
import { InventoryActivities } from '../activities/inventory.activities';
import { OrderActivities } from '../activities/order.activities';
import { PaymentActivities } from '../activities/payment.activities';

@Injectable()
export class TemporalWorkerService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(TemporalWorkerService.name);
  private worker?: Worker;
  private runPromise?: Promise<void>;

  constructor(
    @Optional() @Inject(OrderActivities)
    private readonly orderActivities?: OrderActivities,
    @Optional() @Inject(InventoryActivities)
    private readonly inventoryActivities?: InventoryActivities,
    @Optional() @Inject(PaymentActivities)
    private readonly paymentActivities?: PaymentActivities,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.TEMPORAL_START_WORKER !== 'true') {
      return;
    }

    if (
      !this.orderActivities ||
      !this.inventoryActivities ||
      !this.paymentActivities
    ) {
      this.logger.warn('Temporal worker was not started because activities are missing');
      return;
    }

    this.worker = await Worker.create({
      workflowsPath: join(__dirname, '../workflows/order-saga.workflow'),
      activities: {
        createOrder: this.orderActivities.createOrder.bind(this.orderActivities),
        reserveInventory:
          this.inventoryActivities.reserveInventory.bind(this.inventoryActivities),
        processPayment:
          this.paymentActivities.processPayment.bind(this.paymentActivities),
        confirmOrder: this.orderActivities.confirmOrder.bind(this.orderActivities),
        cancelOrder: this.orderActivities.cancelOrder.bind(this.orderActivities),
        releaseInventory:
          this.inventoryActivities.releaseInventory.bind(this.inventoryActivities),
      },
      taskQueue: process.env.TEMPORAL_TASK_QUEUE ?? 'order-saga-queue',
    });

    this.runPromise = this.worker.run();
    this.logger.log('Temporal worker started');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.worker) {
      this.worker.shutdown();
    }

    if (this.runPromise) {
      await this.runPromise.catch(() => undefined);
    }
  }
}
