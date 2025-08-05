import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../../lib/build-safe-db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getBuildSafeDatabase();
    const booking = await db.booking.findUnique({
      where: { id: params.id },
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
            price: true,
            status: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
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
    
    const { status, checkIn, checkOut } = body;

    // Check if booking exists
    const existingBooking = await db.booking.findUnique({
      where: { id: params.id },
      include: {
        room: true,
      },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Validate status transition
    const validTransitions: { [key: string]: string[] } = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['COMPLETED', 'CANCELLED'],
      'CANCELLED': [],
      'COMPLETED': [],
    };

    if (status && !validTransitions[existingBooking.status]?.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status transition from ${existingBooking.status} to ${status}` },
        { status: 400 }
      );
    }

    // Handle status changes
    if (status === 'CANCELLED' && existingBooking.status !== 'CANCELLED') {
      // Update room status back to available
      await db.room.update({
        where: { id: existingBooking.roomId },
        data: { status: 'AVAILABLE' },
      });
    } else if (status === 'CONFIRMED' && existingBooking.status === 'PENDING') {
      // Update room status to occupied
      await db.room.update({
        where: { id: existingBooking.roomId },
        data: { status: 'OCCUPIED' },
      });
    } else if (status === 'COMPLETED' && existingBooking.status === 'CONFIRMED') {
      // Update room status back to available
      await db.room.update({
        where: { id: existingBooking.roomId },
        data: { status: 'AVAILABLE' },
      });
    }

    // Update booking
    const updatedBooking = await db.booking.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(checkIn && { checkIn: new Date(checkIn) }),
        ...(checkOut && { checkOut: new Date(checkOut) }),
      },
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
            price: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
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

    // Check if booking exists
    const existingBooking = await db.booking.findUnique({
      where: { id: params.id },
      include: {
        room: true,
      },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Only allow deletion of pending or cancelled bookings
    if (existingBooking.status === 'CONFIRMED' || existingBooking.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot delete confirmed or completed bookings' },
        { status: 400 }
      );
    }

    // Update room status if booking was pending
    if (existingBooking.status === 'PENDING') {
      await db.room.update({
        where: { id: existingBooking.roomId },
        data: { status: 'AVAILABLE' },
      });
    }

    await db.booking.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Booking deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
} 