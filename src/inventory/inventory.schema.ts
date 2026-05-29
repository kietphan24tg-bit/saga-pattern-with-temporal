import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type InventoryDocument = HydratedDocument<Inventory>;

@Schema({ _id: false })
export class InventoryReservation {
  @Prop({ required: true })
  reservationId: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  orderId: string;
}

export const InventoryReservationSchema =
  SchemaFactory.createForClass(InventoryReservation);

@Schema({ collection: 'inventory', timestamps: true })
export class Inventory {
  @Prop({ required: true, unique: true, index: true })
  productId: string;

  @Prop({ required: true, min: 0 })
  availableStock: number;

  @Prop({ required: true, min: 0, default: 0 })
  reservedStock: number;

  @Prop({ type: [InventoryReservationSchema], default: [] })
  reservations: InventoryReservation[];
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);
