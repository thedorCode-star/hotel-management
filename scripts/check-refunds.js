const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

async function checkRefunds() {
  try {
    console.log('🔍 Checking refund data in database...\n');
    
    // Get all refunds
    const allRefunds = await prisma.refund.findMany({
      include: {
        booking: {
          include: {
            user: { select: { name: true, email: true } },
            room: { select: { number: true, type: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 Total refunds found: ${allRefunds.length}\n`);
    
    if (allRefunds.length > 0) {
      console.log('📋 Refund Details:');
      allRefunds.forEach((refund, index) => {
        console.log(`\n${index + 1}. Refund ID: ${refund.id}`);
        console.log(`   Amount: $${refund.amount}`);
        console.log(`   Status: ${refund.status}`);
        console.log(`   Method: ${refund.refundMethod}`);
        console.log(`   Guest: ${refund.booking.user.name} (${refund.booking.user.email})`);
        console.log(`   Room: ${refund.booking.room.number} (${refund.booking.room.type})`);
        console.log(`   Created: ${refund.createdAt.toLocaleDateString()}`);
        console.log(`   Notes: ${refund.notes || 'None'}`);
      });
    }
    
    // Get financial summary
    const totalRefunds = await prisma.refund.aggregate({
      _sum: { amount: true },
      _count: { id: true }
    });
    
    const completedRefunds = await prisma.refund.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
      _count: { id: true }
    });
    
    const pendingRefunds = await prisma.refund.aggregate({
      where: { status: 'PENDING' },
      _sum: { amount: true },
      _count: { id: true }
    });
    
    console.log('\n💰 Financial Summary:');
    console.log(`   Total Refunds: $${Number(totalRefunds._sum.amount || 0).toFixed(2)} (${totalRefunds._count.id} refunds)`);
    console.log(`   Completed: $${Number(completedRefunds._sum.amount || 0).toFixed(2)} (${completedRefunds._count.id} refunds)`);
    console.log(`   Pending: $${Number(pendingRefunds._sum.amount || 0).toFixed(2)} (${pendingRefunds._count.id} refunds)`);
    
  } catch (error) {
    console.error('❌ Error checking refunds:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRefunds();
