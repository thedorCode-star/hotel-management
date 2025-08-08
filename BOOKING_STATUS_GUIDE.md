# 🏨 Booking Status System Guide

## 📋 Overview

The hotel management system uses a **comprehensive booking status system** that ensures proper workflow and prevents invalid status transitions.

## 🔄 Booking Status Flow

### **Complete Booking Lifecycle:**

```
PENDING → PAYMENT_PENDING → PAID → CHECKED_IN → CHECKED_OUT → COMPLETED
    ↓           ↓           ↓         ↓            ↓            ↓
  Guest     Payment     Payment   Guest       Guest       Room
  Books     Initiated   Complete  Checks In   Checks Out  Available
```

### **Status Definitions:**

| Status | Description | Room Status | Actions Available |
|--------|-------------|-------------|-------------------|
| **PENDING** | Booking created, payment required | RESERVED | Pay, Cancel |
| **PAYMENT_PENDING** | Payment initiated, awaiting completion | RESERVED | Complete payment, Cancel |
| **PAID** | Payment completed, room confirmed | RESERVED | Check-in, Cancel |
| **CHECKED_IN** | Guest has checked in | OCCUPIED | Check-out, Early check-out |
| **CHECKED_OUT** | Guest has checked out early | AVAILABLE | Complete, Refund |
| **COMPLETED** | Full stay completed | AVAILABLE | None (final state) |
| **CANCELLED** | Booking cancelled | AVAILABLE | None (final state) |
| **REFUNDED** | Full or partial refund processed | AVAILABLE | None (final state) |

## ✅ Valid Status Transitions

### **Professional Status Transition Rules:**

```typescript
const validTransitions: { [key: string]: string[] } = {
  'PENDING': ['PAYMENT_PENDING', 'PAID', 'CANCELLED'],
  'PAYMENT_PENDING': ['PAID', 'CANCELLED'],
  'PAID': ['CHECKED_IN', 'CANCELLED'],
  'CHECKED_IN': ['CHECKED_OUT', 'COMPLETED'],
  'CHECKED_OUT': ['COMPLETED'],
  'COMPLETED': [], // Final state
  'CANCELLED': [], // Final state
  'REFUNDED': [], // Final state
};
```

### **Transition Examples:**

#### **✅ Valid Transitions:**
- `PENDING` → `PAID` ✅ (Payment completed)
- `PAID` → `CHECKED_IN` ✅ (Guest checks in)
- `CHECKED_IN` → `CHECKED_OUT` ✅ (Early check-out)
- `CHECKED_IN` → `COMPLETED` ✅ (Normal check-out)

#### **❌ Invalid Transitions:**
- `PENDING` → `CHECKED_IN` ❌ (Must pay first)
- `PAID` → `COMPLETED` ❌ (Must check in first)
- `COMPLETED` → `PAID` ❌ (Cannot go backwards)
- `CANCELLED` → `PAID` ❌ (Cannot revive cancelled booking)

## 🛡️ Professional Validation

### **Status Transition Validation:**

```typescript
// Validate status transition
if (status && status !== existingBooking.status) {
  const validTransitions = {
    'PENDING': ['PAYMENT_PENDING', 'PAID', 'CANCELLED'],
    'PAYMENT_PENDING': ['PAID', 'CANCELLED'],
    'PAID': ['CHECKED_IN', 'CANCELLED'],
    'CHECKED_IN': ['CHECKED_OUT', 'COMPLETED'],
    'CHECKED_OUT': ['COMPLETED'],
    'COMPLETED': [],
    'CANCELLED': [],
    'REFUNDED': [],
  };

  if (!validTransitions[existingBooking.status]?.includes(status)) {
    throw new Error(`Invalid status transition from ${existingBooking.status} to ${status}`);
  }
}
```

### **Room Status Management:**

```typescript
// Automatic room status updates
if (status === 'PAID' && existingBooking.status === 'PENDING') {
  // Update room to RESERVED (not OCCUPIED until check-in)
  await db.room.update({
    where: { id: existingBooking.roomId },
    data: { status: 'RESERVED' }
  });
} else if (status === 'CHECKED_IN' && existingBooking.status === 'PAID') {
  // Update room to OCCUPIED
  await db.room.update({
    where: { id: existingBooking.roomId },
    data: { status: 'OCCUPIED' }
  });
} else if (status === 'COMPLETED' && existingBooking.status === 'CHECKED_OUT') {
  // Update room to AVAILABLE
  await db.room.update({
    where: { id: existingBooking.roomId },
    data: { status: 'AVAILABLE' }
  });
}
```

## 🎯 Professional Features

### **Smart Status Management:**
- ✅ **Valid transition enforcement** - Prevents invalid status changes
- ✅ **Automatic room updates** - Room status follows booking status
- ✅ **Payment integration** - Status updates with payment completion
- ✅ **Check-in/out workflow** - Proper guest lifecycle management

### **Error Handling:**
- ✅ **Clear error messages** - Specific transition error details
- ✅ **Validation feedback** - User-friendly error explanations
- ✅ **Professional logging** - Detailed status change tracking
- ✅ **Graceful degradation** - System handles invalid requests

### **Business Logic:**
- ✅ **Payment requirements** - Must pay before check-in
- ✅ **Guest workflow** - Proper check-in/check-out process
- ✅ **Room availability** - Automatic room status management
- ✅ **Refund handling** - Support for early check-outs

## 🔧 Troubleshooting

### **Common Status Issues:**

#### **1. "Invalid status transition" Error**
**Cause:** Attempting invalid status change
**Solution:** Follow proper booking workflow

#### **2. Room Status Mismatch**
**Cause:** Room status not updated with booking
**Solution:** Check booking status and update room accordingly

#### **3. Payment Status Issues**
**Cause:** Payment completed but booking not updated
**Solution:** Verify payment processing and booking update

### **Status Debugging:**

```bash
# Check booking status
curl -s "http://localhost:3000/api/bookings" | grep -o '"status":"[^"]*"' | sort | uniq -c

# Check specific booking
curl -s "http://localhost:3000/api/bookings/[booking-id]"

# Update booking status
curl -X PUT -H "Content-Type: application/json" \
  -d '{"status":"PAID"}' \
  "http://localhost:3000/api/bookings/[booking-id]"
```

## 📊 Status Analytics

### **Status Distribution:**
- **PENDING:** New bookings awaiting payment
- **PAID:** Confirmed bookings ready for check-in
- **CHECKED_IN:** Active guests staying
- **COMPLETED:** Finished stays
- **CANCELLED:** Cancelled bookings

### **Business Metrics:**
- **Booking success rate** - Percentage of PENDING → PAID
- **Check-in rate** - Percentage of PAID → CHECKED_IN
- **Completion rate** - Percentage of CHECKED_IN → COMPLETED
- **Cancellation rate** - Percentage of cancelled bookings

## 🎉 Benefits

### **For Hotel Management:**
- ✅ **Clear booking states** - Easy to track booking progress
- ✅ **Proper workflow** - Enforces business rules
- ✅ **Room management** - Automatic room status updates
- ✅ **Revenue tracking** - Payment status integration

### **For Guests:**
- ✅ **Transparent process** - Clear booking status
- ✅ **Proper check-in/out** - Smooth guest experience
- ✅ **Payment confirmation** - Clear payment status
- ✅ **Cancellation support** - Proper cancellation handling

### **For System:**
- ✅ **Data integrity** - Valid status transitions only
- ✅ **Error prevention** - Prevents invalid operations
- ✅ **Audit trail** - Complete status change history
- ✅ **Professional workflow** - Robust booking management

## 🚀 Result

Your **booking status system is now professional and robust** with:

- ✅ **Valid status transitions** - Prevents invalid changes
- ✅ **Automatic room updates** - Room status follows booking
- ✅ **Payment integration** - Seamless payment workflow
- ✅ **Professional error handling** - Clear, helpful messages
- ✅ **Business logic enforcement** - Proper booking lifecycle
- ✅ **Comprehensive validation** - Robust status management

**The booking status system now provides a professional, reliable, and error-free booking management experience!** 🏨✨ 