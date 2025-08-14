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

    // Get current date for recent calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch all reviews for stats calculation
    const allReviews = await db.review.findMany({
      select: {
        rating: true,
        createdAt: true,
        isVerified: true,
        isPublic: true,
        helpfulCount: true,
      },
    }) as any[];

    // Calculate basic stats
    const totalReviews = allReviews.length;
    const verifiedReviews = allReviews.filter((review: any) => review.isVerified).length;
    const publicReviews = allReviews.filter((review: any) => review.isPublic).length;
    
    // Calculate average rating
    const totalRating = allReviews.reduce((sum: number, review: any) => sum + review.rating, 0);
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    // Calculate rating distribution
    const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allReviews.forEach((review: any) => {
      ratingDistribution[review.rating] = (ratingDistribution[review.rating] || 0) + 1;
    });

    // Calculate recent reviews (this month)
    const recentReviews = allReviews.filter((review: any) => 
      new Date(review.createdAt) >= startOfMonth
    ).length;

    // Calculate helpful reviews (reviews with helpful votes)
    const helpfulReviews = allReviews.filter((review: any) => review.helpfulCount > 0).length;

    // Calculate top performing ratings
    const topRating = Object.entries(ratingDistribution).reduce((a, b) => 
      ratingDistribution[parseInt(a[0])] > ratingDistribution[parseInt(b[0])] ? a : b
    )[0];

    // Calculate review sentiment (positive = 4-5 stars, neutral = 3 stars, negative = 1-2 stars)
    const positiveReviews = allReviews.filter((review: any) => review.rating >= 4).length;
    const neutralReviews = allReviews.filter((review: any) => review.rating === 3).length;
    const negativeReviews = allReviews.filter((review: any) => review.rating <= 2).length;

    const stats = {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      ratingDistribution,
      recentReviews,
      verifiedReviews,
      helpfulReviews,
      publicReviews,
      topRating: parseInt(topRating),
      sentiment: {
        positive: positiveReviews,
        neutral: neutralReviews,
        negative: negativeReviews,
        positivePercentage: totalReviews > 0 ? Math.round((positiveReviews / totalReviews) * 100) : 0,
        negativePercentage: totalReviews > 0 ? Math.round((negativeReviews / totalReviews) * 100) : 0,
      },
      verificationRate: totalReviews > 0 ? Math.round((verifiedReviews / totalReviews) * 100) : 0,
      helpfulRate: totalReviews > 0 ? Math.round((helpfulReviews / totalReviews) * 100) : 0,
    };

    return NextResponse.json({
      success: true,
      stats,
    });

  } catch (error) {
    console.error('Error fetching review stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review stats' },
      { status: 500 }
    );
  }
}
