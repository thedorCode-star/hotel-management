import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../lib/build-safe-db';
import * as jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export async function POST(request: NextRequest) {
  try {
    const db = getBuildSafeDatabase();
    const body = await request.json();
    
    const { bookingId, amount, paymentMethod, cardDetails } = body;

    // Validation
    if (!bookingId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

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

    // Check if booking exists and is valid for payment
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        room: true,
        user: true,
      },
    }) as any;

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check authorization - users can only pay for their own bookings
    if (userId && booking.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cannot process payment for cancelled booking' },
        { status: 400 }
      );
    }

    // Check if payment already exists
    const existingPayments = await db.payment.findMany({
      where: { bookingId },
      take: 1,
    }) as any[];

    if (existingPayments.length > 0) {
      return NextResponse.json(
        { error: 'Payment already exists for this booking' },
        { status: 409 }
      );
    }

    // Simulate payment processing (in real app, integrate with payment gateway)
    const paymentStatus = await processPayment(amount, paymentMethod, cardDetails);

    if (paymentStatus.status === 'failed') {
      return NextResponse.json(
        { error: paymentStatus.error || 'Payment processing failed' },
        { status: 400 }
      );
    }

    // Create payment record
    const payment = await db.payment.create({
      data: {
        bookingId,
        amount,
        paymentMethod,
        status: paymentStatus.status,
        transactionId: paymentStatus.transactionId,
        processedAt: new Date(),
      },
      include: {
        booking: {
          include: {
            room: true,
            user: true,
          },
        },
      },
    }) as any;

    // Update booking status if payment is successful
    if (paymentStatus.status === 'completed') {
      await db.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' },
      });

      // Update room status
      await db.room.update({
        where: { id: booking.roomId },
        data: { status: 'OCCUPIED' },
      });
    }

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = getBuildSafeDatabase();
    const { searchParams } = new URL(request.url);
    
    const bookingId = searchParams.get('bookingId');
    const status = searchParams.get('status');

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

    const whereClause: any = {};
    
    if (bookingId) {
      whereClause.bookingId = bookingId;
    }
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // If user is authenticated, only show their payments
    if (userId) {
      whereClause.booking = {
        userId: userId
      };
    }

    const payments = await db.payment.findMany({
      where: whereClause,
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
      orderBy: { processedAt: 'desc' },
    }) as any[];

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// Simulate payment processing (replace with actual payment gateway integration)
async function processPayment(amount: number, paymentMethod: string, cardDetails?: any) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate payment processing logic
  const successRate = 0.95; // 95% success rate
  const isSuccess = Math.random() < successRate;

  if (isSuccess) {
    return {
      status: 'completed',
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  } else {
    return {
      status: 'failed',
      error: 'Payment declined. Please check your card details and try again.',
    };
  }
}