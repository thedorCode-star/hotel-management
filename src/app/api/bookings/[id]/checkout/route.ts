import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../../../lib/build-safe-db';
import jwt from 'jsonwebtoken';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getBuildSafeDatabase();
    const { id } = await params;
    const body = await request.json();
    
    const { actualCheckOut, reason } = body;

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
    let userRole: string;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        userId = decoded.userId;
        userRole = decoded.role || 'USER';
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

    // Check if booking exists
    const existingBooking = await db.booking.findUnique({
      where: { id },
      include: {
        room: true,
        payments: {
          where: { status: 'COMPLETED' },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Only allow admin or the booking owner to check out
    if ((existingBooking as any).userId !== userId && userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized to check out this booking' },
        { status: 403 }
      );
    }

    // Validate check-out date
    const checkOutDate = new Date(actualCheckOut);
    const originalCheckOut = new Date((existingBooking as any).checkOut);
    const checkInDate = new Date((existingBooking as any).checkIn);
    const now = new Date();

    if (checkOutDate < checkInDate) {
      return NextResponse.json(
        { error: 'Check-out date cannot be before check-in date' },
        { status: 400 }
      );
    }

    if (checkOutDate > originalCheckOut) {
      return NextResponse.json(
        { error: 'Check-out date cannot be after original check-out date' },
        { status: 400 }
      );
    }

    // Calculate refund amount
    const totalDays = Math.ceil(
      (originalCheckOut.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
    );
    const actualDays = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
    );
    const unusedDays = totalDays - actualDays;
    const dailyRate = (existingBooking as any).totalPrice / totalDays;
    const refundAmount = unusedDays * dailyRate;

    // Update booking
    const updatedBooking = await db.booking.update({
      where: { id },
      data: {
        actualCheckOut: checkOutDate,
        status: 'CHECKED_OUT',
        refundAmount: refundAmount,
        notes: reason ? `Early check-out: ${reason}` : 'Early check-out'
      },
      include: {
        room: true,
        payments: true
      }
    });

    // Update room status to AVAILABLE
    await db.room.update({
      where: { id: (existingBooking as any).roomId },
      data: { status: 'AVAILABLE' }
    });

    // Process refund if there's a refund amount
    if (refundAmount > 0 && (existingBooking as any).payments.length > 0) {
      const payment = (existingBooking as any).payments[0];
      
      // Create refund record
      await db.payment.create({
        data: {
          bookingId: id,
          amount: refundAmount,
          paymentMethod: payment.paymentMethod,
          status: 'REFUNDED',
          transactionId: `refund_${payment.transactionId}_${Date.now()}`,
          processedAt: new Date(),
          refundedAt: new Date()
        }
      });

      console.log(`💰 Processed refund of $${refundAmount} for booking ${id}`);
    }

    return NextResponse.json({
      booking: updatedBooking,
      refundAmount,
      unusedDays,
      message: `Early check-out processed. Refund amount: $${refundAmount.toFixed(2)}`
    });

  } catch (error) {
    console.error('Error processing early check-out:', error);
    return NextResponse.json(
      { error: 'Failed to process early check-out' },
      { status: 500 }
    );
  }
} 