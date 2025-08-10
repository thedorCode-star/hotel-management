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
  
  if (!publishableKey || publishableKey === '') {
    console.warn('Stripe publishable key is missing. Payment functionality will be disabled.');
    return null;
  }
  
  return loadStripe(publishableKey);
})();

interface StripeProviderProps {
  children: ReactNode;
}

export default function StripeProvider({ children }: StripeProviderProps) {
  // If Stripe is not configured, provide fallback context
  if (!stripePromise) {
    return (
      <StripeContext.Provider value={{ isStripeAvailable: false }}>
        {children}
      </StripeContext.Provider>
    );
  }

  return (
    <StripeContext.Provider value={{ isStripeAvailable: true }}>
      <Elements stripe={stripePromise}>
        {children}
      </Elements>
    </StripeContext.Provider>
  );
} 