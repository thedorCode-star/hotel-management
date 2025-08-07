import Stripe from 'stripe';

// Initialize Stripe with environment variables
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-07-30.basil',
});

// Stripe configuration
export const STRIPE_CONFIG = {
  currency: 'usd',
  capture_method: 'automatic',
  setup_future_usage: 'off_session',
};

// Payment intent options
export const createPaymentIntentOptions = (amount: number, metadata: any) => ({
  amount: Math.round(amount * 100), // Convert to cents
  currency: STRIPE_CONFIG.currency,
  metadata,
  automatic_payment_methods: {
    enabled: true,
  },
});

// Refund options
export const createRefundOptions = (paymentIntentId: string, amount?: number) => ({
  payment_intent: paymentIntentId,
  ...(amount && { amount: Math.round(amount * 100) }),
});

// Customer creation options
export const createCustomerOptions = (email: string, name: string) => ({
  email,
  name,
  metadata: {
    source: 'hotel_management_system',
  },
});

// Payment method attachment options
export const attachPaymentMethodOptions = (customerId: string, paymentMethodId: string) => ({
  customer: customerId,
  payment_method: paymentMethodId,
});

// Helper function to format amount for display
export const formatAmountForDisplay = (amount: number, currency: string = 'usd'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

// Helper function to format amount for Stripe
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100);
};

// Helper function to validate Stripe webhook signature
export const constructWebhookEvent = (payload: string, signature: string, secret: string) => {
  return stripe.webhooks.constructEvent(payload, signature, secret);
};

// Error handling for Stripe operations
export const handleStripeError = (error: any) => {
  if (error instanceof Stripe.errors.StripeError) {
    return {
      error: error.message,
      code: error.code,
      type: error.type,
    };
  }
  return {
    error: 'An unexpected error occurred',
    code: 'unknown_error',
    type: 'unknown',
  };
}; 