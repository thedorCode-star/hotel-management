"use client";

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { createContext, useContext, ReactNode } from 'react';

// Create a fallback context for when Stripe is not available
const StripeContext = createContext<{ isStripeAvailable: boolean }>({ isStripeAvailable: false });

export const useStripeContext = () => useContext(StripeContext);

// Load Stripe with publishable key - with proper error handling
const stripePromise = (() => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  console.log('🔑 Stripe Provider: Checking publishable key...');
  console.log('🔑 Stripe Provider: Key present:', !!publishableKey);
  console.log('🔑 Stripe Provider: Key starts with:', publishableKey?.substring(0, 20));
  
  if (!publishableKey || publishableKey === '') {
    console.warn('❌ Stripe publishable key is missing. Payment functionality will be disabled.');
    return null;
  }
  
  console.log('✅ Stripe Provider: Loading Stripe...');
  return loadStripe(publishableKey);
})();

interface StripeProviderProps {
  children: ReactNode;
}

export default function StripeProvider({ children }: StripeProviderProps) {
  console.log('🔧 StripeProvider: Component rendering...');
  console.log('🔧 StripeProvider: stripePromise available:', !!stripePromise);
  
  // If Stripe is not configured, provide fallback context
  if (!stripePromise) {
    console.log('❌ StripeProvider: Stripe not available, using fallback');
    return (
      <StripeContext.Provider value={{ isStripeAvailable: false }}>
        {children}
      </StripeContext.Provider>
    );
  }

  console.log('✅ StripeProvider: Stripe available, wrapping with Elements');
  return (
    <StripeContext.Provider value={{ isStripeAvailable: true }}>
      <Elements stripe={stripePromise}>
        {children}
      </Elements>
    </StripeContext.Provider>
  );
} 