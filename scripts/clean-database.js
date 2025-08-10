const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    console.log('🧹 Starting database cleanup...\n');
    console.log('⚠️  WARNING: This will delete ALL data except rooms!');
    console.log('📋 Data to be deleted:');
    console.log('   - Users');
    console.log('   - Bookings');
    console.log('   - Payments');
    console.log('   - Refunds');
    console.log('   - Reviews');
    console.log('   - Any other related data');
    console.log('\n✅ Data to be preserved:');
    console.log('   - Rooms (all 13 rooms will remain)');
    console.log('   - Room types and configurations');
    console.log('   - Database schema and structure\n');

    // Count current data
    const userCount = await prisma.user.count();
    const bookingCount = await prisma.booking.count();
    const paymentCount = await prisma.payment.count();
    const refundCount = await prisma.refund.count();
    const reviewCount = await prisma.review.count();
    const roomCount = await prisma.room.count();

    console.log(`📊 Current data counts:`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Bookings: ${bookingCount}`);
    console.log(`   Payments: ${paymentCount}`);
    console.log(`   Refunds: ${refundCount}`);
    console.log(`   Reviews: ${reviewCount}`);
    console.log(`   Rooms: ${roomCount} (will be preserved)\n`);

    // Confirm deletion
    console.log('🚨 Are you sure you want to proceed? (y/N)');
    console.log('   This action cannot be undone!');
    
    // For safety, we'll require manual confirmation
    console.log('\n🔒 To proceed, please manually edit this script and set:');
    console.log('   const CONFIRM_DELETION = true;');
    console.log('   Then run the script again.\n');
    
    const CONFIRM_DELETION = false; // Change to true to confirm
    
    if (!CONFIRM_DELETION) {
      console.log('❌ Deletion cancelled. No data was modified.');
      return;
    }

    console.log('🗑️  Starting deletion process...\n');

    // Delete in correct order to respect foreign key constraints
    console.log('1. Deleting refunds...');
    const deletedRefunds = await prisma.refund.deleteMany({});
    console.log(`   ✅ Deleted ${deletedRefunds.count} refunds`);

    console.log('2. Deleting payments...');
    const deletedPayments = await prisma.payment.deleteMany({});
    console.log(`   ✅ Deleted ${deletedPayments.count} payments`);

    console.log('3. Deleting reviews...');
    const deletedReviews = await prisma.review.deleteMany({});
    console.log(`   ✅ Deleted ${deletedReviews.count} reviews`);

    console.log('4. Deleting bookings...');
    const deletedBookings = await prisma.booking.deleteMany({});
    console.log(`   ✅ Deleted ${deletedBookings.count} bookings`);

    console.log('5. Deleting users...');
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`   ✅ Deleted ${deletedUsers.count} users`);

    // Verify final state
    const finalRoomCount = await prisma.room.count();
    const finalUserCount = await prisma.user.count();
    const finalBookingCount = await prisma.booking.count();
    const finalPaymentCount = await prisma.payment.count();
    const finalRefundCount = await prisma.refund.count();
    const finalReviewCount = await prisma.review.count();

    console.log('\n🎉 Database cleanup completed!');
    console.log('\n📊 Final data counts:');
    console.log(`   Users: ${finalUserCount}`);
    console.log(`   Bookings: ${finalBookingCount}`);
    console.log(`   Payments: ${finalPaymentCount}`);
    console.log(`   Refunds: ${finalRefundCount}`);
    console.log(`   Reviews: ${finalReviewCount}`);
    console.log(`   Rooms: ${finalRoomCount} ✅ (preserved)`);

    console.log('\n✨ You now have a clean database with only rooms!');
    console.log('   You can start fresh with new bookings and monitor everything correctly.');

  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    console.log('\n🔄 If there was an error, the database may be in an inconsistent state.');
    console.log('   Please check the error details above.');
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
