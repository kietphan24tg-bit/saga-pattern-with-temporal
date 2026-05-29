import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderActivities } from '../activities/order.activities';
import { PaymentActivities } from '../activities/payment.activities';
import { InventoryModule } from '../inventory/inventory.module';
import { TemporalModule } from '../temporal/temporal.module';
import { TemporalWorkerService } from '../temporal/temporal.worker.service';
import { Order } from './order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), InventoryModule, TemporalModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrderActivities, PaymentActivities, TemporalWorkerService],
  exports: [OrdersService],
})
export class OrdersModule {}
