import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryActivities } from '../activities/inventory.activities';
import { Inventory, InventorySchema } from './inventory.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Inventory.name, schema: InventorySchema },
    ]),
  ],
  providers: [InventoryActivities],
  exports: [InventoryActivities, MongooseModule],
})
export class InventoryModule {}
