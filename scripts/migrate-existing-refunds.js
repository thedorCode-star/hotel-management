const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function migrateExistingRefunds() {
  try {
    console.log('🔄 Starting migration of existing refunded payments...');
    
    // Find all payments that are marked as REFUNDED but don't have refund records
    const refundedPayments = await prisma.payment.findMany({
      where: {
        status: 'REFUNDED',
        refundedAt: { not: null }
      },
      include: {
        booking: {
          select: {
            id: true,
            refundAmount: true
          }
        }
      }
    });

    console.log(`📊 Found ${refundedPayments.length} refunded payments to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const payment of refundedPayments) {
      try {
        // Check if refund record already exists
        const existingRefund = await prisma.refund.findFirst({
          where: {
            paymentId: payment.id
          }
        });

        if (existingRefund) {
          console.log(`⏭️  Skipping payment ${payment.id} - refund record already exists`);
          skippedCount++;
          continue;
        }

        // Create refund record
        const refundAmount = payment.amount || 0;
        const refund = await prisma.refund.create({
          data: {
            bookingId: payment.bookingId,
            paymentId: payment.id,
            amount: refundAmount,
            refundMethod: 'STRIPE',
            status: 'COMPLETED',
            transactionId: payment.refundTransactionId || `migrated_${payment.id}`,
            processedAt: payment.refundedAt || new Date(),
            notes: `Migrated existing refund for payment ${payment.id}`
          }
        });

        console.log(`✅ Created refund record ${refund.id} for payment ${payment.id} - $${refundAmount}`);
        migratedCount++;

      } catch (error) {
        console.error(`❌ Failed to migrate payment ${payment.id}:`, error.message);
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log(`✅ Successfully migrated: ${migratedCount} refunds`);
    console.log(`⏭️  Skipped (already existed): ${skippedCount} refunds`);
    console.log(`📊 Total processed: ${refundedPayments.length} payments`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateExistingRefunds();
}

module.exports = { migrateExistingRefunds };
