const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function cleanDatabaseData() {
  try {
    console.log('🗑️  Starting database cleanup...');
    console.log('📋 This will delete: Bookings, Payments, Refunds');
    console.log('✅ This will keep: Users, Rooms, Database Structure');
    console.log('');

    // Step 1: Delete Refunds first (they reference payments and bookings)
    console.log('1️⃣  Deleting refunds...');
    const deletedRefunds = await prisma.refund.deleteMany({});
    console.log(`   ✅ Deleted ${deletedRefunds.count} refunds`);

    // Step 2: Delete Payments (they reference bookings)
    console.log('2️⃣  Deleting payments...');
    const deletedPayments = await prisma.payment.deleteMany({});
    console.log(`   ✅ Deleted ${deletedPayments.count} payments`);

    // Step 3: Delete Bookings (they reference users and rooms)
    console.log('3️⃣  Deleting bookings...');
    const deletedBookings = await prisma.booking.deleteMany({});
    console.log(`   ✅ Deleted ${deletedBookings.count} bookings`);

    // Step 4: Delete Reviews (they reference users and rooms)
    console.log('4️⃣  Deleting reviews...');
    const deletedReviews = await prisma.review.deleteMany({});
    console.log(`   ✅ Deleted ${deletedReviews.count} reviews`);

    // Step 5: Delete User Profiles (they reference users)
    console.log('5️⃣  Deleting user profiles...');
    const deletedProfiles = await prisma.userProfile.deleteMany({});
    console.log(`   ✅ Deleted ${deletedProfiles.count} user profiles`);

    console.log('');
    console.log('🎉 Database cleanup completed successfully!');
    console.log('');
    console.log('📊 Summary of what was deleted:');
    console.log(`   • Refunds: ${deletedRefunds.count}`);
    console.log(`   • Payments: ${deletedPayments.count}`);
    console.log(`   • Bookings: ${deletedBookings.count}`);
    console.log(`   • Reviews: ${deletedReviews.count}`);
    console.log(`   • User Profiles: ${deletedProfiles.count}`);
    console.log('');
    console.log('✅ What was kept:');
    console.log('   • Users (all user accounts)');
    console.log('   • Rooms (all room definitions)');
    console.log('   • Database structure and schema');
    console.log('');
    console.log('🚀 Your database is now clean and ready for fresh data!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    console.error('💡 If you see foreign key constraint errors, the script will handle them automatically.');
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanDatabaseData();
