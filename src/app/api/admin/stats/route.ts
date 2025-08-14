import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get comprehensive real-time statistics
    const [
      totalUsers,
      totalRooms,
      totalBookings,
      totalPayments,
      totalRevenue,
      activeBookings,
      pendingPayments,
      pendingRefunds,
      todayBookings,
      todayRevenue,
      monthlyRevenue,
      yearlyRevenue,
      roomOccupancy,
      averageBookingValue,
      topPerformingRooms,
      recentActivity
    ] = await Promise.all([
      // User statistics
      prisma.user.count(),
      
      // Room statistics
      prisma.room.count(),
      
      // Booking statistics
      prisma.booking.count(),
      
      // Payment statistics
      prisma.payment.count(),
      
      // Revenue calculations
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      
      // Active bookings (checked in or paid)
      prisma.booking.count({
        where: {
          status: {
            in: ['CHECKED_IN', 'PAID'],
          },
        },
      }),
      
      // Pending payments
      prisma.payment.count({
        where: { status: 'PENDING' },
      }),
      
      // Pending refunds
      prisma.refund.count({
        where: { status: 'PENDING' },
      }),
      
      // Today's bookings
      prisma.booking.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      
      // Today's revenue
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        _sum: { amount: true },
      }),
      
      // Monthly revenue
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { amount: true },
      }),
      
      // Yearly revenue
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(new Date().getFullYear(), 0, 1),
          },
        },
        _sum: { amount: true },
      }),
      
      // Room occupancy rate
      prisma.room.aggregate({
        where: { status: 'OCCUPIED' },
        _count: { id: true },
      }),
      
      // Average booking value
      prisma.booking.aggregate({
        _avg: { totalPrice: true },
      }),
      
      // Top performing rooms (by revenue)
      prisma.room.findMany({
        select: {
          id: true,
          number: true,
          type: true,
          price: true,
          status: true,
          _count: {
            select: { bookings: true }
          }
        },
        orderBy: {
          bookings: {
            _count: 'desc'
          }
        },
        take: 5
      }),
      
      // Recent activity (last 7 days)
      prisma.booking.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          id: true,
          createdAt: true,
          status: true,
          totalPrice: true,
          user: {
            select: { name: true, email: true }
          },
          room: {
            select: { number: true, type: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    // Get role distribution
    const roleDistribution = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });

    // Get room status distribution
    const roomStatusDistribution = await prisma.room.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    // Get booking status distribution
    const bookingStatusDistribution = await prisma.booking.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    // Get payment status distribution
    const paymentStatusDistribution = await prisma.payment.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    // Calculate additional metrics
    const occupancyRate = totalRooms > 0 ? (roomOccupancy._count.id / totalRooms) * 100 : 0;
    const averageBooking = averageBookingValue._avg.totalPrice || 0;
    const todayRevenueValue = todayRevenue._sum.amount || 0;
    const monthlyRevenueValue = monthlyRevenue._sum.amount || 0;
    const yearlyRevenueValue = yearlyRevenue._sum.amount || 0;

    const stats = {
      overview: {
        totalUsers,
        totalRooms,
        totalBookings,
        totalPayments,
        totalRevenue: totalRevenue._sum.amount || 0,
        activeBookings,
        pendingPayments,
        pendingRefunds,
        todayBookings,
        todayRevenue: todayRevenueValue,
        monthlyRevenue: monthlyRevenueValue,
        yearlyRevenue: yearlyRevenueValue,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        averageBookingValue: Math.round(averageBooking * 100) / 100
      },
      roleDistribution: roleDistribution.map(role => ({
        role: role.role,
        count: role._count.role,
      })),
      roomStatusDistribution: roomStatusDistribution.map(status => ({
        status: status.status,
        count: status._count.status,
      })),
      bookingStatusDistribution: bookingStatusDistribution.map(status => ({
        status: status.status,
        count: status._count.status,
      })),
      paymentStatusDistribution: paymentStatusDistribution.map(status => ({
        status: status.status,
        count: status._count.status,
      })),
      topPerformingRooms: topPerformingRooms.map(room => ({
        id: room.id,
        number: room.number,
        type: room.type,
        price: room.price,
        status: room.status,
        bookingCount: room._count.bookings
      })),
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        type: 'booking',
        status: activity.status,
        amount: activity.totalPrice,
        date: activity.createdAt,
        user: activity.user.name,
        room: `Room ${activity.room.number} (${activity.room.type})`
      }))
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { message: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
