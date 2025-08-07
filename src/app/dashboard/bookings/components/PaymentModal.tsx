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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
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

        <div className="mb-4">
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Booking Details</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Room:</span> {booking.room.number} ({booking.room.type})</p>
              <p><span className="font-medium">Guest:</span> {booking.user.name}</p>
              <p><span className="font-medium">Dates:</span> {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</p>
              <p><span className="font-medium">Total:</span> ${booking.totalPrice.toFixed(2)}</p>
            </div>
          </div>

          {isStripeConfigured ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Information
                </label>
                <div className="border border-gray-300 rounded-md p-3">
                  <CardElement options={cardElementOptions} />
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                    <p className="text-sm text-green-700">Payment successful!</p>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !isStripeConfigured}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
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