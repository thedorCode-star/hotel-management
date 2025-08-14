import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '@/lib/build-safe-db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const reviewId = params.id;

    // Validate the review exists
    const existingReview = await db.review.findUnique({
      where: { id: reviewId },
    }) as any;

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if user is trying to mark their own review as helpful
    if (existingReview.userId === userId) {
      return NextResponse.json(
        { error: 'You cannot mark your own review as helpful' },
        { status: 400 }
      );
    }

    // Increment the helpful count
    const updatedReview = await db.review.update({
      where: { id: reviewId },
      data: {
        helpfulCount: {
          increment: 1,
        },
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
    }) as any;

    return NextResponse.json({
      success: true,
      review: updatedReview,
      message: 'Review marked as helpful',
    });

  } catch (error) {
    console.error('Error marking review as helpful:', error);
    return NextResponse.json(
      { error: 'Failed to mark review as helpful' },
      { status: 500 }
    );
  }
}
