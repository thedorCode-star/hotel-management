import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '@/lib/build-safe-db';

export async function GET(request: NextRequest) {
  try {
    const db = getBuildSafeDatabase();
    
    // Get user from headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch reviews with related data
    const reviews = await db.review.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        room: {
          select: {
            id: true,
            number: true,
            type: true,
          },
        },
        booking: {
          select: {
            id: true,
            checkIn: true,
            checkOut: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }) as any[];

    // Filter reviews based on user role
    let filteredReviews = reviews;
    
    if (userRole === 'GUEST') {
      // Guests can only see public reviews
      filteredReviews = reviews.filter((review: any) => review.isPublic);
    } else if (userRole === 'STAFF' || userRole === 'CONCIERGE') {
      // Staff can see all reviews but not private ones
      filteredReviews = reviews.filter((review: any) => review.isPublic);
    }
    // ADMIN and MANAGER can see all reviews

    return NextResponse.json({
      success: true,
      reviews: filteredReviews,
      total: filteredReviews.length,
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getBuildSafeDatabase();
    
    // Get user from headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user can create reviews
    if (!['GUEST', 'STAFF', 'CONCIERGE'].includes(userRole || '')) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create reviews' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { rating, comment, roomId, bookingId } = body;

    // Validate required fields
    if (!rating || !comment || !roomId) {
      return NextResponse.json(
        { error: 'Rating, comment, and roomId are required' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user has already reviewed this room
    const existingReviews = await db.review.findMany({
      where: {
        userId: userId,
        roomId: roomId,
      },
      take: 1,
    }) as any[];

    if (existingReviews.length > 0) {
      return NextResponse.json(
        { error: 'You have already reviewed this room' },
        { status: 400 }
      );
    }

    // Verify room exists
    const room = await db.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Create the review
    const review = await db.review.create({
      data: {
        rating: rating,
        comment: comment,
        userId: userId,
        roomId: roomId,
        bookingId: bookingId || null,
        isVerified: userRole === 'STAFF' || userRole === 'CONCIERGE', // Staff reviews are auto-verified
        isPublic: true, // Default to public
        helpfulCount: 0,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        room: {
          select: {
            id: true,
            number: true,
            type: true,
          },
        },
        booking: {
          select: {
            id: true,
            checkIn: true,
            checkOut: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      review: review,
      message: 'Review created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
} 