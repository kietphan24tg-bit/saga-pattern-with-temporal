@Schema()
export class Inventory {
    @Prop()
    productId: string;

    @Prop()
    availableStock: number;

    @Prop()
    reservedStock: number;

    @Prop({ type: [Object] })
    reservations: Array<{
        reservationId: string;
        quantity: number;
    }>;
}
