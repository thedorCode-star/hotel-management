import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get comprehensive financial data
    const [
      totalRevenue,
      todayRevenue,
      monthlyRevenue,
      yearlyRevenue,
      pendingPayments,
      completedPayments,
      failedPayments,
      totalRefunds,
      pendingRefunds,
      completedRefunds,
      averageBookingValue,
      topRevenueRooms,
      revenueByMonth,
      paymentMethods
    ] = await Promise.all([
      // Total revenue (all time)
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
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
      
      // Pending payments
      prisma.payment.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      
      // Completed payments
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      
      // Failed payments
      prisma.payment.aggregate({
        where: { status: 'FAILED' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      
      // Total refunds (ALL refunds regardless of status for financial impact)
      prisma.refund.aggregate({
        where: {},
        _sum: { amount: true },
        _count: { id: true },
      }),
      
      // Pending refunds
      prisma.refund.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      
      // Completed refunds
      prisma.refund.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      
      // Average booking value
      prisma.booking.aggregate({
        _avg: { totalPrice: true },
        _count: { id: true },
      }),
      
      // Top revenue rooms
      prisma.room.findMany({
        select: {
          id: true,
          number: true,
          type: true,
          price: true,
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
      
      // Revenue by month (last 12 months)
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          SUM(amount) as revenue,
          COUNT(*) as payment_count
        FROM "Payment" 
        WHERE status = 'COMPLETED' 
        AND "createdAt" >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month DESC
      `,
      
      // Payment methods distribution
      prisma.payment.groupBy({
        by: ['paymentMethod'],
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
        _count: { id: true },
      })
    ]);

    // Calculate additional metrics
    // Net revenue = Total revenue - Total refunds (including pending)
    const netRevenue = Number(totalRevenue._sum.amount || 0) - Number(totalRefunds._sum.amount || 0);
    const profitMargin = Number(totalRevenue._sum.amount || 0) > 0 ? 
      ((netRevenue / Number(totalRevenue._sum.amount || 0)) * 100) : 0;

    // Debug logging for financial calculations
    console.log('🔍 FINANCIAL DEBUG:', {
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      totalRefunds: Number(totalRefunds._sum.amount || 0),
      netRevenue,
      profitMargin,
      refundCount: Number(totalRefunds._count.id || 0)
    });

    const financialOverview = {
      revenue: {
        total: Number(totalRevenue._sum.amount || 0),
        today: Number(todayRevenue._sum.amount || 0),
        monthly: Number(monthlyRevenue._sum.amount || 0),
        yearly: Number(yearlyRevenue._sum.amount || 0),
        net: netRevenue,
        profitMargin: Math.round(profitMargin * 100) / 100
      },
      payments: {
        pending: {
          amount: Number(pendingPayments._sum.amount || 0),
          count: Number(pendingPayments._count.id || 0)
        },
        completed: {
          amount: Number(completedPayments._sum.amount || 0),
          count: Number(completedPayments._count.id || 0)
        },
        failed: {
          amount: Number(failedPayments._sum.amount || 0),
          count: Number(failedPayments._count.id || 0)
        }
      },
      refunds: {
        total: {
          amount: Number(totalRefunds._sum.amount || 0),
          count: Number(totalRefunds._count.id || 0)
        },
        pending: {
          amount: Number(pendingRefunds._sum.amount || 0),
          count: Number(pendingRefunds._count.id || 0)
        },
        completed: {
          amount: Number(completedRefunds._sum.amount || 0),
          count: Number(completedRefunds._count.id || 0)
        }
      },
      analytics: {
        averageBookingValue: Math.round((Number(averageBookingValue._avg.totalPrice || 0)) * 100) / 100,
        totalBookings: Number(averageBookingValue._count.id || 0),
        topRevenueRooms: topRevenueRooms.map(room => ({
          id: room.id,
          number: room.number,
          type: room.type,
          price: Number(room.price),
          bookingCount: Number(room._count.bookings),
          estimatedRevenue: Number(room.price) * Number(room._count.bookings)
        })),
        revenueByMonth: Array.isArray(revenueByMonth) ? revenueByMonth.map((item: any) => ({
          month: item.month,
          revenue: Number(item.revenue || 0),
          paymentCount: Number(item.payment_count || 0)
        })) : [],
        paymentMethods: paymentMethods.map(method => ({
          method: method.paymentMethod,
          amount: Number(method._sum.amount || 0),
          count: Number(method._count.id || 0)
        }))
      }
    };

    return NextResponse.json(financialOverview);
  } catch (error) {
    console.error('Error fetching financial overview:', error);
    return NextResponse.json(
      { message: 'Failed to fetch financial overview' },
      { status: 500 }
    );
  }
}
