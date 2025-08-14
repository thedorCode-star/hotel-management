const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy',
    },
  },
});

async function createAdminUser() {
  try {
    console.log('Creating admin user...');

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@hotel.com' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'admin@hotel.com',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        profile: {
          create: {
            phone: '+1234567890',
            address: '123 Admin Street',
            city: 'Admin City',
            country: 'Admin Country',
            postalCode: '12345',
            dateOfBirth: new Date('1990-01-01'),
            emergencyContact: 'Emergency Admin',
            preferences: {
              newsletter: true,
              marketing: false,
              specialOffers: true
            }
          }
        }
      },
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@hotel.com');
    console.log('Password: admin123');
    console.log('User ID:', adminUser.id);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
