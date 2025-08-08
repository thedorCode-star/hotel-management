"use client";

import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { X, CreditCard, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

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

export default function PaymentModal({ isOpen, onClose, booking, onPaymentSuccess }: PaymentModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check if Stripe is properly configured
  const isStripeConfigured = stripe && elements;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isStripeConfigured) {
      setError('Payment system is not configured. Please contact support.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
        billing_details: {
          name: booking.user.name,
          email: booking.user.email,
        },
      });

      if (paymentMethodError) {
        setError(paymentMethodError.message || 'Payment method creation failed');
        setIsProcessing(false);
        return;
      }

      // Process payment through our API
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.totalPrice,
          paymentMethod: 'stripe',
          paymentMethodId: paymentMethod.id,
          customerEmail: booking.user.email,
          customerName: booking.user.name,
        }),
      });

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
        setError(data.error || 'Payment processing failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 w-full max-w-md mx-auto max-h-[90vh] flex flex-col shadow-2xl border border-gray-200/50 overflow-hidden">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {!isStripeConfigured && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Payment System Not Configured
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Stripe payment gateway is not configured. Please contact the administrator.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 mb-6 border border-blue-200/50">
            <h3 className="font-semibold text-blue-900 mb-2">Booking Details</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <p><span className="font-medium">Room:</span> {booking.room.number} ({booking.room.type})</p>
              <p><span className="font-medium">Guest:</span> {booking.user.name}</p>
              <p><span className="font-medium">Dates:</span> {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</p>
              <p><span className="font-medium">Total:</span> ${booking.totalPrice.toFixed(2)}</p>
            </div>
          </div>

          {isStripeConfigured ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Card Information
                </label>
                <div className="border border-gray-300 rounded-xl p-3 bg-white shadow-sm">
                  <CardElement options={cardElementOptions} />
                </div>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-2xl">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-sm text-red-700 font-medium break-words whitespace-normal leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-sm text-green-700 font-medium">Payment successful!</p>
                  </div>
                </div>
              )}

              <div className="flex space-x-4 pt-6 flex-shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !isStripeConfigured}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay ${booking.totalPrice.toFixed(2)}
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Payment processing is currently unavailable.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 