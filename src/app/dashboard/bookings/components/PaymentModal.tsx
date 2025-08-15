"use client";

import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { X, CreditCard, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useStripeContext } from '../../../../components/StripeProvider';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    totalPrice: number;
    checkIn: string;
    checkOut: string;
    user: { name: string; email: string };
    room: { number: string; type: string };
  };
  onPaymentSuccess: () => void;
}

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

// Separate component for Stripe payment form
function StripePaymentForm({ booking, onPaymentSuccess, onClose }: {
  booking: PaymentModalProps['booking'];
  onPaymentSuccess: () => void;
  onClose: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setError('Payment system is not configured. Please contact support.');
      return;
    }

    // Get authentication token
    const token = localStorage.getItem('token') || getCookie('auth-token');
    if (!token) {
      setError('Authentication required. Please log in again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('🔍 Starting payment process...');
      console.log('🔑 Auth token present:', !!token);
      console.log('💳 Stripe elements available:', !!elements);
      
      // Create payment method
      console.log('🔄 Creating Stripe payment method...');
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
        billing_details: {
          name: booking.user.name,
          email: booking.user.email,
        },
      });
      
      console.log('✅ Payment method created:', paymentMethod?.id);

      if (paymentMethodError) {
        setError(paymentMethodError.message || 'Payment method creation failed');
        setIsProcessing(false);
        return;
      }

      // Process payment through our API with timeout
      console.log('🌐 Making API call to /api/payments/process...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch('/api/payments/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookingId: booking.id,
            amount: booking.totalPrice,
            paymentMethod: 'stripe',
            paymentMethodId: paymentMethod.id,
            customerEmail: booking.user.email,
            customerName: booking.user.name,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (response.ok) {
          if (data.requiresAction) {
            // Handle 3D Secure authentication
            const { error: confirmError } = await stripe.confirmCardPayment(data.clientSecret);
            
            if (confirmError) {
              setError(confirmError.message || 'Payment confirmation failed');
            } else {
              setSuccess(true);
              setTimeout(() => {
                onPaymentSuccess();
                onClose();
              }, 2000);
            }
          } else {
            setSuccess(true);
            setTimeout(() => {
              onPaymentSuccess();
              onClose();
            }, 2000);
          }
        } else {
          if (response.status === 401) {
            setError('Authentication expired. Please log in again.');
          } else {
            setError(data.error || 'Payment processing failed');
          }
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          setError('Payment request timed out. Please try again.');
        } else {
          console.error('Payment fetch error:', fetchError);
          setError('Network error. Please check your connection and try again.');
        }
      } finally {
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to get cookie value
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  if (success) {
    return (
      <div className="text-center py-6">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">Payment successful! Redirecting...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Booking Details</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><span className="font-medium">Room:</span> {booking.room.number} ({booking.room.type})</p>
          <p><span className="font-medium">Check-in:</span> {new Date(booking.checkIn).toLocaleDateString()}</p>
          <p><span className="font-medium">Check-out:</span> {new Date(booking.checkOut).toLocaleDateString()}</p>
          <p><span className="font-medium">Total:</span> ${booking.totalPrice}</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information
        </label>
        <div className="border border-gray-300 rounded-md p-3">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isProcessing}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay ${booking.totalPrice}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function PaymentModal({ isOpen, onClose, booking, onPaymentSuccess }: PaymentModalProps) {
  const { isStripeAvailable } = useStripeContext();
  
  console.log('🎯 PaymentModal: Component rendered');
  console.log('🎯 PaymentModal: isStripeAvailable:', isStripeAvailable);
  console.log('🎯 PaymentModal: isOpen:', isOpen);

  if (!isOpen) return null;

  // If Stripe is not available, show a fallback message
  if (!isStripeAvailable) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 w-full max-w-md mx-auto shadow-2xl border border-gray-200/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Payment System Unavailable</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="text-center py-6">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Stripe payment system is not configured. Please contact support or try again later.
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If Stripe is available, render the payment form with Option 1 styling
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 w-full max-w-md mx-auto shadow-2xl border border-gray-200/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Complete Payment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <StripePaymentForm 
          booking={booking} 
          onPaymentSuccess={onPaymentSuccess} 
          onClose={onClose} 
        />
      </div>
    </div>
  );
} 