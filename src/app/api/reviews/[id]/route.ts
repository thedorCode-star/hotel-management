import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '@/lib/build-safe-db';

export async function GET(
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

    // Fetch the specific review with related data
    const review = await db.review.findUnique({
      where: { id: reviewId },
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

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check permissions based on user role
    if (userRole === 'GUEST') {
      // Guests can only see public reviews
      if (!review.isPublic) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    } else if (userRole === 'STAFF' || userRole === 'CONCIERGE') {
      // Staff can see public reviews
      if (!review.isPublic) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }
    // ADMIN and MANAGER can see all reviews

    return NextResponse.json({
      success: true,
      review,
    });

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

    // Check if user can manage reviews
    if (!['ADMIN', 'MANAGER'].includes(userRole || '')) {
      return NextResponse.json(
        { error: 'Insufficient permissions to update reviews' },
        { status: 403 }
      );
    }

    const reviewId = params.id;
    const body = await request.json();
    const { isPublic, isVerified, comment, rating } = body;

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

    // Prepare update data
    const updateData: any = {};
    
    if (typeof isPublic === 'boolean') {
      updateData.isPublic = isPublic;
    }
    
    if (typeof isVerified === 'boolean') {
      updateData.isVerified = isVerified;
    }
    
    if (comment && comment.trim().length > 0) {
      updateData.comment = comment.trim();
    }
    
    if (rating && rating >= 1 && rating <= 5) {
      updateData.rating = rating;
    }

    // Update the review
    const updatedReview = await db.review.update({
      where: { id: reviewId },
      data: updateData,
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
      message: 'Review updated successfully',
    });

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

    // Check if user can delete reviews
    if (!['ADMIN', 'MANAGER'].includes(userRole || '')) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete reviews' },
        { status: 403 }
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

    // Delete the review
    await db.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
} 