import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../lib/build-safe-db';

export async function GET(request: NextRequest) {
  try {
    const db = getBuildSafeDatabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const bookingId = searchParams.get('bookingId');

    const where: any = {};
    if (status) where.status = status;
    if (bookingId) where.bookingId = bookingId;

    const refunds = await db.refund.findMany({
      where,
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
        payment: {
          select: {
            amount: true,
            paymentMethod: true,
            transactionId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ refunds });
  } catch (error) {
    console.error('Error fetching refunds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch refunds' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getBuildSafeDatabase();
    const body = await request.json();
    const { bookingId, amount, refundMethod, notes, paymentId } = body;

    // Validate booking exists
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Validate refund amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Refund amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Check if refund amount doesn't exceed paid amount
    const totalPaid = (booking as any).paidAmount || 0;
    const totalRefunded = (booking as any).refundAmount || 0;
    const availableForRefund = totalPaid - totalRefunded;

    if (amount > availableForRefund) {
      return NextResponse.json(
        { error: `Refund amount exceeds available amount. Available: $${availableForRefund.toFixed(2)}` },
        { status: 400 }
      );
    }

    // Create refund record
    const refund = await db.refund.create({
      data: {
        bookingId,
        paymentId,
        amount,
        refundMethod,
        status: 'PENDING',
        transactionId: `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        notes,
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

    // **FIXED: Remove booking.refundAmount update to prevent double-counting**
    // The Refund model is now the single source of truth for financial reporting
    // await db.booking.update({
    //   where: { id: bookingId },
    //   data: {
    //     refundAmount: {
    //       increment: amount,
    //     },
    //   },
    // });

    console.log(`✅ Refund record created: ${refund.id} for $${amount}`);
    console.log(`ℹ️ Note: booking.refundAmount not updated to prevent double-counting`);

    return NextResponse.json({ refund });
  } catch (error) {
    console.error('Error creating refund:', error);
    return NextResponse.json(
      { error: 'Failed to create refund' },
      { status: 500 }
    );
  }
}
