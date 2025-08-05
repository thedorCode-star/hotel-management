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
    const totalRooms = await db.room.count();
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
    const totalBookings = await db.booking.count();
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

    const todayRevenue = await db.booking.aggregate({
      where: {
        status: 'CONFIRMED',
        checkIn: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      _sum: {
        totalPrice: true,
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

    const weeklyRevenue = await db.booking.aggregate({
      where: {
        status: 'CONFIRMED',
        checkIn: {
          gte: startOfWeek,
        },
      },
      _sum: {
        totalPrice: true,
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

    const monthlyRevenue = await db.booking.aggregate({
      where: {
        status: 'CONFIRMED',
        checkIn: {
          gte: startOfMonth,
        },
      },
      _sum: {
        totalPrice: true,
      },
    });

    // Guest Statistics
    const uniqueGuests = await db.booking.groupBy({
      by: ['userId'],
      where: {
        status: {
          in: ['CONFIRMED', 'COMPLETED'],
        },
        checkIn: {
          gte: startOfMonth,
        },
      },
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

    const stats = {
      rooms: {
        total: totalRooms,
        available: availableRooms,
        occupied: occupiedRooms,
        maintenance: maintenanceRooms,
        occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0,
      },
      bookings: {
        total: totalBookings,
        confirmed: confirmedBookings,
        pending: pendingBookings,
        cancelled: cancelledBookings,
        today: todayBookings,
        weekly: weeklyBookings,
        monthly: monthlyBookings,
      },
      revenue: {
        today: todayRevenue._sum.totalPrice || 0,
        weekly: weeklyRevenue._sum.totalPrice || 0,
        monthly: monthlyRevenue._sum.totalPrice || 0,
        average: averageBookingValue._avg.totalPrice || 0,
      },
      guests: {
        uniqueThisMonth: uniqueGuests.length,
        averageStayDuration: 2.5, // This would need more complex calculation
      },
      roomTypes: roomTypeStats.reduce((acc, stat) => {
        acc[stat.type] = stat._count.id;
        return acc;
      }, {} as { [key: string]: number }),
      recentBookings,
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