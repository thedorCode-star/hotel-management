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

async function createTestUsers() {
  try {
    console.log('Creating test users...');

    // Create staff user
    const staffPassword = await bcrypt.hash('staff123', 10);
    const staffUser = await prisma.user.upsert({
      where: { email: 'staff@hotel.com' },
      update: {},
      create: {
        name: 'Staff User',
        email: 'staff@hotel.com',
        password: staffPassword,
        role: 'STAFF',
        isActive: true,
        profile: {
          create: {
            phone: '+1234567891',
            address: '456 Staff Street',
            city: 'Staff City',
            country: 'Staff Country',
            postalCode: '54321',
            dateOfBirth: new Date('1985-05-15'),
            emergencyContact: 'Staff Emergency',
            preferences: {
              newsletter: false,
              marketing: true,
              specialOffers: false
            }
          }
        }
      },
    });

    // Create guest user
    const guestPassword = await bcrypt.hash('guest123', 10);
    const guestUser = await prisma.user.upsert({
      where: { email: 'guest@hotel.com' },
      update: {},
      create: {
        name: 'Guest User',
        email: 'guest@hotel.com',
        password: guestPassword,
        role: 'GUEST',
        isActive: true,
        profile: {
          create: {
            phone: '+1234567892',
            address: '789 Guest Street',
            city: 'Guest City',
            country: 'Guest Country',
            postalCode: '98765',
            dateOfBirth: new Date('1995-10-20'),
            emergencyContact: 'Guest Emergency',
            preferences: {
              newsletter: true,
              marketing: true,
              specialOffers: true
            }
          }
        }
      },
    });

    console.log('Test users created successfully!');
    console.log('\nStaff User:');
    console.log('Email: staff@hotel.com');
    console.log('Password: staff123');
    console.log('User ID:', staffUser.id);
    
    console.log('\nGuest User:');
    console.log('Email: guest@hotel.com');
    console.log('Password: guest123');
    console.log('User ID:', guestUser.id);

  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
