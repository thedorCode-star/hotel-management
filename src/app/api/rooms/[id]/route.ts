import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../../lib/build-safe-db';
import { canEditRooms, canDeleteRooms, UserRole } from '../../../../lib/permissions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getBuildSafeDatabase();
    const { id } = await params;
    const room = await db.room.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ room });
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user info from request headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'User information not found' },
        { status: 401 }
      );
    }

    // Check if user has permission to edit rooms using our permissions system
    if (!canEditRooms(userRole as UserRole)) {
      return NextResponse.json(
        { 
          error: 'Insufficient permissions. Only Administrators and Managers can edit rooms.',
          requiredRole: 'ADMIN or MANAGER',
          currentRole: userRole
        },
        { status: 403 }
      );
    }

    const db = getBuildSafeDatabase();
    const { id } = await params;
    const body = await request.json();
    
    const { number, type, capacity, price, description, status } = body;

    // Check if room exists
    const existingRoom = await db.room.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: {
              in: ['PENDING', 'PAID', 'CHECKED_IN']
            }
          }
        }
      }
    });

    if (!existingRoom) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // If updating room number, check for duplicates
    if (number && number !== (existingRoom as any).number) {
      const duplicateRoom = await db.room.findUnique({
        where: { number },
      });

      if (duplicateRoom) {
        return NextResponse.json(
          { error: 'Room number already exists' },
          { status: 409 }
        );
      }
    }

    // Validation
    if (capacity && (capacity < 1 || capacity > 10)) {
      return NextResponse.json(
        { error: 'Capacity must be between 1 and 10' },
        { status: 400 }
      );
    }

    if (price && price < 0) {
      return NextResponse.json(
        { error: 'Price must be positive' },
        { status: 400 }
      );
    }

    // Update room first
    const updatedRoom = await db.room.update({
      where: { id },
      data: {
        ...(number && { number }),
        ...(type && { type }),
        ...(capacity && { capacity }),
        ...(price && { price }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
      },
    });

    // If price changed, update all pending and confirmed bookings
    if (price && price !== (existingRoom as any).price) {
      console.log('🔄 Updating prices for existing bookings...');
      
      const existingRoomAny = existingRoom as any;
      const bookings = existingRoomAny.bookings || [];
      
      // Update each booking's total price based on its duration
      for (const booking of bookings) {
        try {
          const checkIn = new Date(booking.checkIn);
          const checkOut = new Date(booking.checkOut);
          const daysDiff = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
          const newTotalPrice = price * daysDiff;

          console.log(`📅 Booking ${booking.id}: ${daysDiff} days * $${price} = $${newTotalPrice}`);

          await db.booking.update({
            where: { id: booking.id },
            data: { totalPrice: newTotalPrice },
          });
        } catch (bookingError) {
          console.error(`❌ Error updating booking ${booking.id}:`, bookingError);
        }
      }
    }

    return NextResponse.json({ room: updatedRoom });
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user info from request headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'User information not found' },
        { status: 401 }
      );
    }

    // Check if user has permission to delete rooms using our permissions system
    if (!canDeleteRooms(userRole as UserRole)) {
      return NextResponse.json(
        { 
          error: 'Insufficient permissions. Only Administrators can delete rooms.',
          requiredRole: 'ADMIN',
          currentRole: userRole
        },
        { status: 403 }
      );
    }

    const db = getBuildSafeDatabase();
    const { id } = await params;

    // Check if room exists
    const existingRoom = await db.room.findUnique({
      where: { id },
      include: {
        bookings: true,
      },
    });

    if (!existingRoom) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Check if room has active bookings
    const activeBookings = (existingRoom as any).bookings.filter(
      (booking: any) => booking.status === 'PAID' || booking.status === 'PENDING' || booking.status === 'CHECKED_IN'
    );

    if (activeBookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete room with active bookings' },
        { status: 400 }
      );
    }

    await db.room.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Room deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    );
  }
} 