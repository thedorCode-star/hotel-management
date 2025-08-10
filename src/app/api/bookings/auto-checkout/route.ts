import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../../lib/build-safe-db';

export async function POST(request: NextRequest) {
  try {
    const db = getBuildSafeDatabase();
    const now = new Date();
    
    // Find all bookings that are checked in but past their checkout date
    const expiredBookings = await db.booking.findMany({
      where: {
        status: 'CHECKED_IN',
        checkOut: {
          lt: now // Checkout date is in the past
        }
      },
      include: {
        room: true,
        user: {
          select: {
            name: true,
            email: true
          }
        },
        payments: {
          where: { status: 'COMPLETED' },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (expiredBookings.length === 0) {
      return NextResponse.json({
        message: 'No expired bookings found',
        processedCount: 0
      });
    }

    const processedBookings = [];
    const errors = [];

    for (const booking of expiredBookings) {
      try {
        // Calculate any potential refund (though usually none for expired checkouts)
        const actualCheckOut = new Date(booking.checkOut);
        const checkInDate = new Date(booking.checkIn);
        const totalDays = Math.ceil(
          (new Date(booking.checkOut).getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
        );
        const actualDays = Math.ceil(
          (actualCheckOut.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)
        );
        
        // Update booking status to CHECKED_OUT
        const updatedBooking = await db.booking.update({
          where: { id: booking.id },
          data: {
            status: 'CHECKED_OUT',
            actualCheckOut: actualCheckOut,
            notes: `Auto-checkout: Guest checked out automatically after checkout date expired`,
            refundAmount: 0 // No refund for expired checkouts
          }
        });

        // Update room status to AVAILABLE
        await db.room.update({
          where: { id: booking.roomId },
          data: { status: 'AVAILABLE' }
        });

        processedBookings.push({
          id: booking.id,
          roomNumber: (booking as any).room.number,
          guestName: (booking as any).user.name,
          originalCheckOut: booking.checkOut,
          processedAt: now
        });

        console.log(`✅ Auto-checkout processed for booking ${booking.id} - Room ${(booking as any).room.number}`);

      } catch (error) {
        console.error(`❌ Error processing auto-checkout for booking ${booking.id}:`, error);
        errors.push({
          bookingId: booking.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: `Auto-checkout completed`,
      processedCount: processedBookings.length,
      processedBookings,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error in auto-checkout process:', error);
    return NextResponse.json(
      { error: 'Failed to process auto-checkout' },
      { status: 500 }
    );
  }
}

// GET endpoint to check for expired bookings without processing them
export async function GET(request: NextRequest) {
  try {
    const db = getBuildSafeDatabase();
    const now = new Date();
    
    const expiredBookings = await db.booking.findMany({
      where: {
        status: 'CHECKED_IN',
        checkOut: {
          lt: now
        }
      },
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
        status: true,
        room: {
          select: {
            number: true,
            type: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      expiredBookings,
      count: expiredBookings.length,
      currentTime: now
    });

  } catch (error) {
    console.error('Error checking expired bookings:', error);
    return NextResponse.json(
      { error: 'Failed to check expired bookings' },
      { status: 500 }
    );
  }
}
