# 🏨 Booking Status Transitions Guide

## 📋 Overview

This guide explains the **professional booking status transition system** and how to handle various booking scenarios properly.

## 🔄 Valid Status Transitions

### **Complete Booking Lifecycle:**

```
PENDING → PAYMENT_PENDING → PAID → CHECKED_IN → CHECKED_OUT → COMPLETED
    ↓           ↓           ↓         ↓            ↓            ↓
  Guest     Payment     Payment   Guest       Guest       Room
  Books     Initiated   Complete  Checks In   Checks Out  Available
```

### **Status Transition Rules:**

| Current Status | Allowed Transitions | Business Logic |
|----------------|-------------------|----------------|
| **PENDING** | `PAYMENT_PENDING`, `PAID`, `CANCELLED` | Payment required before check-in |
| **PAYMENT_PENDING** | `PAID`, `CANCELLED` | Payment in progress |
| **PAID** | `CHECKED_IN`, `CANCELLED`, `COMPLETED`* | Payment completed, ready for check-in |
| **CHECKED_IN** | `CHECKED_OUT`, `COMPLETED` | Guest is staying |
| **CHECKED_OUT** | `COMPLETED` | Guest checked out early |
| **COMPLETED** | None (final state) | Stay completed |
| **CANCELLED** | None (final state) | Booking cancelled |
| **REFUNDED** | None (final state) | Refund processed |

*`COMPLETED` from `PAID` only allowed if check-out date has passed

## 🛡️ Professional Validation

### **Status Transition Validation Logic:**

```typescript
// Validate status transition
if (status && status !== existingBooking.status) {
  const validTransitions = {
    'PENDING': ['PAYMENT_PENDING', 'PAID', 'CANCELLED'],
    'PAYMENT_PENDING': ['PAID', 'CANCELLED'],
    'PAID': ['CHECKED_IN', 'CANCELLED', 'COMPLETED'], // Allow direct completion for past bookings
    'CHECKED_IN': ['CHECKED_OUT', 'COMPLETED'],
    'CHECKED_OUT': ['COMPLETED'],
    'COMPLETED': [], // Final state
    'CANCELLED': [], // Final state
    'REFUNDED': [], // Final state
  };

  // Special case: Allow PAID to COMPLETED if check-out date has passed
  if (existingBooking.status === 'PAID' && status === 'COMPLETED') {
    const checkOutDate = new Date(existingBooking.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkOutDate < today) {
      // Allow the transition - this is a valid auto-completion
      console.log(`✅ Allowing auto-completion for booking ${id} - check-out date has passed`);
    } else {
      return NextResponse.json(
        { error: `Cannot complete booking before check-out date. Please check in first or wait until check-out date.` },
        { status: 400 }
      );
    }
  } else if (!validTransitions[existingBooking.status]?.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status transition from ${existingBooking.status} to ${status}` },
      { status: 400 }
    );
  }
}
```

## 🎯 Common Scenarios

### **Scenario 1: Direct Completion from PAID**

#### **When Allowed:**
- ✅ **Check-out date has passed** - Booking automatically completed
- ✅ **No-show guest** - Guest didn't check in but stay period ended
- ✅ **Administrative completion** - Staff manually completes past booking

#### **When Not Allowed:**
- ❌ **Check-out date in future** - Must wait until check-out date
- ❌ **Guest should check in first** - Normal workflow requires check-in

#### **Error Message:**
```
"Cannot complete booking before check-out date. Please check in first or wait until check-out date."
```

### **Scenario 2: Normal Check-in Workflow**

#### **Valid Flow:**
1. **PENDING** → **PAID** (Payment completed)
2. **PAID** → **CHECKED_IN** (Guest checks in)
3. **CHECKED_IN** → **COMPLETED** (Guest checks out)

#### **Alternative Flow:**
1. **PENDING** → **PAID** (Payment completed)
2. **PAID** → **CHECKED_IN** (Guest checks in)
3. **CHECKED_IN** → **CHECKED_OUT** (Early check-out)
4. **CHECKED_OUT** → **COMPLETED** (Stay completed)

### **Scenario 3: Early Check-out**

#### **Valid Flow:**
1. **CHECKED_IN** → **CHECKED_OUT** (Guest checks out early)
2. **CHECKED_OUT** → **COMPLETED** (Stay completed)

#### **Automatic Refund:**
- System calculates unused days
- Automatic refund processing
- Room status updated to AVAILABLE

## 🔧 Troubleshooting

### **Common Issues and Solutions:**

#### **1. "Invalid status transition from PAID to COMPLETED"**

**Cause:** Trying to complete a booking before check-out date
**Solution:** 
- Wait until check-out date has passed, OR
- Check in the guest first, then complete

**Code Fix:**
```typescript
// Check if check-out date has passed
const checkOutDate = new Date(booking.checkOut);
const today = new Date();
today.setHours(0, 0, 0, 0);

if (checkOutDate < today) {
  // Allow completion
  await updateBookingStatus(bookingId, 'COMPLETED');
} else {
  // Show error message
  alert('Cannot complete booking before check-out date');
}
```

#### **2. "Cannot complete booking before check-out date"**

**Cause:** Booking check-out date is in the future
**Solution:**
- Wait until check-out date, OR
- Follow normal check-in workflow

**User Guidance:**
```
"Please check in the guest first, or wait until the check-out date has passed to complete this booking."
```

#### **3. Room Status Mismatch**

**Cause:** Room status not updated with booking status
**Solution:** Check booking status and update room accordingly

**Automatic Updates:**
```typescript
// Room status updates automatically
if (status === 'PAID') {
  room.status = 'RESERVED';
} else if (status === 'CHECKED_IN') {
  room.status = 'OCCUPIED';
} else if (status === 'COMPLETED') {
  room.status = 'AVAILABLE';
}
```

## 📊 Business Logic

### **Payment Requirements:**
- ✅ **Must pay before check-in** - No check-in without payment
- ✅ **Payment confirmation** - Clear payment status tracking
- ✅ **Refund processing** - Automatic refunds for early check-outs

### **Guest Workflow:**
- ✅ **Check-in process** - Proper guest registration
- ✅ **Check-out process** - Smooth departure handling
- ✅ **Early check-out** - Support for early departures
- ✅ **No-show handling** - Automatic completion for no-shows

### **Room Management:**
- ✅ **Automatic updates** - Room status follows booking status
- ✅ **Availability tracking** - Real-time room availability
- ✅ **Conflict prevention** - Prevents double bookings

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

### **Business Intelligence:**
- ✅ **Status analytics** - Track booking completion rates
- ✅ **Revenue tracking** - Monitor payment and completion rates
- ✅ **Guest behavior** - Analyze check-in/check-out patterns
- ✅ **Room utilization** - Optimize room usage

## 🚀 Best Practices

### **For Hotel Staff:**
- ✅ **Follow proper workflow** - Use check-in/check-out process
- ✅ **Handle exceptions** - Know when to allow direct completion
- ✅ **Monitor bookings** - Track booking status regularly
- ✅ **Update room status** - Ensure room status accuracy

### **For System Administrators:**
- ✅ **Monitor errors** - Track status transition failures
- ✅ **Update business rules** - Modify transition rules as needed
- ✅ **Train staff** - Ensure proper workflow understanding
- ✅ **Maintain data integrity** - Regular status validation

### **For Developers:**
- ✅ **Test transitions** - Verify all valid transitions work
- ✅ **Handle edge cases** - Account for special scenarios
- ✅ **Provide clear errors** - User-friendly error messages
- ✅ **Log changes** - Track all status modifications

## 🎉 Result

Your **booking status transition system is now professional and robust** with:

- ✅ **Valid status transitions** - Prevents invalid changes
- ✅ **Automatic room updates** - Room status follows booking
- ✅ **Payment integration** - Seamless payment workflow
- ✅ **Professional error handling** - Clear, helpful messages
- ✅ **Business logic enforcement** - Proper booking lifecycle
- ✅ **Comprehensive validation** - Robust status management
- ✅ **Special case handling** - Auto-completion for past bookings

**The booking status transition system now provides a professional, reliable, and error-free booking management experience!** 🏨✨ 