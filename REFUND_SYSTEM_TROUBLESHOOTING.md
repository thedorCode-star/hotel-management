# 🔧 Refund System Troubleshooting Guide

## 🚨 **Common Issues & Solutions**

### **Issue 1: Refunds Not Appearing on Refunds Page**

**Symptoms:**
- ✅ Bookings show refunded amounts in payment column
- ❌ Refunds page shows "No refunds found"
- ❌ Refund records missing from database

**Root Cause:**
Refunds were processed but not properly recorded in the `Refund` table. This happens when:
- Stripe webhooks don't create refund records
- Payment refund APIs don't create refund records
- Manual refunds bypass the refund creation process

**Immediate Fix:**
```bash
# Run migration script to create missing refund records
npm run db:migrate-refunds
```

**Prevention:**
- Always ensure refund APIs create `Refund` records
- Verify webhook handlers create refund records
- Use the centralized refund processing system

### **Issue 2: Refund Amounts Don't Match**

**Symptoms:**
- Booking shows different refund amount than refund record
- Multiple refund records for same payment
- Inconsistent refund totals

**Root Cause:**
- Manual updates to `booking.refundAmount` without creating refund records
- Multiple refund processes for same payment
- Race conditions in refund processing

**Fix:**
```typescript
// Always use the centralized refund system
const refund = await db.refund.create({
  data: {
    bookingId,
    paymentId,
    amount: refundAmount,
    refundMethod: 'STRIPE',
    status: 'COMPLETED',
    transactionId: stripeRefundId,
    processedAt: new Date(),
    notes: 'Refund reason'
  }
});

// Update booking refund amount automatically
await db.booking.update({
  where: { id: bookingId },
  data: {
    refundAmount: {
      increment: refundAmount
    }
  }
});
```

### **Issue 3: Stripe Webhook Refunds Not Syncing**

**Symptoms:**
- Stripe shows refund processed
- Database payment status not updated
- No refund records created

**Root Cause:**
- Webhook signature verification failing
- Database connection issues
- Missing webhook secret

**Fix:**
```bash
# Check webhook configuration
echo $STRIPE_WEBHOOK_SECRET

# Verify webhook endpoint in Stripe dashboard
# Test webhook delivery
```

## 🛡️ **Prevention Best Practices**

### **1. Always Create Refund Records**
```typescript
// ❌ WRONG - Only updating payment status
await db.payment.update({
  where: { id: paymentId },
  data: { status: 'REFUNDED' }
});

// ✅ CORRECT - Create refund record + update payment
const refund = await db.refund.create({
  data: { /* refund details */ }
});
await db.payment.update({
  where: { id: paymentId },
  data: { status: 'REFUNDED' }
});
```

### **2. Use Centralized Refund Processing**
```typescript
// ❌ WRONG - Multiple refund entry points
// Direct payment updates, manual refunds, etc.

// ✅ CORRECT - Single refund processing system
await processRefund({
  bookingId,
  paymentId,
  amount,
  method: 'STRIPE',
  reason: 'Guest request'
});
```

### **3. Validate Refund Amounts**
```typescript
// Always validate before processing
const totalPaid = booking.paidAmount || 0;
const totalRefunded = booking.refundAmount || 0;
const availableForRefund = totalPaid - totalRefunded;

if (amount > availableForRefund) {
  throw new Error(`Refund amount exceeds available amount`);
}
```

### **4. Audit Trail**
```typescript
// Log all refund operations
console.log(`✅ Refund processed: $${amount} for booking ${bookingId}`);
console.log(`📝 Refund record: ${refund.id}`);
console.log(`💳 Payment updated: ${paymentId}`);
```

## 🔍 **Debugging Steps**

### **Step 1: Check Database State**
```bash
# Check existing refunds
npx prisma studio

# Or query directly
npx prisma db execute --stdin
```

### **Step 2: Verify API Endpoints**
```bash
# Test refunds API
curl http://localhost:3000/api/refunds

# Check specific refund
curl http://localhost:3000/api/refunds/{id}
```

### **Step 3: Monitor Webhooks**
```bash
# Check webhook logs
tail -f logs/stripe-webhooks.log

# Test webhook endpoint
curl -X POST http://localhost:3000/api/webhooks/stripe
```

### **Step 4: Validate Data Consistency**
```sql
-- Check for orphaned refunds
SELECT r.* FROM "Refund" r 
LEFT JOIN "Payment" p ON r.paymentId = p.id 
WHERE p.id IS NULL;

-- Check for missing refund records
SELECT p.* FROM "Payment" p 
WHERE p.status = 'REFUNDED' 
AND NOT EXISTS (
  SELECT 1 FROM "Refund" r WHERE r.paymentId = p.id
);
```

## 🚀 **Recovery Procedures**

### **Emergency Refund Sync**
```bash
# 1. Stop the application
npm run build && npm start

# 2. Run migration script
npm run db:migrate-refunds

# 3. Verify refunds page
# 4. Check booking refund amounts
```

### **Data Reconciliation**
```bash
# 1. Export current state
npx prisma db execute --stdin < export-refunds.sql

# 2. Compare with Stripe dashboard
# 3. Identify discrepancies
# 4. Run targeted fixes
```

### **System Health Check**
```bash
# 1. Verify database schema
npx prisma db push

# 2. Check Prisma client
npx prisma generate

# 3. Test all refund endpoints
# 4. Monitor webhook delivery
```

## 📋 **Maintenance Checklist**

### **Daily**
- [ ] Check refunds page for new refunds
- [ ] Verify webhook delivery in Stripe dashboard
- [ ] Monitor refund processing logs

### **Weekly**
- [ ] Review refund vs payment data consistency
- [ ] Check for failed refund operations
- [ ] Validate webhook endpoint health

### **Monthly**
- [ ] Audit refund records vs Stripe transactions
- [ ] Review refund processing performance
- [ ] Update refund system documentation

## 🔗 **Related Documentation**
- [Refund System Guide](./REFUND_SYSTEM_GUIDE.md)
- [API Documentation](./API_REFERENCE.md)
- [Database Schema](./prisma/schema.prisma)
- [Stripe Integration](./STRIPE_SETUP.md)

---

**Remember:** Always create refund records when processing refunds. The `booking.refundAmount` field should be updated automatically, not manually.
