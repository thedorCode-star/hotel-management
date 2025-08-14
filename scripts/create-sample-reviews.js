const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function createSampleReviews() {
  try {
    console.log('🌟 Creating sample reviews...');

    // First, let's check if we have users and rooms
    const users = await prisma.user.findMany({
      take: 5,
      select: { id: true, name: true, role: true }
    });

    const rooms = await prisma.room.findMany({
      take: 5,
      select: { id: true, number: true, type: true }
    });

    if (users.length === 0) {
      console.log('❌ No users found. Please create some users first.');
      return;
    }

    if (rooms.length === 0) {
      console.log('❌ No rooms found. Please create some rooms first.');
      return;
    }

    console.log(`✅ Found ${users.length} users and ${rooms.length} rooms`);

    // Sample review data
    const sampleReviews = [
      {
        rating: 5,
        comment: "Absolutely fantastic stay! The room was spotless, staff was incredibly friendly, and the location was perfect. Will definitely return!",
        isVerified: true,
        isPublic: true,
        helpfulCount: 3,
        userId: users[0].id,
        roomId: rooms[0].id,
      },
      {
        rating: 4,
        comment: "Great hotel with comfortable rooms. The breakfast was delicious and the service was prompt. Only minor issue was the WiFi speed in the evening.",
        isVerified: true,
        isPublic: true,
        helpfulCount: 2,
        userId: users[1]?.id || users[0].id,
        roomId: rooms[1]?.id || rooms[0].id,
      },
      {
        rating: 5,
        comment: "Exceptional experience! The suite was luxurious, staff went above and beyond, and the amenities were top-notch. Highly recommend!",
        isVerified: true,
        isPublic: true,
        helpfulCount: 5,
        userId: users[2]?.id || users[0].id,
        roomId: rooms[2]?.id || rooms[0].id,
      },
      {
        rating: 3,
        comment: "Decent hotel but room was smaller than expected. Clean and functional, but could use some updates. Staff was helpful though.",
        isVerified: false,
        isPublic: true,
        helpfulCount: 1,
        userId: users[3]?.id || users[0].id,
        roomId: rooms[3]?.id || rooms[0].id,
      },
      {
        rating: 4,
        comment: "Very good value for money. Room was clean, bed was comfortable, and the location was convenient. Would stay again.",
        isVerified: true,
        isPublic: true,
        helpfulCount: 0,
        userId: users[4]?.id || users[0].id,
        roomId: rooms[4]?.id || rooms[0].id,
      },
      {
        rating: 2,
        comment: "Disappointing experience. Room had maintenance issues, staff was unresponsive, and the noise level was unacceptable.",
        isVerified: false,
        isPublic: false, // This will be a private review
        helpfulCount: 0,
        userId: users[0].id,
        roomId: rooms[0].id,
      },
      {
        rating: 5,
        comment: "Perfect business hotel! Great conference facilities, excellent room service, and the staff was very professional.",
        isVerified: true,
        isPublic: true,
        helpfulCount: 4,
        userId: users[1]?.id || users[0].id,
        roomId: rooms[1]?.id || rooms[0].id,
      },
      {
        rating: 4,
        comment: "Lovely boutique hotel with character. The room had a great view, breakfast was fresh, and the atmosphere was relaxing.",
        isVerified: true,
        isPublic: true,
        helpfulCount: 2,
        userId: users[2]?.id || users[0].id,
        roomId: rooms[2]?.id || rooms[0].id,
      }
    ];

    // Create reviews
    for (const reviewData of sampleReviews) {
      try {
        const review = await prisma.review.create({
          data: reviewData,
        });
        console.log(`✅ Created review: ${review.rating}⭐ - "${review.comment.substring(0, 50)}..."`);
      } catch (error) {
        console.log(`❌ Failed to create review: ${error.message}`);
      }
    }

    console.log('\n🎉 Sample reviews created successfully!');
    console.log('\n📊 Now you can:');
    console.log('1. Go to your dashboard and click the "Reviews" card');
    console.log('2. View all the sample reviews with ratings and comments');
    console.log('3. Test the search and filter functionality');
    console.log('4. Try creating a new review');
    console.log('5. Test the helpful voting system');

  } catch (error) {
    console.error('❌ Error creating sample reviews:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleReviews();
