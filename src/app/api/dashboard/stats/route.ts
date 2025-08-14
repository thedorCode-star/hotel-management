import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../../lib/build-safe-db';

export async function GET(request: NextRequest) {
  try {
    const db = getBuildSafeDatabase();
    
    // Get comprehensive stats with real calculations
    const [
      totalRooms,
      totalBookings,
      totalPayments,
      availableRooms,
      occupiedRooms,
      confirmedBookings,
      pendingBookings,
      activeBookings, // NEW: Currently checked-in bookings
      todayBookings,
      monthlyBookings,
      completedPayments,
      failedPayments,
      todayRevenue,
      monthlyRevenue,
      totalRefunds
    ] = await Promise.all([
      db.room.count({}),
      db.booking.count({}),
      db.payment.count({}),
      db.room.count({ where: { status: 'AVAILABLE' } }),
      db.room.count({ where: { status: 'OCCUPIED' } }),
      db.booking.count({ where: { status: 'PAID' } }),
      db.booking.count({ where: { status: 'PENDING' } }),
      db.booking.count({ where: { status: 'CHECKED_IN' } }), // NEW: Active bookings
      db.booking.count({ 
        where: { 
          checkIn: { 
            gte: new Date(new Date().setHours(0, 0, 0, 0)) 
          } 
        } 
      }),
      db.booking.count({ 
        where: { 
          createdAt: { 
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
          } 
        } 
      }),
      db.payment.count({ where: { status: 'COMPLETED' } }),
      db.payment.count({ where: { status: 'FAILED' } }),
      db.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        },
        _sum: { amount: true }
      }),
      db.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        },
        _sum: { amount: true }
      }),
      db.refund.aggregate({
        where: {}, // ALL refunds for financial impact calculation
        _sum: { amount: true }
      })
    ]);

    // Calculate derived metrics
    const occupancyRate = (totalRooms as number) > 0 ? (((occupiedRooms as number) / (totalRooms as number)) * 100).toFixed(1) : "0.0";
    const successRate = (totalPayments as number) > 0 ? (((completedPayments as number) / (totalPayments as number)) * 100).toFixed(1) : "0.0";
    
    const stats = {
      rooms: {
        total: totalRooms,
        available: availableRooms,
        occupied: occupiedRooms,
        occupancyRate: occupancyRate,
      },
      bookings: {
        total: totalBookings,
        confirmed: confirmedBookings,
        pending: pendingBookings,
        active: activeBookings, // NEW: Currently checked-in bookings
        today: todayBookings,
        monthly: monthlyBookings,
      },
      revenue: {
        actual: {
          today: Number((todayRevenue as any)._sum.amount || 0),
          monthly: Number((monthlyRevenue as any)._sum.amount || 0),
        },
        net: {
          today: Number((todayRevenue as any)._sum.amount || 0),
          monthly: Number((todayRevenue as any)._sum.amount || 0),
        },
        refunds: {
          total: Number((totalRefunds as any)._sum.amount || 0), // Total refund impact
          today: Number((totalRefunds as any)._sum.amount || 0),
          monthly: Number((totalRefunds as any)._sum.amount || 0),
        },
      },
      payments: {
        total: totalPayments,
        completed: completedPayments,
        successRate: successRate,
      },
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 