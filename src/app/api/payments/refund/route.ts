import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../../lib/build-safe-db';
import { stripe, createRefundOptions, handleStripeError } from '../../../../lib/stripe';
import { sendRefundConfirmation } from '../../../../lib/email';
import * as jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const db = getBuildSafeDatabase();
    const body = await request.json();
    const { paymentId, refundAmount, reason } = body;

    // Validate required fields
    if (!paymentId || !refundAmount || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: paymentId, refundAmount, reason' },
        { status: 400 }
      );
    }

    // Get user from JWT token
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('auth-token')?.value;
    
    let token: string | undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    } else if (cookieToken) {
      token = cookieToken;
    }
    
    let userId: string;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        userId = decoded.userId;
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify payment exists
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            room: { select: { number: true, type: true } }
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized (payment owner or admin)
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if ((payment as any).booking.userId !== userId && (user as any)?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized to refund this payment' },
        { status: 403 }
      );
    }

    // Validate payment status
    if ((payment as any).status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Only completed payments can be refunded' },
        { status: 400 }
      );
    }

    // Validate refund amount
    if (refundAmount > (payment as any).amount) {
      return NextResponse.json(
        { error: 'Refund amount cannot exceed original payment amount' },
        { status: 400 }
      );
    }

    // Check if already refunded
    if ((payment as any).status === 'REFUNDED') {
      return NextResponse.json(
        { error: 'Payment has already been refunded' },
        { status: 409 }
      );
    }

    try {
      // Process refund through Stripe
      const refundOptions = createRefundOptions((payment as any).transactionId, refundAmount);
      const refund = await stripe.refunds.create(refundOptions);

      // Update payment status
      const updatedPayment = await db.payment.update({
        where: { id: paymentId },
        data: {
          status: refund.status === 'succeeded' ? 'REFUNDED' : 'FAILED',
          refundedAt: new Date(),
          refundTransactionId: refund.id
        },
        include: {
          booking: {
            include: {
              user: { select: { name: true, email: true } },
              room: { select: { number: true, type: true } }
            }
          }
        }
      });

      // Create Refund record
      if (refund.status === 'succeeded') {
        const refundRecord = await db.refund.create({
          data: {
            bookingId: (payment as any).bookingId,
            paymentId: paymentId,
            amount: refundAmount,
            refundMethod: 'STRIPE',
            status: 'COMPLETED',
            transactionId: refund.id,
            processedAt: new Date(),
            notes: `Manual refund via Stripe: ${reason}`
          }
        });

        // Update booking refund amount
        await db.booking.update({
          where: { id: (payment as any).bookingId },
          data: {
            refundAmount: {
              increment: refundAmount
            }
          }
        });

        console.log(`✅ Refund record created: ${refundRecord.id} for $${refundAmount}`);
      }

      // Update booking status if full refund
      if (refundAmount >= (payment as any).amount && refund.status === 'succeeded') {
        await db.booking.update({
          where: { id: (payment as any).bookingId },
          data: { status: 'REFUNDED' }
        });
        console.log(`✅ Booking ${(payment as any).bookingId} marked as REFUNDED (full refund)`);
      }

      // Send refund confirmation email
      try {
        await sendRefundConfirmation((payment as any).booking.user.email, {
          customerName: (payment as any).booking.user.name,
          bookingId: (payment as any).booking.id,
          originalAmount: (payment as any).amount,
          refundAmount,
          refundReason: reason,
          transactionId: (payment as any).transactionId,
          refundTransactionId: refund.id,
        });
      } catch (emailError) {
        console.error('Failed to send refund confirmation email:', emailError);
        // Don't fail the refund if email fails
      }

      return NextResponse.json({
        success: true,
        refund: {
          id: (updatedPayment as any).id,
          originalAmount: (payment as any).amount,
          refundAmount,
          status: (updatedPayment as any).status,
          refundTransactionId: (updatedPayment as any).refundTransactionId,
          refundedAt: (updatedPayment as any).refundedAt,
          reason,
          stripeRefundId: refund.id,
          booking: {
            id: (updatedPayment as any).booking.id,
            checkIn: (updatedPayment as any).booking.checkIn,
            checkOut: (updatedPayment as any).booking.checkOut,
            totalPrice: (updatedPayment as any).booking.totalPrice,
            user: (updatedPayment as any).booking.user,
            room: (updatedPayment as any).booking.room
          }
        }
      });

    } catch (stripeError) {
      const error = handleStripeError(stripeError);
      return NextResponse.json(
        { error: error.error },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Refund processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
} 