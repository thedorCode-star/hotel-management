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
    
    const { notes } = body;

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
          where: { status: 'COMPLETED' }
        }
      }
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Only allow admin or the booking owner to check in
    // For development, allow check-in if no token is present (assuming admin access)
    if (userId && (existingBooking as any).userId !== userId && userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized to check in this booking' },
        { status: 403 }
      );
    }

    // Validate booking status
    if ((existingBooking as any).status !== 'PAID') {
      return NextResponse.json(
        { error: 'Booking must be paid before check-in' },
        { status: 400 }
      );
    }

    // **FIXED: Comprehensive Payment Validation**
    // Check if payment is actually completed
    const hasPayment = (existingBooking as any).paidAmount > 0 || (existingBooking as any).payments.length > 0;
    if (!hasPayment) {
      return NextResponse.json(
        { error: 'Payment incomplete. Payment must be completed before check-in. Please process payment first.' },
        { status: 400 }
      );
    }

    // Additional validation: Ensure paid amount covers the booking
    if ((existingBooking as any).paidAmount < (existingBooking as any).totalPrice) {
      const required = (existingBooking as any).totalPrice.toFixed(2);
      const paid = (existingBooking as any).paidAmount.toFixed(2);
      return NextResponse.json(
        { error: `Payment incomplete. Required: $${required}, Paid: $${paid}. Please process payment first.` },
        { status: 400 }
      );
    }

    // **STRICT VALIDATION: Ensure payment is actually processed**
    // Check if there's a completed payment record
    const completedPayments = (existingBooking as any).payments.filter((p: any) => p.status === 'COMPLETED');
    if (completedPayments.length === 0 && (existingBooking as any).paidAmount === 0) {
      return NextResponse.json(
        { error: 'Payment incomplete. No completed payment found. Please process payment first.' },
        { status: 400 }
      );
    }

    // Validate check-in date
    const checkInDate = new Date((existingBooking as any).checkIn);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const checkInDay = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate());

    if (checkInDay > today) {
      return NextResponse.json(
        { error: 'Cannot check in before the scheduled check-in date' },
        { status: 400 }
      );
    }

    // Update booking status to CHECKED_IN
    const updatedBooking = await db.booking.update({
      where: { id },
      data: {
        status: 'CHECKED_IN',
        notes: notes ? `Check-in: ${notes}` : 'Guest checked in'
      },
      include: {
        room: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Update room status to OCCUPIED
    await db.room.update({
      where: { id: (existingBooking as any).roomId },
      data: { status: 'OCCUPIED' }
    });

    console.log(`✅ Guest checked in for booking ${id} - Room ${(existingBooking as any).room.number}`);

    return NextResponse.json({
      booking: updatedBooking,
      message: 'Check-in successful'
    });

  } catch (error) {
    console.error('Error processing check-in:', error);
    return NextResponse.json(
      { error: 'Failed to process check-in' },
      { status: 500 }
    );
  }
} 