# 🔧 Stripe Payment Setup Guide

## **Current Issue**
You're getting a **Stripe IntegrationError** because the publishable key is missing. This prevents the payment modal from working properly.

## **✅ Solution Steps**

### **1. Create Environment Variables**

Create a `.env.local` file in your project root with:

```bash
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/hotel_management"

# JWT Secret
JWT_SECRET="your-secret-key-here"

# Stripe Configuration (REQUIRED for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
```

### **2. Get Stripe API Keys**

1. **Sign up for Stripe** at [stripe.com](https://stripe.com)
2. **Go to Dashboard** → Developers → API Keys
3. **Copy your keys:**
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### **3. Update Your Environment File**

Replace the placeholder values in `.env.local`:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51ABC123DEF456..."
STRIPE_SECRET_KEY="sk_test_51ABC123DEF456..."
```

### **4. Restart Your Development Server**

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## **🔍 Testing the Fix**

After setting up the environment variables:

1. **Refresh your browser** (Ctrl+F5 or Cmd+Shift+R)
2. **Go to Booking Management**
3. **Click "Pay" button** on a pending booking
4. **Payment modal should now work** without errors

## **🎯 Expected Results**

✅ **No more Stripe errors**  
✅ **Payment modal opens properly**  
✅ **Card input fields are clickable**  
✅ **Payment processing works**  
✅ **Revenue updates correctly**  

## **🚨 If You Don't Want Stripe Right Now**

If you want to disable payments temporarily, the system will now show a **graceful error message** instead of crashing.

## **📞 Need Help?**

1. **Check browser console** for any remaining errors
2. **Verify environment variables** are loaded correctly
3. **Restart the development server** after making changes

The payment system is now **professionally configured** with proper error handling! 