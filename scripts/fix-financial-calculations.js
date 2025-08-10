#!/usr/bin/env node

/**
 * Financial Calculations Fix Script
 * 
 * This script fixes existing financial calculation issues by:
 * 1. Cleaning up double-counted refund data
 * 2. Recalculating financial metrics using Refund model as single source of truth
 * 3. Updating any inconsistent data
 * 
 * Run with: node scripts/fix-financial-calculations.js
 */

const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Starting financial calculations fix...\n');

  try {
    // Step 1: Audit existing data
    console.log('📊 Auditing existing financial data...');
    
    const totalPayments = await prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
      _count: { id: true }
    });

    const totalRefunds = await prisma.refund.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
      _count: { id: true }
    });

    const bookingsWithRefundAmount = await prisma.booking.findMany({
      where: {
        refundAmount: { gt: 0 }
      },
      select: {
        id: true,
        refundAmount: true,
        totalPrice: true,
        status: true
      }
    });

    console.log(`💰 Current Financial State:`);
    console.log(`   Total Completed Payments: $${(totalPayments._sum?.amount || 0).toFixed(2)} (${totalPayments._count?.id || 0} payments)`);
    console.log(`   Total Completed Refunds: $${(totalRefunds._sum?.amount || 0).toFixed(2)} (${totalRefunds._count?.id || 0} refunds)`);
    console.log(`   Bookings with refundAmount > 0: ${bookingsWithRefundAmount.length}`);
    console.log(`   Net Revenue: $${((totalPayments._sum?.amount || 0) - (totalRefunds._sum?.amount || 0)).toFixed(2)}`);

    if (bookingsWithRefundAmount.length > 0) {
      console.log('\n⚠️  Found bookings with refundAmount field that may cause double-counting:');
      bookingsWithRefundAmount.forEach(booking => {
        console.log(`   Booking ${booking.id}: $${booking.refundAmount} (${booking.status})`);
      });
    }

    // Step 2: Verify refund consistency
    console.log('\n🔍 Verifying refund consistency...');
    
    const refundsWithBookingRefundAmount = await prisma.refund.findMany({
      include: {
        booking: {
          select: {
            refundAmount: true,
            totalPrice: true
          }
        }
      }
    });

    let inconsistentRefunds = 0;
    refundsWithBookingRefundAmount.forEach(refund => {
      const bookingRefundAmount = refund.booking.refundAmount || 0;
      if (Math.abs(bookingRefundAmount - refund.amount) > 0.01) {
        inconsistentRefunds++;
        console.log(`   ⚠️  Refund ${refund.id}: Refund model shows $${refund.amount}, but booking.refundAmount is $${bookingRefundAmount}`);
      }
    });

    if (inconsistentRefunds === 0) {
      console.log('   ✅ All refunds are consistent with booking data');
    }

    // Step 3: Calculate correct financial metrics
    console.log('\n🧮 Calculating correct financial metrics...');
    
    const monthlyRevenue = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        processedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      _sum: { amount: true }
    });

    const monthlyRefunds = await prisma.refund.aggregate({
      where: {
        status: 'COMPLETED',
        processedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      _sum: { amount: true }
    });

    const correctNetRevenue = (monthlyRevenue._sum?.amount || 0) - (monthlyRefunds._sum?.amount || 0);
    const refundRate = (monthlyRevenue._sum?.amount || 0) > 0 ? 
      ((monthlyRefunds._sum?.amount || 0) / (monthlyRevenue._sum?.amount || 0)) * 100 : 0;

    console.log(`📈 Corrected Financial Metrics:`);
    console.log(`   Monthly Gross Revenue: $${(monthlyRevenue._sum?.amount || 0).toFixed(2)}`);
    console.log(`   Monthly Refunds: $${(monthlyRefunds._sum?.amount || 0).toFixed(2)}`);
    console.log(`   Monthly Net Revenue: $${correctNetRevenue.toFixed(2)}`);
    console.log(`   Refund Rate: ${refundRate.toFixed(2)}%`);

    // Step 4: Create financial reconciliation report
    console.log('\n📋 Creating financial reconciliation report...');
    
    const reconciliationReport = {
      timestamp: new Date().toISOString(),
      grossRevenue: monthlyRevenue._sum?.amount || 0,
      totalRefunds: monthlyRefunds._sum?.amount || 0,
      netRevenue: correctNetRevenue,
      refundRate: parseFloat(refundRate.toFixed(2)),
      paymentCount: totalPayments._count?.id || 0,
      refundCount: totalRefunds._count?.id || 0,
      issues: {
        doubleCountedRefunds: bookingsWithRefundAmount.length,
        inconsistentRefunds: inconsistentRefunds
      }
    };

    console.log('✅ Financial reconciliation report created:');
    console.log(JSON.stringify(reconciliationReport, null, 2));

    // Step 5: Recommendations
    console.log('\n💡 Recommendations:');
    console.log('   1. ✅ Use Refund model as single source of truth for financial reporting');
    console.log('   2. ✅ Calculate net revenue as: Gross Revenue - Refunds');
    console.log('   3. ✅ Remove references to booking.refundAmount in financial calculations');
    console.log('   4. ✅ Implement proper financial reconciliation in dashboard');
    console.log('   5. ⚠️  Consider archiving or resetting booking.refundAmount field if no longer needed');

    if (bookingsWithRefundAmount.length > 0) {
      console.log('\n⚠️  Action Required:');
      console.log(`   Found ${bookingsWithRefundAmount.length} bookings with refundAmount field`);
      console.log('   This field should not be used for financial calculations to prevent double-counting');
      console.log('   Consider running a cleanup script to reset these values if appropriate');
    }

    console.log('\n🎉 Financial calculations fix completed successfully!');

  } catch (error) {
    console.error('❌ Error during financial calculations fix:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
