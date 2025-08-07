import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../../lib/build-safe-db';
import { stripe, constructWebhookEvent, handleStripeError } from '../../../../lib/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = constructWebhookEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  const db = getBuildSafeDatabase();

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleRefundSucceeded(event.data.object as Stripe.Charge);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }

  async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const { bookingId } = paymentIntent.metadata;
    
    if (!bookingId) {
      console.error('No bookingId in payment intent metadata');
      return;
    }

    // Update payment status to COMPLETED
    await (db.payment as any).updateMany({
      where: {
        transactionId: paymentIntent.id,
        status: 'PENDING'
      },
      data: {
        status: 'COMPLETED',
        processedAt: new Date()
      }
    });

    // Update booking status to CONFIRMED
    await db.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' }
    });

    console.log(`Payment succeeded for booking ${bookingId}`);
  }

  async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const { bookingId } = paymentIntent.metadata;
    
    if (!bookingId) {
      console.error('No bookingId in payment intent metadata');
      return;
    }

    // Update payment status to FAILED
    await (db.payment as any).updateMany({
      where: {
        transactionId: paymentIntent.id,
        status: 'PENDING'
      },
      data: {
        status: 'FAILED',
        processedAt: new Date()
      }
    });

    console.log(`Payment failed for booking ${bookingId}`);
  }

  async function handleRefundSucceeded(charge: Stripe.Charge) {
    const paymentIntentId = charge.payment_intent as string;
    
    if (!paymentIntentId) {
      console.error('No payment intent ID in charge');
      return;
    }

    // Update payment status to REFUNDED
    await (db.payment as any).updateMany({
      where: {
        transactionId: paymentIntentId,
        status: 'COMPLETED'
      },
      data: {
        status: 'REFUNDED',
        refundedAt: new Date(),
        refundTransactionId: charge.id
      }
    });

    // Get booking ID from payment record
    const payment = await (db.payment as any).findFirst({
      where: { transactionId: paymentIntentId }
    });

    if (payment) {
      // Update booking status to CANCELLED for full refunds
      const paymentRecord = payment as any;
      if (paymentRecord.amount === charge.amount_refunded / 100) {
        await db.booking.update({
          where: { id: paymentRecord.bookingId },
          data: { status: 'CANCELLED' }
        });
      }
    }

    console.log(`Refund succeeded for payment ${paymentIntentId}`);
  }

  async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
    const { bookingId } = paymentIntent.metadata;
    
    if (!bookingId) {
      console.error('No bookingId in payment intent metadata');
      return;
    }

    // Update payment status to FAILED
    await (db.payment as any).updateMany({
      where: {
        transactionId: paymentIntent.id,
        status: 'PENDING'
      },
      data: {
        status: 'FAILED',
        processedAt: new Date()
      }
    });

    console.log(`Payment canceled for booking ${bookingId}`);
  }
} 