import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../../lib/build-safe-db';

// This endpoint is designed to be called by external cron job services
// You can set up a cron job to call this endpoint every hour or at specific times
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from an authorized source (optional security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = getBuildSafeDatabase();
    const now = new Date();
    
    // Find all bookings that are checked in but past their checkout date
    const expiredBookings = await db.booking.findMany({
      where: {
        status: 'CHECKED_IN',
        checkOut: {
          lt: now
        }
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

    if (expiredBookings.length === 0) {
      return NextResponse.json({
        message: 'No expired bookings found',
        processedCount: 0,
        timestamp: now.toISOString()
      });
    }

    const processedBookings = [];
    const errors = [];

    for (const booking of expiredBookings) {
      try {
        // Update booking status to CHECKED_OUT
        await db.booking.update({
          where: { id: booking.id },
          data: {
            status: 'CHECKED_OUT',
            actualCheckOut: new Date(booking.checkOut),
            notes: `Auto-checkout: Guest checked out automatically after checkout date expired (${now.toISOString()})`,
            refundAmount: 0
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

        console.log(`✅ Cron: Auto-checkout processed for booking ${booking.id} - Room ${(booking as any).room.number}`);

      } catch (error) {
        console.error(`❌ Cron: Error processing auto-checkout for booking ${booking.id}:`, error);
        errors.push({
          bookingId: booking.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: 'Auto-checkout cron job completed',
      processedCount: processedBookings.length,
      processedBookings,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error('Error in auto-checkout cron job:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process auto-checkout cron job',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST method for manual triggering (same as GET but with additional logging)
export async function POST(request: NextRequest) {
  const result = await GET(request);
  console.log('Manual auto-checkout triggered:', result);
  return result;
}
