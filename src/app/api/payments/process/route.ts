import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../../lib/build-safe-db';
import { stripe, createPaymentIntentOptions, handleStripeError, createCustomerOptions } from '../../../../lib/stripe';
import { sendPaymentConfirmation } from '../../../../lib/email';
import * as jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  console.log('🔐 PAYMENT PROCESSING STARTED');
  const startTime = Date.now();
  
  try {
    const db = getBuildSafeDatabase();
    const body = await request.json();
    const { bookingId, amount, paymentMethod, paymentMethodId, customerEmail, customerName } = body;
    
    console.log('📋 Payment request data:', { bookingId, amount, paymentMethod, customerEmail, customerName });

    // Validate required fields
    if (!bookingId || !amount || !customerEmail || !customerName) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingId, amount, customerEmail, customerName' },
        { status: 400 }
      );
    }

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

    // Verify booking exists and belongs to user (or user is admin)
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        room: {
          select: { number: true, type: true }
        }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if user owns the booking or is admin
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if ((booking as any).userId !== userId && (user as any)?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized to process payment for this booking' },
        { status: 403 }
      );
    }

    // Validate payment amount matches booking total
    if (Math.abs(amount - (booking as any).totalPrice) > 0.01) {
      return NextResponse.json(
        { error: 'Payment amount does not match booking total' },
        { status: 400 }
      );
    }

    // Check if payment already exists for this booking
    const existingPayment = await db.payment.findMany({
      where: {
        bookingId: bookingId,
        status: 'COMPLETED'
      }
    });

    if ((existingPayment as any[]).length > 0) {
      return NextResponse.json(
        { error: 'Payment already completed for this booking' },
        { status: 409 }
      );
    }

    try {
          console.log('👤 Creating/getting Stripe customer...');
    
    // Create or get Stripe customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      console.log('✅ Found existing customer:', customer.id);
    } else {
      customer = await stripe.customers.create(createCustomerOptions(customerEmail, customerName));
      console.log('✅ Created new customer:', customer.id);
    }

          console.log('💳 Creating Stripe payment intent...');
    
    // Create payment intent with Stripe
    const paymentIntentOptions = createPaymentIntentOptions(amount, {
      bookingId,
      userId,
      roomNumber: (booking as any).room.number,
      roomType: (booking as any).room.type,
      checkIn: (booking as any).checkIn,
      checkOut: (booking as any).checkOut,
    });

    // Add customer to payment intent options
    const paymentIntentWithCustomer = {
      ...paymentIntentOptions,
      customer: customer.id,
    };

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentWithCustomer);
    console.log('✅ Payment intent created:', paymentIntent.id, 'Status:', paymentIntent.status);

          // If payment method ID is provided, confirm the payment
    let paymentStatus = 'PENDING';
    const transactionId = paymentIntent.id;

    if (paymentMethodId) {
      console.log('🔐 Confirming payment with payment method:', paymentMethodId);
      
      try {
        // Attach payment method to customer if not already attached
        try {
          await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customer.id,
          });
          console.log('✅ Payment method attached to customer');
        } catch (attachError: any) {
          // Payment method might already be attached, that's okay
          if (attachError.code !== 'resource_missing') {
            console.log('⚠️ Payment method attachment warning:', attachError.message);
            throw attachError;
          } else {
            console.log('ℹ️ Payment method already attached');
          }
        }

                  console.log('🔄 Confirming payment intent...');
        
        // Confirm the payment intent
        const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id, {
          payment_method: paymentMethodId,
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/bookings`,
        });

        console.log('✅ Payment intent confirmed. Status:', confirmedPaymentIntent.status);

        if (confirmedPaymentIntent.status === 'succeeded') {
          paymentStatus = 'COMPLETED';
          console.log('🎉 Payment completed successfully!');
        } else if (confirmedPaymentIntent.status === 'requires_action') {
          console.log('🔐 Payment requires additional action (3D Secure)');
          // Handle 3D Secure or other authentication
          return NextResponse.json({
            success: true,
            requiresAction: true,
            clientSecret: confirmedPaymentIntent.client_secret,
            paymentIntentId: confirmedPaymentIntent.id,
          });
        } else {
          paymentStatus = 'FAILED';
          console.log('❌ Payment failed. Status:', confirmedPaymentIntent.status);
        }
        } catch (error) {
          const stripeError = handleStripeError(error);
          return NextResponse.json(
            { error: stripeError.error },
            { status: 400 }
          );
        }
      }

      console.log('💾 Creating payment record in database...');
      
      // Create payment record in database
      const payment = await db.payment.create({
        data: {
          bookingId,
          amount,
          paymentMethod: paymentMethod || 'stripe',
          status: paymentStatus,
          transactionId,
          processedAt: new Date(),
        },
        include: {
          booking: {
            include: {
              user: { select: { name: true, email: true } },
              room: { select: { number: true, type: true } }
            }
          }
        }
      });
      
      console.log('✅ Payment record created:', payment.id);

      // Update booking status if payment is successful
      if (paymentStatus === 'COMPLETED') {
        const updatedBooking = await db.booking.update({
          where: { id: bookingId },
          data: { 
            status: 'PAID',
            paidAmount: amount
          },
          include: {
            room: {
              select: { id: true, number: true, status: true }
            }
          }
        });

        // Update room status to RESERVED (not OCCUPIED until check-in)
        if ((updatedBooking as any).room) {
          await db.room.update({
            where: { id: (updatedBooking as any).room.id },
            data: { status: 'RESERVED' }
          });
          console.log(`🏠 Room ${(updatedBooking as any).room.number} marked as RESERVED for booking ${bookingId}`);
        }

        // Send payment confirmation email
        try {
          await sendPaymentConfirmation(customerEmail, {
            customerName,
            bookingId,
            amount,
            roomNumber: (booking as any).room.number,
            roomType: (booking as any).room.type,
            checkIn: (booking as any).checkIn,
            checkOut: (booking as any).checkOut,
            transactionId,
            paymentMethod: paymentMethod || 'stripe',
          });
        } catch (emailError) {
          console.error('Failed to send payment confirmation email:', emailError);
          // Don't fail the payment if email fails
        }
      }

      const processingTime = Date.now() - startTime;
      console.log(`⏱️ Payment processing completed in ${processingTime}ms`);
      
      return NextResponse.json({
        success: true,
        payment: {
          id: (payment as any).id,
          amount: (payment as any).amount,
          status: (payment as any).status,
          transactionId: (payment as any).transactionId,
          processedAt: (payment as any).processedAt,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          booking: {
            id: (payment as any).booking.id,
            checkIn: (payment as any).booking.checkIn,
            checkOut: (payment as any).booking.checkOut,
            totalPrice: (payment as any).booking.totalPrice,
            user: (payment as any).booking.user,
            room: (payment as any).booking.room
          }
        },
        processingTime: `${processingTime}ms`,
        message: 'Payment processed successfully'
      });

    } catch (stripeError) {
      const error = handleStripeError(stripeError);
      return NextResponse.json(
        { error: error.error },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
} 