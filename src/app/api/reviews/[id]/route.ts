import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../../lib/build-safe-db';
import * as jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getBuildSafeDatabase();
    const review = await db.review.findUnique({
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
          },
        },
      },
    }) as any;

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review' },
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
    
    const { comment, rating } = body;

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

    // Check if review exists
    const existingReview = await db.review.findUnique({
      where: { id: params.id },
      include: {
        room: true,
      },
    }) as any;

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to update this review
    if (userId && existingReview.userId !== userId) {
      return NextResponse.json(
        { error: 'You can only update your own reviews' },
        { status: 403 }
      );
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate comment if provided
    if (comment && (comment.length < 10 || comment.length > 1000)) {
      return NextResponse.json(
        { error: 'Comment must be between 10 and 1000 characters' },
        { status: 400 }
      );
    }

    // Update review
    const updatedReview = await db.review.update({
      where: { id: params.id },
      data: {
        ...(comment && { comment }),
        ...(rating && { rating }),
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
          },
        },
      },
    }) as any;

    // Update room rating
    await updateRoomRating(existingReview.roomId);

    return NextResponse.json({ review: updatedReview });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
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

    // Check if review exists
    const existingReview = await db.review.findUnique({
      where: { id: params.id },
      include: {
        room: true,
      },
    }) as any;

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to delete this review
    if (userId && existingReview.userId !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own reviews' },
        { status: 403 }
      );
    }

    // Delete review
    await db.review.delete({
      where: { id: params.id },
    });

    // Update room rating
    await updateRoomRating(existingReview.roomId);

    return NextResponse.json(
      { message: 'Review deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
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
    } else {
      console.log(`Room ${roomId} has no reviews`);
    }
  } catch (error) {
    console.error('Error updating room rating:', error);
  }
} 