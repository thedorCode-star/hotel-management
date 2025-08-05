import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../lib/build-safe-db';

export async function GET(request: NextRequest) {
  try {
    const db = getBuildSafeDatabase();
    const { searchParams } = new URL(request.url);
    
    const roomId = searchParams.get('roomId');
    const userId = searchParams.get('userId');
    const rating = searchParams.get('rating');
    const status = searchParams.get('status');

    let whereClause: any = {};
    
    if (roomId) {
      whereClause.roomId = roomId;
    }
    
    if (userId) {
      whereClause.userId = userId;
    }
    
    if (rating) {
      whereClause.rating = parseInt(rating);
    }
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // Use the correct table name for reviews, which is 'reviews' on BuildSafeDatabase
    const reviews = await db.reviews.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        room: {
          select: {
            id: true,
            number: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reviews });
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
    const body = await request.json();
    
    const { roomId, rating, comment } = body;

    // Validation
    if (!roomId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (comment.length < 10 || comment.length > 1000) {
      return NextResponse.json(
        { error: 'Comment must be between 10 and 1000 characters' },
        { status: 400 }
      );
    }

    // Check if room exists
    const room = await db.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Check if user has already reviewed this room
    const existingReview = await db.review.findFirst({
      where: {
        roomId,
        userId: body.userId, // This should come from authenticated user
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this room' },
        { status: 409 }
      );
    }

    // Check if user has stayed in this room (optional validation)
    const userBookings = await db.booking.findMany({
      where: {
        roomId,
        userId: body.userId,
        status: 'COMPLETED',
      },
    });

    if (userBookings.length === 0) {
      return NextResponse.json(
        { error: 'You can only review rooms you have stayed in' },
        { status: 400 }
      );
    }

    // Create review
    const review = await db.review.create({
      data: {
        roomId,
        userId: body.userId,
        rating,
        comment,
        status: 'PENDING', // Requires moderation
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        room: {
          select: {
            id: true,
            number: true,
            type: true,
          },
        },
      },
    });

    // Update room average rating
    await updateRoomRating(roomId);

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

async function updateRoomRating(roomId: string) {
  try {
    const db = getBuildSafeDatabase();
    
    // Calculate average rating for approved reviews
    const reviews = await db.review.findMany({
      where: {
        roomId,
        status: 'APPROVED',
      },
      select: {
        rating: true,
      },
    });

    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      await db.room.update({
        where: { id: roomId },
        data: {
          averageRating,
          reviewCount: reviews.length,
        },
      });
    }
  } catch (error) {
    console.error('Error updating room rating:', error);
  }
} 