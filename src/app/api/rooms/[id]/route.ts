import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../../lib/build-safe-db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getBuildSafeDatabase();
    const room = await db.room.findUnique({
      where: { id: params.id },
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
  { params }: { params: { id: string } }
) {
  try {
    const db = getBuildSafeDatabase();
    const body = await request.json();
    
    const { number, type, capacity, price, description, status } = body;

    // Check if room exists
    const existingRoom = await db.room.findUnique({
      where: { id: params.id },
    });

    if (!existingRoom) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // If updating room number, check for duplicates
    if (number && number !== existingRoom.number) {
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

    const updatedRoom = await db.room.update({
      where: { id: params.id },
      data: {
        ...(number && { number }),
        ...(type && { type }),
        ...(capacity && { capacity }),
        ...(price && { price }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
      },
    });

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
  { params }: { params: { id: string } }
) {
  try {
    const db = getBuildSafeDatabase();

    // Check if room exists
    const existingRoom = await db.room.findUnique({
      where: { id: params.id },
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
    const activeBookings = existingRoom.bookings.filter(
      booking => booking.status === 'CONFIRMED' || booking.status === 'PENDING'
    );

    if (activeBookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete room with active bookings' },
        { status: 400 }
      );
    }

    await db.room.delete({
      where: { id: params.id },
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