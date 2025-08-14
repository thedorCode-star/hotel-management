const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function testUserCRUD() {
  try {
    console.log('🧪 Testing User CRUD Operations...\n');

    // Test 1: Check if users exist
    console.log('1️⃣ Checking existing users...');
    const userCount = await prisma.user.count();
    console.log(`   Total users in database: ${userCount}`);

    if (userCount === 0) {
      console.log('   ⚠️  No users found. Please run the sample user creation script first.');
      return;
    }

    // Test 2: Get a sample user
    console.log('\n2️⃣ Getting sample user...');
    const sampleUser = await prisma.user.findFirst({
      where: { role: { not: 'ADMIN' } }
    });

    if (!sampleUser) {
      console.log('   ⚠️  No non-admin users found for testing.');
      return;
    }

    console.log(`   Sample user: ${sampleUser.name} (${sampleUser.email}) - Role: ${sampleUser.role}`);

    // Test 3: Check user profile
    console.log('\n3️⃣ Checking user profile...');
    const userWithProfile = await prisma.user.findUnique({
      where: { id: sampleUser.id },
      include: { profile: true }
    });

    if (userWithProfile.profile) {
      console.log(`   Profile found: Phone: ${userWithProfile.profile.phone || 'Not set'}, Address: ${userWithProfile.profile.address || 'Not set'}`);
    } else {
      console.log('   No profile found for this user');
    }

    // Test 4: Check user bookings
    console.log('\n4️⃣ Checking user bookings...');
    const userBookings = await prisma.booking.count({
      where: { userId: sampleUser.id }
    });
    console.log(`   Total bookings: ${userBookings}`);

    // Test 5: Check user payments
    console.log('\n5️⃣ Checking user payments...');
    const userPayments = await prisma.payment.count({
      where: { 
        booking: { userId: sampleUser.id }
      }
    });
    console.log(`   Total payments: ${userPayments}`);

    // Test 6: Check user reviews
    console.log('\n6️⃣ Checking user reviews...');
    const userReviews = await prisma.review.count({
      where: { userId: sampleUser.id }
    });
    console.log(`   Total reviews: ${userReviews}`);

    // Test 7: Role distribution
    console.log('\n7️⃣ Checking role distribution...');
    const roleDistribution = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    });

    console.log('   Role distribution:');
    roleDistribution.forEach(role => {
      console.log(`     ${role.role}: ${role._count.role} users`);
    });

    // Test 8: Active vs Inactive users
    console.log('\n8️⃣ Checking user status...');
    const activeUsers = await prisma.user.count({
      where: { isActive: true }
    });
    const inactiveUsers = await prisma.user.count({
      where: { isActive: false }
    });

    console.log(`   Active users: ${activeUsers}`);
    console.log(`   Inactive users: ${inactiveUsers}`);

    // Test 9: Recent users
    console.log('\n9️⃣ Checking recent users...');
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { name: true, email: true, role: true, createdAt: true }
    });

    console.log('   Recent users:');
    recentUsers.forEach((user, index) => {
      const daysAgo = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      console.log(`     ${index + 1}. ${user.name} (${user.role}) - ${daysAgo} days ago`);
    });

    console.log('\n✅ User CRUD test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • Total users: ${userCount}`);
    console.log(`   • Active users: ${activeUsers}`);
    console.log(`   • Users with profiles: ${await prisma.userProfile.count()}`);
    console.log(`   • Total bookings: ${await prisma.booking.count()}`);
    console.log(`   • Total payments: ${await prisma.payment.count()}`);
    console.log(`   • Total reviews: ${await prisma.review.count()}`);

  } catch (error) {
    console.error('❌ Error during user CRUD test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testUserCRUD();
