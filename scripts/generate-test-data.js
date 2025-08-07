const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy',
    },
  },
});

async function generateTestData() {
  try {
    console.log('Generating test payment data...');

    // Create test users if they don't exist
    const testUsers = [
      { name: 'John Doe', email: 'john@example.com', role: 'GUEST', password: 'password123' },
      { name: 'Jane Smith', email: 'jane@example.com', role: 'GUEST', password: 'password123' },
      { name: 'Bob Johnson', email: 'bob@example.com', role: 'GUEST', password: 'password123' },
      { name: 'Alice Brown', email: 'alice@example.com', role: 'GUEST', password: 'password123' },
      { name: 'Charlie Wilson', email: 'charlie@example.com', role: 'GUEST', password: 'password123' },
    ];

    for (const userData of testUsers) {
      await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: userData,
      });
    }

    // Create test rooms if they don't exist - exactly 4 rooms as requested
    const testRooms = [
      { number: '101', type: 'SINGLE', price: 100, capacity: 2, status: 'AVAILABLE' },
      { number: '102', type: 'DOUBLE', price: 150, capacity: 2, status: 'AVAILABLE' },
      { number: '201', type: 'SUITE', price: 250, capacity: 4, status: 'AVAILABLE' },
      { number: '202', type: 'DELUXE', price: 300, capacity: 3, status: 'AVAILABLE' },
    ];

    for (const roomData of testRooms) {
      await prisma.room.upsert({
        where: { number: roomData.number },
        update: {},
        create: roomData,
      });
    }

    // Get users and rooms
    const users = await prisma.user.findMany({ where: { role: 'GUEST' } });
    const rooms = await prisma.room.findMany();

    // Clear existing data to start fresh
    console.log('Clearing existing test data...');
    await prisma.payment.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.room.updateMany({
      data: { status: 'AVAILABLE' }
    });

    // Generate test bookings and payments with realistic data
    const paymentMethods = ['stripe', 'credit_card', 'paypal'];
    
    // Generate payments for today and recent days
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Create 10 payments for today (to show revenue)
    for (let i = 0; i < 10; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      // Realistic amounts based on room prices
      const amount = room.price + Math.floor(Math.random() * 50);
      
      // Create booking
      const booking = await prisma.booking.create({
        data: {
          userId: user.id,
          roomId: room.id,
          checkIn: new Date(),
          checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          totalPrice: amount,
          status: 'CONFIRMED',
        },
      });

      // Create payment for today
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: amount,
          paymentMethod: paymentMethod,
          status: 'COMPLETED',
          transactionId: `txn_today_${i}`,
          processedAt: new Date(todayStart.getTime() + Math.random() * 24 * 60 * 60 * 1000), // Random time today
        },
      });

      // Update room status
      await prisma.room.update({
        where: { id: room.id },
        data: { status: 'OCCUPIED' },
      });
    }

    // Create 20 payments for this month (not today)
    for (let i = 0; i < 20; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      const amount = room.price + Math.floor(Math.random() * 50);
      
      // Random date this month (but not today)
      const daysAgo = Math.floor(Math.random() * 29) + 1; // 1-29 days ago
      const processedAt = new Date();
      processedAt.setDate(processedAt.getDate() - daysAgo);
      
      // Create booking
      const booking = await prisma.booking.create({
        data: {
          userId: user.id,
          roomId: room.id,
          checkIn: new Date(),
          checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          totalPrice: amount,
          status: 'CONFIRMED',
        },
      });

      // Create payment
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: amount,
          paymentMethod: paymentMethod,
          status: 'COMPLETED',
          transactionId: `txn_month_${i}`,
          processedAt: processedAt,
        },
      });
    }

    // Create 5 pending payments
    for (let i = 0; i < 5; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      const amount = room.price + Math.floor(Math.random() * 50);
      
      // Create booking
      const booking = await prisma.booking.create({
        data: {
          userId: user.id,
          roomId: room.id,
          checkIn: new Date(),
          checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          totalPrice: amount,
          status: 'PENDING',
        },
      });

      // Create pending payment
      await prisma.payment.create({
        data: {
          amount: amount,
          paymentMethod: paymentMethod,
          status: 'PENDING',
          transactionId: `txn_pending_${i}`,
          processedAt: new Date(), // Use current date instead of null
          booking: {
            connect: { id: booking.id }
          }
        },
      });
    }

    // Generate only 2 refunds (to avoid negative revenue)
    const completedPayments = await prisma.payment.findMany({
      where: { 
        status: 'COMPLETED',
        processedAt: {
          lt: todayStart // Only refund payments from before today
        }
      },
      take: 2,
    });

    for (const payment of completedPayments) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'REFUNDED',
          refundedAt: new Date(),
          refundTransactionId: `refund_${payment.transactionId}`,
        },
      });
    }

    console.log('Test data generated successfully!');
    console.log(`Created ${users.length} users`);
    console.log(`Created ${rooms.length} rooms`);
    console.log('Generated 10 test payments for today (to show revenue)');
    console.log('Generated 20 test payments for this month');
    console.log('Generated 5 pending payments');
    console.log('Generated 2 refunds');

  } catch (error) {
    console.error('Error generating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateTestData();