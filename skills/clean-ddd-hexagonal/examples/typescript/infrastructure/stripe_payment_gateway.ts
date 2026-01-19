// infrastructure/adapters/driven/stripe/payment_gateway.ts
import Stripe from 'stripe';
import { IPaymentGatewayPort } from '@/application/ports/driven/payment_gateway_port';
import { Money } from '@/domain/shared/money';
import { PaymentMethod, PaymentResult, PaymentId, RefundResult, RefundId } from '@/domain/payment/types';

export class StripePaymentGateway implements IPaymentGatewayPort {
  private readonly stripe: Stripe;

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey);
  }

  async charge(amount: Money, paymentMethod: PaymentMethod): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount.cents,
        currency: amount.currency.toLowerCase(),
        payment_method: paymentMethod.stripeId,
        confirm: true,
      });

      return PaymentResult.success(PaymentId.from(paymentIntent.id));
    } catch (error) {
      if (error instanceof Stripe.errors.StripeCardError) {
        return PaymentResult.failed(error.message);
      }
      throw error;
    }
  }

  async refund(paymentId: PaymentId, amount: Money): Promise<RefundResult> {
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentId.value,
      amount: amount.cents,
    });

    return RefundResult.success(RefundId.from(refund.id));
  }
}
