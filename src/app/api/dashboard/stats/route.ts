import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../../lib/build-safe-db';

export async function GET(request: NextRequest) {
  try {
    const db = getBuildSafeDatabase();
    
    // Get current date for calculations
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Room Statistics
    const totalRooms = await db.room.count({});
    const availableRooms = await db.room.count({
      where: { status: 'AVAILABLE' },
    });
    const occupiedRooms = await db.room.count({
      where: { status: 'OCCUPIED' },
    });
    const maintenanceRooms = await db.room.count({
      where: { status: 'MAINTENANCE' },
    });

    // Booking Statistics
    const totalBookings = await db.booking.count({});
    const confirmedBookings = await db.booking.count({
      where: { status: 'CONFIRMED' },
    });
    const pendingBookings = await db.booking.count({
      where: { status: 'PENDING' },
    });
    const cancelledBookings = await db.booking.count({
      where: { status: 'CANCELLED' },
    });

    // Today's Statistics
    const todayBookings = await db.booking.count({
      where: {
        checkIn: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    // **IMPROVED REVENUE CALCULATIONS**
    // Today's Revenue - Based on actual payments processed today
    const todayRevenue = await db.payment.aggregate({
      where: {
        status: 'COMPLETED',
        processedAt: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      _sum: {
        amount: true,
      },
    });

    // This Month's Revenue - Based on actual payments processed this month
    const monthlyRevenue = await db.payment.aggregate({
      where: {
        status: 'COMPLETED',
        processedAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Weekly Revenue
    const weeklyRevenue = await db.payment.aggregate({
      where: {
        status: 'COMPLETED',
        processedAt: {
          gte: startOfWeek,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Pending Revenue (bookings with pending payments or pending status)
    const pendingRevenue = await db.booking.aggregate({
      where: {
        OR: [
          {
            status: 'PENDING',
          },
          {
            status: 'CONFIRMED',
            payments: {
              none: {
                status: 'COMPLETED',
              },
            },
          },
        ],
      },
      _sum: {
        totalPrice: true,
      },
    });

    // Refunded Revenue
    const refundedRevenue = await db.payment.aggregate({
      where: {
        status: 'REFUNDED',
        refundedAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Payment Statistics
    const totalPayments = await db.payment.count({});
    const completedPayments = await db.payment.count({
      where: { status: 'COMPLETED' },
    });
    const pendingPayments = await db.payment.count({
      where: { status: 'PENDING' },
    });
    const failedPayments = await db.payment.count({
      where: { status: 'FAILED' },
    });

    // Average payment value
    const averagePaymentValue = await db.payment.aggregate({
      where: {
        status: 'COMPLETED',
      },
      _avg: {
        amount: true,
      },
    });

    // Weekly Statistics
    const weeklyBookings = await db.booking.count({
      where: {
        checkIn: {
          gte: startOfWeek,
        },
      },
    });

    // Monthly Statistics
    const monthlyBookings = await db.booking.count({
      where: {
        checkIn: {
          gte: startOfMonth,
        },
      },
    });

    // Guest Statistics
    const uniqueGuests = await db.booking.findMany({
      where: {
        status: {
          in: ['CONFIRMED', 'COMPLETED'],
        },
        checkIn: {
          gte: startOfMonth,
        },
      },
      select: {
        userId: true,
      },
      distinct: ['userId'],
    });

    // Average booking value
    const averageBookingValue = await db.booking.aggregate({
      where: {
        status: 'CONFIRMED',
      },
      _avg: {
        totalPrice: true,
      },
    });

    // Room type distribution
    const roomTypeStats = await db.room.groupBy({
      by: ['type'],
      _count: {
        id: true,
      },
    });

    // Recent bookings
    const recentBookings = await db.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        room: {
          select: {
            number: true,
            type: true,
          },
        },
      },
    });

    // Recent payments
    const recentPayments = await db.payment.findMany({
      take: 5,
      orderBy: { processedAt: 'desc' },
      where: {
        status: 'COMPLETED',
      },
      include: {
        booking: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            room: {
              select: {
                number: true,
                type: true,
              },
            },
          },
        },
      },
    });

    const stats = {
      rooms: {
        total: totalRooms as number,
        available: availableRooms as number,
        occupied: occupiedRooms as number,
        maintenance: maintenanceRooms as number,
        occupancyRate: (totalRooms as number) > 0 ? (((occupiedRooms as number) / (totalRooms as number)) * 100).toFixed(1) : 0,
      },
      bookings: {
        total: totalBookings as number,
        confirmed: confirmedBookings as number,
        pending: pendingBookings as number,
        cancelled: cancelledBookings as number,
        today: todayBookings as number,
        weekly: weeklyBookings as number,
        monthly: monthlyBookings as number,
      },
      revenue: {
        today: (todayRevenue as any)?._sum?.amount || 0,
        weekly: (weeklyRevenue as any)?._sum?.amount || 0,
        monthly: (monthlyRevenue as any)?._sum?.amount || 0,
        pending: (pendingRevenue as any)?._sum?.totalPrice || 0,
        refunded: (refundedRevenue as any)?._sum?.amount || 0,
        average: (averagePaymentValue as any)?._avg?.amount || 0,
        netRevenue: ((monthlyRevenue as any)?._sum?.amount || 0) - ((refundedRevenue as any)?._sum?.amount || 0),
      },
      payments: {
        total: totalPayments as number,
        completed: completedPayments as number,
        pending: pendingPayments as number,
        failed: failedPayments as number,
        successRate: (totalPayments as number) > 0 ? (((completedPayments as number) / (totalPayments as number)) * 100).toFixed(1) : 0,
      },
      guests: {
        uniqueThisMonth: (uniqueGuests as any[]).length,
        averageStayDuration: 2.5, // This would need more complex calculation
      },
      roomTypes: (roomTypeStats as any[]).reduce((acc, stat) => {
        acc[stat.type] = stat._count.id;
        return acc;
      }, {} as { [key: string]: number }),
      recentBookings,
      recentPayments,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
} 