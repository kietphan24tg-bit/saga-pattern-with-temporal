export async function orderSagaWorkflow(input: OrderSagaInput) {
    let orderId: string | null = null;
    let reservationIds: string[] = [];

    try {
        // Step 1: Create the order record
        orderId = await createOrder(input);

        // Step 2: Reserve the items in inventory
        reservationIds = await reserveInventory({
            orderId,
            items: input.items
        });

        // Step 3: Process the payment
        await processPayment({ orderId, amount: input.totalAmount });

        // If we get here, everything succeeded
        return { orderId, status: 'CONFIRMED' };
    } catch (error) {
        // Something failed, we must compensate
        console.log('Saga failed, starting compensation');

        // Compensate in reverse order
        if (reservationIds.length > 0) {
            await releaseInventory({ reservationIds });
        }
        if (orderId) {
            await cancelOrder({ orderId });
        }

        return { orderId, status: 'FAILED', failureReason: error.message };
    }
}
