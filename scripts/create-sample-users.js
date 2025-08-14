const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSampleUsers() {
  try {
    console.log('🌟 Creating sample users for enhanced user management...');

    // Check if users already exist
    const existingUsers = await prisma.user.count();
    if (existingUsers > 5) {
      console.log('✅ Sample users already exist. Skipping creation.');
      return;
    }

    // Sample user data with realistic business roles
    const sampleUsers = [
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@hotel.com',
        password: 'admin123',
        role: 'ADMIN',
        isActive: true,
      },
      {
        name: 'Michael Chen',
        email: 'michael.chen@hotel.com',
        password: 'manager123',
        role: 'MANAGER',
        isActive: true,
      },
      {
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@hotel.com',
        password: 'staff123',
        role: 'STAFF',
        isActive: true,
      },
      {
        name: 'David Thompson',
        email: 'david.thompson@hotel.com',
        password: 'concierge123',
        role: 'CONCIERGE',
        isActive: true,
      },
      {
        name: 'Lisa Wang',
        email: 'lisa.wang@hotel.com',
        password: 'staff123',
        role: 'STAFF',
        isActive: true,
      },
      {
        name: 'James Wilson',
        email: 'james.wilson@hotel.com',
        password: 'concierge123',
        role: 'CONCIERGE',
        isActive: true,
      },
      {
        name: 'Maria Garcia',
        email: 'maria.garcia@hotel.com',
        password: 'staff123',
        role: 'STAFF',
        isActive: true,
      },
      {
        name: 'Robert Kim',
        email: 'robert.kim@hotel.com',
        password: 'manager123',
        role: 'MANAGER',
        isActive: true,
      },
      {
        name: 'Jennifer Lee',
        email: 'jennifer.lee@hotel.com',
        password: 'staff123',
        role: 'STAFF',
        isActive: true,
      },
      {
        name: 'Thomas Brown',
        email: 'thomas.brown@hotel.com',
        password: 'concierge123',
        role: 'CONCIERGE',
        isActive: true,
      }
    ];

    // Create users
    for (const userData of sampleUsers) {
      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email }
        });

        if (!existingUser) {
          const user = await prisma.user.create({
            data: {
              name: userData.name,
              email: userData.email,
              password: hashedPassword,
              role: userData.role,
              isActive: userData.isActive,
              lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random last login within 30 days
            },
          });
          console.log(`✅ Created user: ${user.name} (${user.role})`);
        } else {
          console.log(`⏭️  User already exists: ${userData.name}`);
        }
      } catch (error) {
        console.log(`❌ Failed to create user ${userData.name}: ${error.message}`);
      }
    }

    console.log('\n🎉 Sample users created successfully!');
    console.log('\n📊 Now you can:');
    console.log('1. Go to Admin Dashboard > User Management');
    console.log('2. See all users with detailed information');
    console.log('3. Test the search and filter functionality');
    console.log('4. View user details, edit, and manage permissions');
    console.log('5. See business intelligence metrics for each user');

  } catch (error) {
    console.error('❌ Error creating sample users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleUsers();
