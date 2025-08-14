import { NextRequest, NextResponse } from 'next/server';
import { getBuildSafeDatabase } from '../../../../lib/build-safe-db';

export async function GET(request: NextRequest) {
  try {
    const db = getBuildSafeDatabase();
    
    // Get user from headers (set by middleware)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    // Check if user is authenticated and is admin
    if (!userId || userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get date ranges for analytics
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // **Payment Trends Analysis**
    
    // Daily payment trends for the last 30 days
    const dailyPayments = await db.payment.findMany({
      where: {
        status: 'COMPLETED',
        processedAt: {
          gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        amount: true,
        processedAt: true,
        paymentMethod: true,
      },
      orderBy: {
        processedAt: 'asc',
      },
    });

    // Monthly revenue for the last 12 months
    const monthlyRevenue = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
      
      const monthData = await db.payment.aggregate({
        where: {
          status: 'COMPLETED',
          processedAt: {
            gte: monthStart,
            lt: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
      });
      
      monthlyRevenue.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: (monthData as any)?._sum?.amount || 0,
        transactions: (monthData as any)?._count?.id || 0,
      });
    }

    // **Customer Insights**
    
    // Top customers by total spent
    const topCustomers = await db.payment.findMany({
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
          },
        },
      },
      orderBy: {
        amount: 'desc',
      },
      take: 10,
    });

    // **Payment Method Analysis**
    // Fixed: Use findMany and manual grouping instead of groupBy
    const allPayments = await db.payment.findMany({
      where: { status: 'COMPLETED' },
      select: {
        paymentMethod: true,
        amount: true,
      },
    }) as any[];

    // Manual grouping for payment methods
    const paymentMethodMap = new Map();
    allPayments.forEach((payment: any) => {
      const method = payment.paymentMethod;
      if (!paymentMethodMap.has(method)) {
        paymentMethodMap.set(method, {
          method,
          totalAmount: 0,
          transactionCount: 0,
        });
      }
      const stats = paymentMethodMap.get(method);
      stats.totalAmount += payment.amount;
      stats.transactionCount += 1;
    });

    const paymentMethodStats = Array.from(paymentMethodMap.values());

    // **Room Performance Analysis**
    // Fixed: Get all confirmed bookings with room details
    const confirmedBookings = await db.booking.findMany({
      where: { status: 'CONFIRMED' },
      include: {
        room: {
          select: { id: true, number: true, type: true, price: true }
        }
      }
    }) as any[];

    // Manual grouping by room
    const roomPerformanceMap = new Map();
    confirmedBookings.forEach((booking: any) => {
      const roomId = booking.roomId;
      if (!roomPerformanceMap.has(roomId)) {
        roomPerformanceMap.set(roomId, {
          roomId,
          roomNumber: booking.room.number,
          roomType: booking.room.type,
          totalRevenue: 0,
          bookingCount: 0,
        });
      }
      const roomStats = roomPerformanceMap.get(roomId);
      roomStats.totalRevenue += booking.totalPrice;
      roomStats.bookingCount += 1;
    });

    const roomPerformance = Array.from(roomPerformanceMap.values()).map((room: any) => ({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      totalRevenue: room.totalRevenue,
      bookingCount: room.bookingCount,
      averageRevenue: room.bookingCount > 0 ? room.totalRevenue / room.bookingCount : 0,
    }));

    // **Revenue Growth Analysis**
    const currentMonthRevenue = await db.payment.aggregate({
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

    const lastMonthRevenue = await db.payment.aggregate({
      where: {
        status: 'COMPLETED',
        processedAt: {
          gte: new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() - 1, 1),
          lt: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Fixed: Added type casting for aggregate results
    const revenueGrowth = (lastMonthRevenue as any)?._sum?.amount 
      ? (((currentMonthRevenue as any)?._sum?.amount || 0) - ((lastMonthRevenue as any)?._sum?.amount || 0)) / ((lastMonthRevenue as any)?._sum?.amount || 1) * 100
      : 0;

    // **Payment Success Rate Trends**
    const totalPaymentsThisMonth = await db.payment.count({
      where: {
        processedAt: {
          gte: startOfMonth,
        },
      },
    }) as number;

    const successfulPaymentsThisMonth = await db.payment.count({
      where: {
        status: 'COMPLETED',
        processedAt: {
          gte: startOfMonth,
        },
      },
    }) as number;

    const paymentSuccessRate = totalPaymentsThisMonth > 0 
      ? (successfulPaymentsThisMonth / totalPaymentsThisMonth) * 100 
      : 0;

    // **Refund Analysis**
    const refundStats = await db.payment.aggregate({
      where: {
        status: 'REFUNDED',
        refundedAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Fixed: Calculate percentages on backend
    const totalPaymentAmount = paymentMethodStats.reduce((sum: number, stat: any) => 
      sum + (stat.totalAmount || 0), 0);
    const paymentMethodsWithPercentage = paymentMethodStats.map((stat: any) => ({
      method: stat.method,
      totalAmount: stat.totalAmount || 0,
      transactionCount: stat.transactionCount,
      percentage: totalPaymentAmount > 0 ? ((stat.totalAmount || 0) / totalPaymentAmount) * 100 : 0,
    }));

    const analytics = {
      // Payment Trends
      dailyPayments: (dailyPayments as any[]).map((payment: any) => ({
        date: payment.processedAt.toISOString().split('T')[0],
        amount: payment.amount,
        method: payment.paymentMethod,
      })),
      
      monthlyRevenue,
      
      // Customer Insights
      topCustomers: (topCustomers as any[]).map((payment: any) => ({
        customerName: payment.booking.user.name,
        customerEmail: payment.booking.user.email,
        totalSpent: payment.amount,
        transactionCount: 1, // This would need aggregation for multiple transactions per customer
      })),
      
      // Payment Method Analysis
      paymentMethods: paymentMethodsWithPercentage,
      
      // Room Performance
      roomPerformance,
      
      // Growth Metrics
      growth: {
        revenueGrowth: revenueGrowth.toFixed(2),
        paymentSuccessRate: paymentSuccessRate.toFixed(2),
        currentMonthRevenue: (currentMonthRevenue as any)?._sum?.amount || 0,
        lastMonthRevenue: (lastMonthRevenue as any)?._sum?.amount || 0,
      },
      
      // Refund Analysis
      refunds: {
        totalRefunded: (refundStats as any)?._sum?.amount || 0,
        refundCount: (refundStats as any)?._count?.id || 0,
        refundRate: totalPaymentsThisMonth > 0 
          ? (((refundStats as any)?._count?.id || 0) / totalPaymentsThisMonth) * 100 
          : 0,
      },
      
      // Summary Statistics
      summary: {
        totalRevenue: (currentMonthRevenue as any)?._sum?.amount || 0,
        totalTransactions: totalPaymentsThisMonth,
        averageTransactionValue: totalPaymentsThisMonth > 0 
          ? ((currentMonthRevenue as any)?._sum?.amount || 0) / totalPaymentsThisMonth 
          : 0,
        uniqueCustomers: new Set((topCustomers as any[]).map((p: any) => p.booking.user.email)).size,
      },
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Error fetching payment analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment analytics' },
      { status: 500 }
    );
  }
} 