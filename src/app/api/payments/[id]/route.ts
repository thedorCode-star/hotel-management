import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../../lib/build-safe-db';
import * as jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getBuildSafeDatabase();
    
    // Get authenticated user from token
    const token = request.cookies.get("auth-token")?.value;
    let userId: string | null = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as JwtPayload;
        userId = decoded.userId;
      } catch (error) {
        console.error('Token verification failed:', error);
      }
    }

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
    }) as any;

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Check authorization - users can only view their own payments
    if (userId && payment.booking.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
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

    // Get authenticated user from token
    const token = request.cookies.get("auth-token")?.value;
    let userId: string | null = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as JwtPayload;
        userId = decoded.userId;
      } catch (error) {
        console.error('Token verification failed:', error);
      }
    }

    // Check if payment exists
    const existingPayment = await db.payment.findUnique({
      where: { id: params.id },
      include: {
        booking: true,
      },
    }) as any;

    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Check authorization - users can only modify their own payments
    if (userId && existingPayment.booking.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
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
      }) as any;

      // Update booking status
      await db.booking.update({
        where: { id: updatedPayment.booking.id },
        data: { status: 'CANCELLED' },
      });

      // Update room status
      await db.room.update({
        where: { id: updatedPayment.booking.roomId },
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