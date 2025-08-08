import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../../lib/build-safe-db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getBuildSafeDatabase();
    const { id } = await params;
    const booking = await db.booking.findUnique({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getBuildSafeDatabase();
    const { id } = await params;
    const body = await request.json();
    
    const { status, checkIn, checkOut } = body;

    // Check if booking exists
    const existingBooking = await db.booking.findUnique({
      where: { id },
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

    // Validate status transition - only check if status is being changed
    if (status && status !== (existingBooking as any).status) {
      const validTransitions: { [key: string]: string[] } = {
        'PENDING': ['PAYMENT_PENDING', 'PAID', 'CANCELLED'],
        'PAYMENT_PENDING': ['PAID', 'CANCELLED'],
        'PAID': ['CHECKED_IN', 'CANCELLED', 'COMPLETED'], // Allow direct completion for past bookings
        'CHECKED_IN': ['CHECKED_OUT', 'COMPLETED'],
        'CHECKED_OUT': ['COMPLETED'],
        'COMPLETED': [], // Allow editing but not status changes
        'CANCELLED': [], // Allow editing but not status changes
        'REFUNDED': [], // Allow editing but not status changes
      };

      // Special case: Allow PAID to COMPLETED if check-out date has passed
      if ((existingBooking as any).status === 'PAID' && status === 'COMPLETED') {
        const checkOutDate = new Date((existingBooking as any).checkOut);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (checkOutDate < today) {
          // Allow the transition - this is a valid auto-completion
          console.log(`✅ Allowing auto-completion for booking ${id} - check-out date has passed`);
        } else {
          return NextResponse.json(
            { error: `Cannot complete booking before check-out date. Please check in first or wait until check-out date.` },
            { status: 400 }
          );
        }
      } else if (!validTransitions[(existingBooking as any).status]?.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status transition from ${(existingBooking as any).status} to ${status}` },
          { status: 400 }
        );
      }
    }

    // Handle status changes
    if (status === 'CANCELLED' && (existingBooking as any).status !== 'CANCELLED') {
      // Update room status back to available
      await db.room.update({
        where: { id: (existingBooking as any).roomId },
        data: { status: 'AVAILABLE' },
      });
    } else if (status === 'PAID' && (existingBooking as any).status === 'PENDING') {
      // Update room status to reserved (not occupied until check-in)
      await db.room.update({
        where: { id: (existingBooking as any).roomId },
        data: { status: 'RESERVED' },
      });
    } else if (status === 'CHECKED_IN' && (existingBooking as any).status === 'PAID') {
      // Update room status to occupied
      await db.room.update({
        where: { id: (existingBooking as any).roomId },
        data: { status: 'OCCUPIED' },
      });
    } else if (status === 'COMPLETED' && ((existingBooking as any).status === 'CHECKED_OUT' || (existingBooking as any).status === 'PAID')) {
      // Update room status back to available (for both CHECKED_OUT and PAID bookings)
      await db.room.update({
        where: { id: (existingBooking as any).roomId },
        data: { status: 'AVAILABLE' },
      });
    }

    // Auto-complete bookings where check-out date has passed
    const checkOutDate = checkOut ? new Date(checkOut) : new Date((existingBooking as any).checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkOutDate < today && (existingBooking as any).status === 'PAID') {
      // Auto-complete the booking and make room available
      await db.room.update({
        where: { id: (existingBooking as any).roomId },
        data: { status: 'AVAILABLE' },
      });
      console.log(`Auto-completed booking ${id} - check-out date passed`);
    }

    // Calculate new total price if dates or room changed
    let newTotalPrice = undefined;
    if (checkIn || checkOut || body.roomId) {
      console.log('🔍 Calculating new total price...');
      console.log('📅 Check-in:', checkIn || 'unchanged');
      console.log('📅 Check-out:', checkOut || 'unchanged');
      console.log('🏠 Room ID:', body.roomId || 'unchanged');
      
      const newCheckIn = checkIn ? new Date(checkIn) : new Date((existingBooking as any).checkIn);
      const newCheckOut = checkOut ? new Date(checkOut) : new Date((existingBooking as any).checkOut);
      const newRoomId = body.roomId || (existingBooking as any).roomId;
      
      console.log('📅 New check-in:', newCheckIn);
      console.log('📅 New check-out:', newCheckOut);
      console.log('🏠 New room ID:', newRoomId);
      
      // Get room price and calculate total
      const room = await db.room.findUnique({ 
        where: { id: newRoomId },
        select: { price: true }
      });
      
      console.log('💰 Room price:', (room as any)?.price);
      
      if (!room || typeof (room as any).price !== 'number') {
        return NextResponse.json(
          { error: 'Room not found or invalid room price' },
          { status: 400 }
        );
      }
      
      const daysDiff = Math.ceil(
        (newCheckOut.getTime() - newCheckIn.getTime()) / (1000 * 3600 * 24)
      );
      newTotalPrice = (room as any).price * daysDiff;
      
      console.log('📊 Days difference:', daysDiff);
      console.log('💰 New total price:', newTotalPrice);
    }

    // Update booking
    console.log('💾 Updating booking with new total price:', newTotalPrice);
    const updatedBooking = await db.booking.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(checkIn && { checkIn: new Date(checkIn) }),
        ...(checkOut && { checkOut: new Date(checkOut) }),
        ...(body.roomId && { roomId: body.roomId }),
        ...(newTotalPrice !== undefined && { totalPrice: newTotalPrice }),
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

    console.log('✅ Booking updated successfully. New total price:', (updatedBooking as any).totalPrice);

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getBuildSafeDatabase();
    const { id } = await params;

    // Check if booking exists
    const existingBooking = await db.booking.findUnique({
      where: { id },
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
    if ((existingBooking as any).status === 'CONFIRMED' || (existingBooking as any).status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot delete confirmed or completed bookings' },
        { status: 400 }
      );
    }

    // Update room status if booking was pending
    if ((existingBooking as any).status === 'PENDING') {
      await db.room.update({
        where: { id: (existingBooking as any).roomId },
        data: { status: 'AVAILABLE' },
      });
    }

    await db.booking.delete({
      where: { id },
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