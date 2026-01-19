// infrastructure/external/stripe/stripe_payment_acl.ts
// Anti-Corruption Layer Example

import Stripe from 'stripe';
import { Payment, PaymentStatus } from '@/domain/payment/payment';
import { Money } from '@/domain/shared/money';
import { PaymentCompleted } from '@/domain/payment/events';
import { DomainEvent } from '@/domain/shared/domain_event';

export class StripePaymentACL {
  constructor(private readonly stripe: Stripe) {}

  // Translate our domain model to Stripe's model
  async createPayment(payment: Payment): Promise<string> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: payment.amount.cents,  // Stripe uses cents
      currency: payment.amount.currency.toLowerCase(),
      metadata: {
        orderId: payment.orderId.value,
        customerId: payment.customerId.value,
      },
    });

    return paymentIntent.id;
  }

  // Translate Stripe's model to our domain model
  translateStatus(stripeStatus: string): PaymentStatus {
    const mapping: Record<string, PaymentStatus> = {
      'requires_payment_method': PaymentStatus.Pending,
      'requires_confirmation': PaymentStatus.Pending,
      'requires_action': PaymentStatus.Pending,
      'processing': PaymentStatus.Processing,
      'succeeded': PaymentStatus.Completed,
      'canceled': PaymentStatus.Cancelled,
      'requires_capture': PaymentStatus.Authorized,
    };

    return mapping[stripeStatus] ?? PaymentStatus.Unknown;
  }

  // Translate Stripe webhook events to domain events
  translateWebhook(event: Stripe.Event): DomainEvent | null {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const intent = event.data.object as Stripe.PaymentIntent;
        return new PaymentCompleted(
          PaymentId.from(intent.metadata.orderId),
          Money.fromCents(intent.amount, intent.currency.toUpperCase())
        );
      case 'payment_intent.payment_failed':
        // Handle failed payment
        return null;
      default:
        return null;
    }
  }
}
