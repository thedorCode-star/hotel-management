const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function checkDatabaseState() {
  try {
    console.log('🔍 Checking database state...\n');

    // Check users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
            reviews: true
          }
        }
      }
    });
    
    console.log(`👥 Users: ${users.length}`);
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
      console.log(`     Bookings: ${user._count.bookings}, Reviews: ${user._count.reviews}`);
    });

    // Check rooms
    const rooms = await prisma.room.findMany({
      select: {
        id: true,
        number: true,
        type: true,
        price: true,
        status: true,
        _count: {
          select: {
            bookings: true,
            reviews: true
          }
        }
      }
    });
    
    console.log(`\n🏠 Rooms: ${rooms.length}`);
    rooms.forEach(room => {
      console.log(`   - Room ${room.number} (${room.type}) - $${room.price} - ${room.status}`);
      console.log(`     Bookings: ${room._count.bookings}, Reviews: ${room._count.reviews}`);
    });

    // Check bookings
    const bookings = await prisma.booking.findMany({
      select: {
        id: true,
        status: true,
        totalPrice: true,
        paidAmount: true,
        refundAmount: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        room: { select: { number: true } }
      }
    });
    
    console.log(`\n📅 Bookings: ${bookings.length}`);
    bookings.forEach(booking => {
      console.log(`   - ${booking.user.name} - Room ${booking.room.number} - ${booking.status}`);
      console.log(`     Total: $${booking.totalPrice}, Paid: $${booking.paidAmount}, Refunded: $${booking.refundAmount}`);
    });

    // Check payments
    const payments = await prisma.payment.findMany({
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        booking: {
          select: {
            user: { select: { name: true } },
            room: { select: { number: true } }
          }
        }
      }
    });
    
    console.log(`\n💳 Payments: ${payments.length}`);
    payments.forEach(payment => {
      console.log(`   - $${payment.amount} - ${payment.status} - ${payment.booking.user.name} - Room ${payment.booking.room.number}`);
    });

    // Check refunds
    const refunds = await prisma.refund.findMany({
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        booking: {
          select: {
            user: { select: { name: true } },
            room: { select: { number: true } }
          }
        }
      }
    });
    
    console.log(`\n💰 Refunds: ${refunds.length}`);
    refunds.forEach(refund => {
      console.log(`   - $${refund.amount} - ${refund.status} - ${refund.booking.user.name} - Room ${refund.booking.room.number}`);
    });

    // Check reviews
    const reviews = await prisma.review.findMany({
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: { select: { name: true } },
        room: { select: { number: true } }
      }
    });
    
    console.log(`\n⭐ Reviews: ${reviews.length}`);
    reviews.forEach(review => {
      console.log(`   - ${review.rating}★ by ${review.user.name} for Room ${review.room.number}`);
      if (review.comment) console.log(`     "${review.comment}"`);
    });

    console.log('\n✅ Database state check completed!');

  } catch (error) {
    console.error('❌ Error checking database state:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseState();
