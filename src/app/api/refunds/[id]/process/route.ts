import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../../../lib/build-safe-db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getBuildSafeDatabase();
    const { id } = await params;
    const body = await request.json();
    const { refundMethod, notes } = body;

    // Get the refund
    const refund = await db.refund.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!refund) {
      return NextResponse.json(
        { error: 'Refund not found' },
        { status: 404 }
      );
    }

    if ((refund as any).status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Refund is already completed' },
        { status: 400 }
      );
    }

    // **PROCESS REFUND BASED ON METHOD**
    let processedTransactionId = (refund as any).transactionId;
    let processingNotes = notes || 'Refund processed';

    switch (refundMethod) {
      case 'STRIPE':
        // Process Stripe refund
        try {
          // Here you would integrate with Stripe API
          // For now, we'll simulate the process
          processedTransactionId = `stripe_refund_${Date.now()}`;
          processingNotes = 'Refund processed via Stripe';
          console.log(`💳 Processing Stripe refund: $${(refund as any).amount}`);
        } catch (error) {
          console.error('Stripe refund failed:', error);
          return NextResponse.json(
            { error: 'Stripe refund processing failed' },
            { status: 500 }
          );
        }
        break;

      case 'CASH':
        // Cash refund - mark as completed immediately
        processedTransactionId = `cash_refund_${Date.now()}`;
        processingNotes = 'Cash refund issued to guest';
        console.log(`💵 Cash refund issued: $${(refund as any).amount}`);
        break;

      case 'BANK_TRANSFER':
        // Bank transfer refund
        processedTransactionId = `bank_transfer_${Date.now()}`;
        processingNotes = 'Bank transfer refund initiated';
        console.log(`🏦 Bank transfer refund: $${(refund as any).amount}`);
        break;

      case 'CREDIT_TO_ACCOUNT':
        // Credit to guest account for future bookings
        processedTransactionId = `credit_${Date.now()}`;
        processingNotes = 'Credit applied to guest account';
        console.log(`💳 Credit applied: $${(refund as any).amount}`);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid refund method' },
          { status: 400 }
        );
    }

    // Update refund status to COMPLETED
    const updatedRefund = await db.refund.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        refundMethod: refundMethod || (refund as any).refundMethod,
        transactionId: processedTransactionId,
        processedAt: new Date(),
        notes: processingNotes,
      },
      include: {
        booking: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            room: {
              select: {
                number: true,
                type: true,
              },
            },
          },
        },
      },
    });

    // Update booking status if full refund
    const booking = (refund as any).booking;
    const totalRefunded = (booking as any).refundAmount + (refund as any).amount;
    const totalPaid = (booking as any).paidAmount;

    if (totalRefunded >= totalPaid) {
      await db.booking.update({
        where: { id: (booking as any).id },
        data: {
          status: 'REFUNDED',
        },
      });
      console.log(`🔄 Booking ${(booking as any).id} marked as REFUNDED`);
    }

    console.log(`✅ Refund processed successfully: $${(refund as any).amount} via ${refundMethod}`);

    return NextResponse.json({ 
      refund: updatedRefund,
      message: 'Refund processed successfully'
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}
