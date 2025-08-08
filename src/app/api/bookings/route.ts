import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../lib/build-safe-db';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export async function GET(request: NextRequest) {
  try {
    const db = getBuildSafeDatabase();
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const roomId = searchParams.get('roomId');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');

    let whereClause: any = {};
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    if (userId) {
      whereClause.userId = userId;
    }
    
    if (roomId) {
      whereClause.roomId = roomId;
    }
    
    if (checkIn || checkOut) {
      whereClause.OR = [];
      if (checkIn) {
        whereClause.OR.push({
          checkIn: { gte: new Date(checkIn) },
        });
      }
      if (checkOut) {
        whereClause.OR.push({
          checkOut: { lte: new Date(checkOut) },
        });
      }
    }

    const bookings = await db.booking.findMany({
      where: whereClause,
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getBuildSafeDatabase();
    const body = await request.json();
    
    const { roomId, checkIn, checkOut, guestCount } = body;

    // Validation
    if (!roomId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // For demo purposes, if no authenticated user, create a temporary user or use a default
    if (!userId) {
      // Check if there's a default user in the system
      const defaultUser = await db.user.findMany({
        where: { role: 'GUEST' },
        take: 1,
        select: { id: true }
      }) as any[];
      
      if (defaultUser.length > 0) {
        userId = defaultUser[0].id;
      } else {
        // Create a temporary guest user for demo purposes
        const tempUser = await db.user.create({
          data: {
            email: `guest-${Date.now()}@example.com`,
            password: 'temp-password',
            name: 'Guest User',
            role: 'GUEST'
          }
        }) as any;
        userId = tempUser.id;
      }
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const now = new Date();

    // Validate dates - allow same-day bookings but ensure check-in is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    
    const checkInDay = new Date(checkInDate);
    checkInDay.setHours(0, 0, 0, 0); // Set to start of check-in day

    if (checkInDay < today) {
      return NextResponse.json(
        { error: 'Check-in date cannot be in the past' },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date' },
        { status: 400 }
      );
    }

    // Check if room exists and is available
    const room = await db.room.findUnique({
      where: { id: roomId },
    }) as any;

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    if (room.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'Room is not available' },
        { status: 400 }
      );
    }

    // Check room capacity
    if (guestCount && guestCount > room.capacity) {
      return NextResponse.json(
        { error: `Room capacity is ${room.capacity} guests` },
        { status: 400 }
      );
    }

    // Check for overlapping bookings
    const overlappingBookings = await db.booking.findMany({
      where: {
        roomId,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
        OR: [
          {
            checkIn: { lt: checkOutDate },
            checkOut: { gt: checkInDate },
          },
        ],
      },
    }) as any[];

    if (overlappingBookings.length > 0) {
      return NextResponse.json(
        { error: 'Room is already booked for these dates' },
        { status: 409 }
      );
    }

    // Calculate total price
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = room.price * nights;

    // Create booking
    const booking = await db.booking.create({
      data: {
        roomId,
        userId: userId!,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice,
        status: 'PENDING',
        paymentRequired: true,
        paidAmount: 0,
        refundAmount: 0
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
          },
        },
      },
    });

    // Update room status to RESERVED (not OCCUPIED until payment)
    await db.room.update({
      where: { id: roomId },
      data: { status: 'RESERVED' },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
} 