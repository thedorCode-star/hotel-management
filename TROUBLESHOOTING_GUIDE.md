# 🔧 Troubleshooting Guide - Booking System

## 🚨 Common Issues and Solutions

### **Issue 1: "Failed to fetch rooms: 500"**

#### **Symptoms:**
- Console error: "Failed to fetch rooms: 500"
- Booking form shows error message
- Rooms not loading in dropdown

#### **Root Cause:**
- API not handling comma-separated status parameters
- Development server cache issues
- Database connection problems

#### **Solutions:**

##### **1. Restart Development Server**
```bash
# Stop all Next.js processes
pkill -f "next dev"

# Wait 2 seconds
sleep 2

# Start development server
npm run dev
```

##### **2. Clear Browser Cache**
- **Chrome/Edge:** `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- **Firefox:** `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- **Safari:** `Cmd+Option+R`

##### **3. Check API Endpoint**
```bash
# Test rooms API directly
curl -s "http://localhost:3000/api/rooms?status=AVAILABLE,RESERVED"
```

##### **4. Verify Database Connection**
```bash
# Test basic rooms endpoint
curl -s "http://localhost:3000/api/rooms" | head -5
```

### **Issue 2: Room Not Available for Booking**

#### **Symptoms:**
- Room appears in list but booking fails
- Error: "Room is currently reserved"
- Room status shows as RESERVED

#### **Root Cause:**
- Room has active bookings
- Status not updated properly
- Conflicting booking dates

#### **Solutions:**

##### **1. Check Room Status**
```bash
# Check specific room status
curl -s "http://localhost:3000/api/rooms" | grep -A 5 -B 5 "A02"
```

##### **2. Check Active Bookings**
```bash
# Check bookings for specific room
curl -s "http://localhost:3000/api/bookings" | grep -A 10 -B 5 "A02"
```

##### **3. Update Room Status**
- Go to Room Management
- Check if room has active bookings
- Update status if needed

### **Issue 3: Booking Creation Fails**

#### **Symptoms:**
- "Failed to create booking" error
- Form validation passes but API fails
- Room appears available but booking rejected

#### **Root Cause:**
- Overlapping bookings
- Invalid dates
- Room capacity exceeded
- Database constraints

#### **Solutions:**

##### **1. Check for Overlapping Bookings**
```bash
# Check bookings for specific dates
curl -s "http://localhost:3000/api/bookings" | grep -A 5 -B 5 "2025-08-08"
```

##### **2. Validate Date Logic**
- Ensure check-in is not in the past
- Ensure check-out is after check-in
- Check for same-day bookings

##### **3. Check Room Capacity**
- Verify guest count doesn't exceed room capacity
- Check room type and capacity limits

### **Issue 4: Development Server Issues**

#### **Symptoms:**
- Multiple Next.js processes running
- Server not responding
- Hot reload not working

#### **Solutions:**

##### **1. Kill All Next.js Processes**
```bash
# Find all Next.js processes
ps aux | grep "next" | grep -v grep

# Kill all processes
pkill -f "next"
```

##### **2. Clear Next.js Cache**
```bash
# Remove .next directory
rm -rf .next

# Reinstall dependencies
npm install

# Start fresh
npm run dev
```

##### **3. Check Port Conflicts**
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process using port 3000
kill -9 $(lsof -t -i:3000)
```

## 🔍 Debugging Steps

### **Step 1: Check Server Status**
```bash
# Test if server is running
curl -s "http://localhost:3000" > /dev/null && echo "✅ Server OK" || echo "❌ Server Down"
```

### **Step 2: Test API Endpoints**
```bash
# Test rooms API
curl -s "http://localhost:3000/api/rooms" | head -3

# Test bookings API
curl -s "http://localhost:3000/api/bookings" | head -3
```

### **Step 3: Check Database**
```bash
# Test database connection
npx prisma db push --accept-data-loss
```

### **Step 4: Check Logs**
```bash
# Check development server logs
# Look for error messages in terminal
```

## 🛠️ Professional Solutions

### **Enhanced Error Handling**

#### **1. API Error Handling**
```typescript
// Enhanced error handling in API routes
try {
  // API logic
} catch (error) {
  console.error('API Error:', error);
  return NextResponse.json(
    { error: 'Professional error message' },
    { status: 500 }
  );
}
```

#### **2. Frontend Error Handling**
```typescript
// Enhanced error handling in components
try {
  const response = await fetch('/api/endpoint');
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Professional error message');
  }
} catch (error) {
  console.error('Frontend Error:', error);
  setErrors({ submit: error.message });
}
```

### **Professional Debugging**

#### **1. Console Logging**
```typescript
// Add professional logging
console.log('🔍 Debug:', { 
  action: 'fetchRooms', 
  status: response.status,
  data: data 
});
```

#### **2. Error Tracking**
```typescript
// Track errors professionally
console.error('❌ Error:', {
  component: 'BookingForm',
  action: 'fetchRooms',
  error: error.message,
  timestamp: new Date().toISOString()
});
```

## 📊 System Health Check

### **Quick Health Check Script**
```bash
#!/bin/bash
echo "🏥 Hotel Management System Health Check"

# Check server
echo "1. Checking server..."
if curl -s "http://localhost:3000" > /dev/null; then
  echo "   ✅ Server is running"
else
  echo "   ❌ Server is down"
fi

# Check rooms API
echo "2. Checking rooms API..."
if curl -s "http://localhost:3000/api/rooms" > /dev/null; then
  echo "   ✅ Rooms API working"
else
  echo "   ❌ Rooms API failed"
fi

# Check bookings API
echo "3. Checking bookings API..."
if curl -s "http://localhost:3000/api/bookings" > /dev/null; then
  echo "   ✅ Bookings API working"
else
  echo "   ❌ Bookings API failed"
fi

echo "🏁 Health check complete"
```

## 🎯 Prevention Tips

### **1. Regular Maintenance**
- ✅ **Restart server daily** - Clear cache and memory
- ✅ **Check logs regularly** - Monitor for errors
- ✅ **Update dependencies** - Keep packages current
- ✅ **Backup database** - Regular data backups

### **2. Development Best Practices**
- ✅ **Use version control** - Track all changes
- ✅ **Test thoroughly** - Test all scenarios
- ✅ **Document changes** - Keep documentation updated
- ✅ **Monitor performance** - Track system metrics

### **3. Professional Standards**
- ✅ **Error handling** - Comprehensive error management
- ✅ **User feedback** - Clear, helpful messages
- ✅ **System reliability** - Robust, stable system
- ✅ **Performance optimization** - Fast, efficient code

## 🎉 Result

With this troubleshooting guide, you can:

- ✅ **Quickly identify issues** - Systematic problem-solving
- ✅ **Resolve problems efficiently** - Step-by-step solutions
- ✅ **Prevent future issues** - Proactive maintenance
- ✅ **Maintain professional standards** - Reliable, robust system

**Your booking system is now equipped with professional troubleshooting capabilities!** 🏨✨ 