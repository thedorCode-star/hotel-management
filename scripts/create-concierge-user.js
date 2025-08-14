const bcrypt = require('bcryptjs');

async function createConciergeUser() {
  try {
    // Import Prisma client
    const { PrismaClient } = require('../src/generated/prisma');
    const prisma = new PrismaClient();

    // Check if concierge user already exists
    const existingConcierge = await prisma.user.findUnique({
      where: { email: 'concierge@hotel.com' }
    });

    if (existingConcierge) {
      console.log('Concierge user already exists!');
      await prisma.$disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('concierge123', 10);

    // Create concierge user
    const conciergeUser = await prisma.user.create({
      data: {
        email: 'concierge@hotel.com',
        password: hashedPassword,
        name: 'Hotel Concierge',
        role: 'CONCIERGE',
        isActive: true,
      }
    });

    console.log('Concierge user created successfully!');
    console.log('Email: concierge@hotel.com');
    console.log('Password: concierge123');
    console.log('User ID:', conciergeUser.id);

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error creating concierge user:', error);
    process.exit(1);
  }
}

createConciergeUser();
