const bcrypt = require('bcryptjs');

async function createManagerUser() {
  try {
    // Import Prisma client
    const { PrismaClient } = require('../src/generated/prisma');
    const prisma = new PrismaClient();

    // Check if manager user already exists
    const existingManager = await prisma.user.findUnique({
      where: { email: 'manager@hotel.com' }
    });

    if (existingManager) {
      console.log('Manager user already exists!');
      await prisma.$disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('manager123', 10);

    // Create manager user
    const managerUser = await prisma.user.create({
      data: {
        email: 'manager@hotel.com',
        password: hashedPassword,
        name: 'Hotel Manager',
        role: 'MANAGER',
        isActive: true,
      }
    });

    console.log('Manager user created successfully!');
    console.log('Email: manager@hotel.com');
    console.log('Password: manager123');
    console.log('User ID:', managerUser.id);

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error creating manager user:', error);
    process.exit(1);
  }
}

createManagerUser();
