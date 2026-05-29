import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [OrdersModule, InventoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
