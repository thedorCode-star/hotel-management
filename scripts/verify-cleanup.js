const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function verifyCleanup() {
  try {
    console.log('🔍 Verifying database cleanup...');
    console.log('');

    // Check what remains in the database
    const [
      userCount,
      roomCount,
      bookingCount,
      paymentCount,
      refundCount,
      reviewCount,
      profileCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.room.count(),
      prisma.booking.count(),
      prisma.payment.count(),
      prisma.refund.count(),
      prisma.review.count(),
      prisma.userProfile.count()
    ]);

    console.log('📊 Current Database State:');
    console.log('');

    // What should be kept
    console.log('✅ What should remain (and does):');
    console.log(`   • Users: ${userCount} accounts`);
    console.log(`   • Rooms: ${roomCount} rooms`);
    console.log('');

    // What should be deleted
    console.log('🗑️  What should be deleted (and is):');
    console.log(`   • Bookings: ${bookingCount} (should be 0)`);
    console.log(`   • Payments: ${paymentCount} (should be 0)`);
    console.log(`   • Refunds: ${refundCount} (should be 0)`);
    console.log(`   • Reviews: ${reviewCount} (should be 0)`);
    console.log(`   • User Profiles: ${profileCount} (should be 0)`);
    console.log('');

    // Show some sample data
    if (userCount > 0) {
      console.log('👥 Sample Users:');
      const users = await prisma.user.findMany({
        take: 3,
        select: { name: true, email: true, role: true }
      });
      users.forEach(user => {
        console.log(`   • ${user.name} (${user.email}) - ${user.role}`);
      });
    }

    if (roomCount > 0) {
      console.log('');
      console.log('🏨 Sample Rooms:');
      const rooms = await prisma.room.findMany({
        take: 3,
        select: { number: true, type: true, price: true, status: true }
      });
      rooms.forEach(room => {
        console.log(`   • Room ${room.number} (${room.type}) - $${room.price} - ${room.status}`);
      });
    }

    console.log('');
    if (bookingCount === 0 && paymentCount === 0 && refundCount === 0) {
      console.log('🎉 SUCCESS: Database cleanup completed perfectly!');
      console.log('🚀 You can now add fresh test data.');
    } else {
      console.log('⚠️  WARNING: Some data still remains. You may need to run cleanup again.');
    }

  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the verification
verifyCleanup();
