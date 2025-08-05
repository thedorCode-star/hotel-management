import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../../lib/build-safe-db';

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
    });

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
    
    const { status, comment, rating } = body;

    // Check if review exists
    const existingReview = await db.review.findUnique({
      where: { id: params.id },
      include: {
        room: true,
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Validate status transition
    const validTransitions: { [key: string]: string[] } = {
      'PENDING': ['APPROVED', 'REJECTED'],
      'APPROVED': ['REJECTED'],
      'REJECTED': ['APPROVED'],
    };

    if (status && !validTransitions[existingReview.status]?.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status transition from ${existingReview.status} to ${status}` },
        { status: 400 }
      );
    }

    // Update review
    const updatedReview = await db.review.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(comment && { comment }),
        ...(rating && { rating }),
        ...(status && { moderatedAt: new Date() }),
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
    });

    // Update room rating if status changed
    if (status && status !== existingReview.status) {
      await updateRoomRating(existingReview.roomId);
    }

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

    // Check if review exists
    const existingReview = await db.review.findUnique({
      where: { id: params.id },
      include: {
        room: true,
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
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
    } else {
      // Reset rating if no approved reviews
      await db.room.update({
        where: { id: roomId },
        data: {
          averageRating: 0,
          reviewCount: 0,
        },
      });
    }
  } catch (error) {
    console.error('Error updating room rating:', error);
  }
} 