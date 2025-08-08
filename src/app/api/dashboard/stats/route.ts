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

    // Auto-complete bookings where check-out date has passed
    await autoCompleteBookings(db, today);

    // Fix room status for completed payments
    await fixRoomStatusForCompletedPayments(db);

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
    const paidBookings = await db.booking.count({
      where: { status: 'PAID' },
    });
    const pendingBookings = await db.booking.count({
      where: { status: 'PENDING' },
    });
    const cancelledBookings = await db.booking.count({
      where: { status: 'CANCELLED' },
    });
    const checkedInBookings = await db.booking.count({
      where: { status: 'CHECKED_IN' },
    });
    const completedBookings = await db.booking.count({
      where: { status: 'COMPLETED' },
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

    // **COMPREHENSIVE REVENUE CALCULATIONS**
    
    // 1. Today's Revenue - Based on actual payments processed today
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

    // 2. Revenue from guests checking in today
    const checkInRevenue = await db.booking.aggregate({
      where: {
        checkIn: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
        status: {
          in: ['PAID', 'CHECKED_IN', 'COMPLETED']
        }
      },
      _sum: {
        totalPrice: true,
      },
    });

    // 3. Revenue from guests staying today (check-in <= today <= check-out)
    const stayingTodayRevenue = await db.booking.aggregate({
      where: {
        checkIn: {
          lte: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
        checkOut: {
          gt: today,
        },
        status: {
          in: ['PAID', 'CHECKED_IN', 'COMPLETED']
        }
      },
      _sum: {
        totalPrice: true,
      },
    });

    // 4. Revenue from bookings made today
    const bookingsMadeTodayRevenue = await db.booking.aggregate({
      where: {
        createdAt: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
        status: {
          in: ['PAID', 'CHECKED_IN', 'COMPLETED']
        }
      },
      _sum: {
        totalPrice: true,
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
            status: 'PAID',
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

    // Net Revenue (Completed payments - Refunds)
    const netRevenue = ((monthlyRevenue as any)?._sum?.amount || 0) - ((refundedRevenue as any)?._sum?.amount || 0);

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
          in: ['PAID', 'COMPLETED', 'CHECKED_IN'],
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
        status: 'PAID',
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
        confirmed: paidBookings as number,
        pending: pendingBookings as number,
        cancelled: cancelledBookings as number,
        today: todayBookings as number,
        weekly: weeklyBookings as number,
        monthly: monthlyBookings as number,
      },
      revenue: {
        today: (todayRevenue as any)?._sum?.amount || 0,
        checkInToday: (checkInRevenue as any)?._sum?.totalPrice || 0,
        stayingToday: (stayingTodayRevenue as any)?._sum?.totalPrice || 0,
        bookingsMadeToday: (bookingsMadeTodayRevenue as any)?._sum?.totalPrice || 0,
        weekly: (weeklyRevenue as any)?._sum?.amount || 0,
        monthly: (monthlyRevenue as any)?._sum?.amount || 0,
        pending: (pendingRevenue as any)?._sum?.totalPrice || 0,
        refunded: (refundedRevenue as any)?._sum?.amount || 0,
        average: (averagePaymentValue as any)?._avg?.amount || 0,
        netRevenue: netRevenue,
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
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

// Function to automatically complete bookings where check-out date has passed
async function autoCompleteBookings(db: any, today: Date) {
  try {
    // Find all paid bookings where check-out date has passed
    const expiredBookings = await db.booking.findMany({
      where: {
        status: 'PAID',
        checkOut: {
          lt: today,
        },
      },
      include: {
        room: {
          select: { id: true, number: true }
        }
      }
    });

    // Update each expired booking to COMPLETED and make room AVAILABLE
    for (const booking of expiredBookings) {
      try {
        // Update booking status to COMPLETED
        await db.booking.update({
          where: { id: booking.id },
          data: { status: 'COMPLETED' }
        });

        // Update room status to AVAILABLE
        if (booking.room) {
          await db.room.update({
            where: { id: booking.room.id },
            data: { status: 'AVAILABLE' }
          });
          console.log(`✅ Auto-completed booking ${booking.id} - Room ${booking.room.number} now AVAILABLE`);
        }
      } catch (bookingError) {
        console.error(`❌ Error auto-completing booking ${booking.id}:`, bookingError);
      }
    }

    if (expiredBookings.length > 0) {
      console.log(`🔄 Auto-completed ${expiredBookings.length} bookings`);
    }
  } catch (error) {
    console.error('Error in autoCompleteBookings:', error);
  }
}

// Function to fix room status for completed payments
async function fixRoomStatusForCompletedPayments(db: any) {
  try {
    console.log('🔧 Checking for rooms with incorrect status...');
    
    // Specific fix for Room A06
    const roomA06 = await db.room.findFirst({
      where: {
        number: 'A06'
      },
      include: {
        bookings: {
          where: {
            status: 'PAID'
          },
          include: {
            payments: {
              where: {
                status: 'COMPLETED'
              }
            }
          }
        }
      }
    });

    if (roomA06 && roomA06.status === 'RESERVED') {
      const hasCompletedPayment = (roomA06.bookings as any[]).some((booking: any) => 
        (booking.payments as any[]).length > 0
      );

      if (hasCompletedPayment) {
        await db.room.update({
          where: { id: roomA06.id },
          data: { status: 'OCCUPIED' }
        });
        console.log(`✅ Fixed Room A06 status from RESERVED to OCCUPIED`);
      } else {
        console.log(`ℹ️ Room A06 has no completed payments, keeping as RESERVED`);
      }
    }
    
    // Find all rooms that are RESERVED but have paid bookings
    const reservedRooms = await db.room.findMany({
      where: {
        status: 'RESERVED'
      },
      include: {
        bookings: {
          where: {
            status: 'PAID'
          },
          include: {
            payments: {
              where: {
                status: 'COMPLETED'
              }
            }
          }
        }
      }
    });

    console.log(`Found ${reservedRooms.length} reserved rooms to check`);

    // Update room status for rooms with completed payments
    for (const room of reservedRooms) {
      console.log(`Checking Room ${room.number}...`);
      
      const hasCompletedPayment = (room.bookings as any[]).some((booking: any) => 
        (booking.payments as any[]).length > 0
      );

      if (hasCompletedPayment) {
        await db.room.update({
          where: { id: room.id },
          data: { status: 'OCCUPIED' }
        });
        console.log(`✅ Fixed Room ${room.number} status from RESERVED to OCCUPIED`);
      } else {
        console.log(`ℹ️ Room ${room.number} has no completed payments, keeping as RESERVED`);
      }
    }

    // Also check for rooms that should be AVAILABLE (no active bookings)
    const occupiedRooms = await db.room.findMany({
      where: {
        status: 'OCCUPIED'
      },
      include: {
        bookings: {
          where: {
            status: {
              in: ['PAID', 'PENDING', 'CHECKED_IN']
            }
          }
        }
      }
    });

    console.log(`Found ${occupiedRooms.length} occupied rooms to check`);

    for (const room of occupiedRooms) {
      const hasActiveBookings = (room.bookings as any[]).length > 0;
      
      if (!hasActiveBookings) {
        await db.room.update({
          where: { id: room.id },
          data: { status: 'AVAILABLE' }
        });
        console.log(`✅ Fixed Room ${room.number} status from OCCUPIED to AVAILABLE`);
      }
    }

    console.log('🔧 Room status fix completed');
  } catch (error) {
    console.error('Error in fixRoomStatusForCompletedPayments:', error);
  }
} 