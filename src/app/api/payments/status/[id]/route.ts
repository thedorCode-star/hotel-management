import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../../../lib/build-safe-db';
import * as jwt from 'jsonwebtoken';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getBuildSafeDatabase();
    const paymentId = params.id;

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

    // Get payment with booking details
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            room: { select: { number: true, type: true, price: true } }
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized (payment owner or admin)
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if ((payment as any).booking.userId !== userId && (user as any)?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized to view this payment' },
        { status: 403 }
      );
    }

    // Calculate payment details
    const paymentDetails = {
      id: (payment as any).id,
      amount: (payment as any).amount,
      status: (payment as any).status,
      paymentMethod: (payment as any).paymentMethod,
      transactionId: (payment as any).transactionId,
      refundTransactionId: (payment as any).refundTransactionId,
      processedAt: (payment as any).processedAt,
      refundedAt: (payment as any).refundedAt,
      createdAt: (payment as any).createdAt,
      updatedAt: (payment as any).updatedAt,
      booking: {
        id: (payment as any).booking.id,
        checkIn: (payment as any).booking.checkIn,
        checkOut: (payment as any).booking.checkOut,
        totalPrice: (payment as any).booking.totalPrice,
        status: (payment as any).booking.status,
        user: (payment as any).booking.user,
        room: (payment as any).booking.room
      },
      // Additional calculated fields
      isRefundable: (payment as any).status === 'COMPLETED' && !(payment as any).refundedAt,
      refundAmount: (payment as any).status === 'REFUNDED' ? (payment as any).amount : 0,
      daysSincePayment: Math.floor((Date.now() - new Date((payment as any).processedAt).getTime()) / (1000 * 60 * 60 * 24)),
      paymentMethodDisplay: getPaymentMethodDisplay((payment as any).paymentMethod),
      statusDisplay: getStatusDisplay((payment as any).status)
    };

    return NextResponse.json({
      success: true,
      payment: paymentDetails
    });

  } catch (error) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      { error: 'Failed to get payment status' },
      { status: 500 }
    );
  }
}

function getPaymentMethodDisplay(method: string): string {
  const methods: { [key: string]: string } = {
    'credit_card': 'Credit Card',
    'debit_card': 'Debit Card',
    'paypal': 'PayPal',
    'bank_transfer': 'Bank Transfer',
    'cash': 'Cash',
    'check': 'Check'
  };
  return methods[method] || method;
}

function getStatusDisplay(status: string): string {
  const statuses: { [key: string]: string } = {
    'PENDING': 'Processing',
    'COMPLETED': 'Completed',
    'FAILED': 'Failed',
    'REFUNDED': 'Refunded',
    'CANCELLED': 'Cancelled'
  };
  return statuses[status] || status;
} 