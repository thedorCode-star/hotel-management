import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../../lib/build-safe-db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getBuildSafeDatabase();
    const payment = await db.payment.findUnique({
      where: { id: params.id },
      include: {
        booking: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            room: {
              select: {
                id: true,
                number: true,
                type: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getBuildSafeDatabase();
    const body = await request.json();
    
    const { action } = body;

    // Check if payment exists
    const existingPayment = await db.payment.findUnique({
      where: { id: params.id },
      include: {
        booking: true,
      },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (action === 'refund') {
      // Check if payment is eligible for refund
      if (existingPayment.status !== 'completed') {
        return NextResponse.json(
          { error: 'Only completed payments can be refunded' },
          { status: 400 }
        );
      }

      // Simulate refund processing
      const refundStatus = await processRefund(existingPayment.amount, existingPayment.transactionId);

      if (refundStatus.status === 'failed') {
        return NextResponse.json(
          { error: refundStatus.error || 'Refund processing failed' },
          { status: 400 }
        );
      }

      // Update payment status
      const updatedPayment = await db.payment.update({
        where: { id: params.id },
        data: {
          status: 'refunded',
          refundedAt: new Date(),
          refundTransactionId: refundStatus.transactionId,
        },
        include: {
          booking: {
            include: {
              user: true,
              room: true,
            },
          },
        },
      });

      // Update booking status
      await db.booking.update({
        where: { id: existingPayment.bookingId },
        data: { status: 'CANCELLED' },
      });

      // Update room status
      await db.room.update({
        where: { id: existingPayment.booking.roomId },
        data: { status: 'AVAILABLE' },
      });

      return NextResponse.json({ payment: updatedPayment });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}

// Simulate refund processing
async function processRefund(amount: number, originalTransactionId: string) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate refund processing logic
  const successRate = 0.98; // 98% success rate
  const isSuccess = Math.random() < successRate;

  if (isSuccess) {
    return {
      status: 'completed',
      transactionId: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  } else {
    return {
      status: 'failed',
      error: 'Refund processing failed. Please contact support.',
    };
  }
} 