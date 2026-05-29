import { Injectable } from '@nestjs/common';
import { ProcessPaymentInput } from '../orders/orders.types';

@Injectable()
export class PaymentActivities {
  async processPayment(input: ProcessPaymentInput): Promise<void> {
    if (input.amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }
  }
}
