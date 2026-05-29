import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Inventory,
  InventoryDocument,
  InventoryReservation,
} from '../inventory/inventory.schema';
import {
  ReleaseInventoryInput,
  ReserveInventoryInput,
} from '../orders/orders.types';

@Injectable()
export class InventoryActivities {
  constructor(
    @InjectModel(Inventory.name)
    private readonly inventoryModel: Model<InventoryDocument>,
  ) {}

  async reserveInventory(input: ReserveInventoryInput): Promise<string[]> {
    const reservationIds: string[] = [];

    for (const item of input.items) {
      const inventory = await this.inventoryModel.findOne({
        productId: item.productId,
      });

      if (!inventory || inventory.availableStock < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }

      const reservationId = randomUUID();
      const reservation: InventoryReservation = {
        reservationId,
        quantity: item.quantity,
        orderId: input.orderId,
      };

      inventory.availableStock -= item.quantity;
      inventory.reservedStock += item.quantity;
      inventory.reservations.push(reservation);
      await inventory.save();
      reservationIds.push(reservationId);
    }

    return reservationIds;
  }

  async releaseInventory(input: ReleaseInventoryInput): Promise<void> {
    const inventories = await this.inventoryModel.find({
      'reservations.reservationId': { $in: input.reservationIds },
    });

    for (const inventory of inventories) {
      const remainingReservations: InventoryReservation[] = [];

      for (const reservation of inventory.reservations) {
        if (input.reservationIds.includes(reservation.reservationId)) {
          inventory.availableStock += reservation.quantity;
          inventory.reservedStock -= reservation.quantity;
          continue;
        }

        remainingReservations.push(reservation);
      }

      inventory.reservations = remainingReservations;
      await inventory.save();
    }
  }
}
