import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../lib/build-safe-db';
import * as jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export async function GET(request: NextRequest) {
  try {
    const db = getBuildSafeDatabase();
    const { searchParams } = new URL(request.url);
    
    const roomId = searchParams.get('roomId');
    const userId = searchParams.get('userId');
    const rating = searchParams.get('rating');

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

    const reviews = await db.review.findMany({
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
    }) as any[];

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

    // Check if room exists
    const room = await db.room.findUnique({
      where: { id: roomId },
    }) as any;

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Check if user has already reviewed this room
    const existingReview = await db.review.findMany({
      where: {
        roomId,
        userId: userId,
      },
      take: 1,
    }) as any[];

    if (existingReview.length > 0) {
      return NextResponse.json(
        { error: 'You have already reviewed this room' },
        { status: 409 }
      );
    }

    // Check if user has stayed in this room (optional validation)
    const userBookings = await db.booking.findMany({
      where: {
        roomId,
        userId: userId,
        status: 'COMPLETED',
      },
    }) as any[];

    if (!userBookings || userBookings.length === 0) {
      return NextResponse.json(
        { error: 'You can only review rooms you have stayed in' },
        { status: 400 }
      );
    }

    // Create review
    const review = await db.review.create({
      data: {
        roomId,
        userId: userId,
        rating,
        comment,
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
    }) as any;

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
    
    // Calculate average rating for all reviews (since we don't have status field)
    const reviews = await db.review.findMany({
      where: {
        roomId,
      },
      select: {
        rating: true,
      },
    }) as any[];

    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      // Note: Room model doesn't have averageRating and reviewCount fields
      // We'll just log the calculation for now
      console.log(`Room ${roomId} average rating: ${averageRating}, total reviews: ${reviews.length}`);
    }
  } catch (error) {
    console.error('Error updating room rating:', error);
  }
} 