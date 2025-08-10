import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../../lib/build-safe-db';
import { sendEmail, sendBookingReminder } from '../../../../lib/email';
import * as jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const db = getBuildSafeDatabase();
    const body = await request.json();
    const { type, bookingId, email, customData } = body;

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

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        userId = decoded.userId;
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

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if ((user as any)?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    let result;

    switch (type) {
      case 'booking_reminder':
        if (!bookingId) {
          return NextResponse.json(
            { error: 'Booking ID is required for booking reminder' },
            { status: 400 }
          );
        }

        const booking = await db.booking.findUnique({
          where: { id: bookingId },
          include: {
            user: { select: { name: true, email: true } },
            room: { select: { number: true, type: true } }
          }
        });

        if (!booking) {
          return NextResponse.json(
            { error: 'Booking not found' },
            { status: 404 }
          );
        }

        result = await sendBookingReminder((booking as any).user.email, {
          customerName: (booking as any).user.name,
          bookingId: (booking as any).id,
          roomNumber: (booking as any).room.number,
          roomType: (booking as any).room.type,
          checkIn: (booking as any).checkIn,
          checkOut: (booking as any).checkOut,
          totalPrice: (booking as any).totalPrice,
        });
        break;

      case 'custom':
        if (!email || !customData) {
          return NextResponse.json(
            { error: 'Email and custom data are required for custom emails' },
            { status: 400 }
          );
        }

        result = await sendEmail(email, 'custom', customData);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Email notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send email notification' },
      { status: 500 }
    );
  }
} 