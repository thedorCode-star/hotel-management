import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '@/lib/build-safe-db';

// Simple token verification function
function verifyToken(token: string) {
  try {
    // For now, just check if token exists
    // In production, you'd verify JWT here
    return token ? { userId: 'user-id' } : null;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const db = getBuildSafeDatabase();
    const payment = await db.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            user: { select: { name: true, email: true } },
            room: { select: { number: true, type: true } }
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { status, refundAmount, refundReason } = body;

    const db = getBuildSafeDatabase();
    const payment = await db.payment.findUnique({
      where: { id },
      include: { booking: true }
    }) as any; // Type assertion for now

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Update payment
    const updatedPayment = await db.payment.update({
      where: { id },
      data: {
        status,
        refundAmount: refundAmount || null,
        refundReason: refundReason || null,
        updatedAt: new Date()
      }
    });

    // If refunding, update booking status
    if (status === 'REFUNDED' && payment.booking) {
      await db.booking.update({
        where: { id: payment.booking.id },
        data: { status: 'CANCELLED' }
      });
    }

    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const db = getBuildSafeDatabase();
    // Check if payment exists
    const payment = await db.payment.findUnique({
      where: { id }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Delete payment
    await db.payment.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 