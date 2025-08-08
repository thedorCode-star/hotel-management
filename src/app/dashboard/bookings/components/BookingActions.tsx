'use client';

import { useState } from 'react';
import { LogIn, LogOut, CreditCard, DollarSign, AlertCircle } from 'lucide-react';

interface BookingActionsProps {
  booking: {
    id: string;
    status: string;
    checkIn: string;
    checkOut: string;
    actualCheckOut?: string;
    totalPrice: number;
    paidAmount: number;
    refundAmount: number;
    room: {
      number: string;
    };
  };
  onAction: () => void;
  onPaymentRequest?: (booking: any) => void; // **NEW: Callback for payment requests**
}

export default function BookingActions({ booking, onAction, onPaymentRequest }: BookingActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutReason, setCheckoutReason] = useState('');
  const [checkoutDate, setCheckoutDate] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentIncompleteMessage, setPaymentIncompleteMessage] = useState('');

  const handleCheckIn = async () => {
    // **ENHANCED: Payment validation before check-in**
    if (booking.paidAmount < booking.totalPrice) {
      const required = booking.totalPrice.toFixed(2);
      const paid = booking.paidAmount.toFixed(2);
      setPaymentIncompleteMessage(`Payment incomplete. Required: $${required}, Paid: $${paid}. Please process payment first.`);
      setShowPaymentModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: 'Guest checked in' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to check in');
        return;
      }

      alert('Check-in successful!');
      onAction();
    } catch (error) {
      console.error('Error checking in:', error);
      alert('Failed to check in');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayNow = () => {
    setShowPaymentModal(false);
    // **ENHANCED: Use the payment request callback to open the existing payment modal**
    if (onPaymentRequest) {
      onPaymentRequest(booking);
    } else {
      // Fallback: show alert if no payment handler is provided
      const amount = booking.totalPrice - booking.paidAmount;
      alert(`Redirecting to payment for $${amount.toFixed(2)}. Please complete the payment to proceed with check-in.`);
    }
  };

  const handleCheckOut = async () => {
    if (!checkoutDate) {
      alert('Please select a check-out date');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actualCheckOut: checkoutDate,
          reason: checkoutReason
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to check out');
        return;
      }

      const result = await response.json();
      alert(`Check-out successful! Refund amount: $${result.refundAmount.toFixed(2)}`);
      setShowCheckoutModal(false);
      setCheckoutReason('');
      setCheckoutDate('');
      onAction();
    } catch (error) {
      console.error('Error checking out:', error);
      alert('Failed to check out');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefund = async () => {
    try {
      const refundAmount = booking.refundAmount || 0;
      const totalPaid = booking.paidAmount || 0;
      const availableForRefund = totalPaid - refundAmount;

      if (availableForRefund <= 0) {
        alert('No amount available for refund');
        return;
      }

      const amount = prompt(`Enter refund amount (max: $${availableForRefund.toFixed(2)}):`, availableForRefund.toString());
      if (!amount || parseFloat(amount) <= 0) return;

      const refundAmountNum = parseFloat(amount);
      if (refundAmountNum > availableForRefund) {
        alert(`Refund amount cannot exceed $${availableForRefund.toFixed(2)}`);
        return;
      }

      const refundMethod = prompt('Enter refund method (STRIPE/CASH/BANK_TRANSFER/CREDIT_TO_ACCOUNT):', 'CASH');
      if (!refundMethod) return;

      const notes = prompt('Enter refund notes (optional):', '');

      const response = await fetch('/api/refunds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: refundAmountNum,
          refundMethod: refundMethod.toUpperCase(),
          notes,
        }),
      });

      if (response.ok) {
        alert('Refund created successfully!');
        onAction();
      } else {
        const error = await response.json();
        alert(`Failed to create refund: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating refund:', error);
      alert('Failed to create refund');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'PAYMENT_PENDING': return 'text-orange-600 bg-orange-100';
      case 'PAID': return 'text-blue-600 bg-blue-100';
      case 'CHECKED_IN': return 'text-green-600 bg-green-100';
      case 'CHECKED_OUT': return 'text-purple-600 bg-purple-100';
      case 'COMPLETED': return 'text-gray-600 bg-gray-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      case 'REFUNDED': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <AlertCircle className="h-4 w-4" />;
      case 'PAYMENT_PENDING': return <CreditCard className="h-4 w-4" />;
      case 'PAID': return <DollarSign className="h-4 w-4" />;
      case 'CHECKED_IN': return <LogIn className="h-4 w-4" />;
      case 'CHECKED_OUT': return <LogOut className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-2">
      {/* Status Display */}
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
        {getStatusIcon(booking.status)}
        <span className="ml-1">{booking.status.replace('_', ' ')}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Check-in Button */}
        {booking.status === 'PAID' && (
          <button
            onClick={handleCheckIn}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
          >
            <LogIn className="h-3 w-3 mr-1" />
            Check In
          </button>
        )}

        {/* Check-out Button */}
        {booking.status === 'CHECKED_IN' && (
          <button
            onClick={() => setShowCheckoutModal(true)}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 disabled:opacity-50"
          >
            <LogOut className="h-3 w-3 mr-1" />
            Check Out
          </button>
        )}

        {/* Payment Status */}
        {booking.paidAmount > 0 && (
          <div className="text-xs text-gray-600">
            Paid: ${booking.paidAmount.toFixed(2)}
          </div>
        )}

        {/* Refund Status */}
        {booking.refundAmount > 0 && (
          <div className="text-xs text-green-600">
            Refunded: ${booking.refundAmount.toFixed(2)}
          </div>
        )}

        {/* Refund Button */}
        {['PAID', 'CHECKED_IN', 'COMPLETED'].includes(booking.status) && booking.paidAmount > 0 && (
          <button
            onClick={handleRefund}
            className="text-purple-600 hover:text-purple-900 flex items-center"
            title="Process refund"
          >
            <DollarSign className="h-4 w-4 mr-1" />
            Refund
          </button>
        )}
      </div>

      {/* Check-out Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 w-full max-w-md mx-auto max-h-[90vh] flex flex-col shadow-2xl border border-gray-200/50 overflow-hidden">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-900">Early Check-out</h3>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <span className="text-gray-500 font-bold">×</span>
              </button>
            </div>
            
            <div className="flex-1 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Check-out Date *
                </label>
                <input
                  type="date"
                  value={checkoutDate}
                  onChange={(e) => setCheckoutDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(booking.checkOut).toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={checkoutReason}
                  onChange={(e) => setCheckoutReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm resize-none"
                  placeholder="Reason for early check-out..."
                />
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200/50 overflow-hidden">
                <p className="text-sm font-medium text-blue-800 leading-relaxed break-words whitespace-normal">
                  <strong>Note:</strong> Early check-out will automatically calculate and process refunds for unused days.
                </p>
              </div>
            </div>

            <div className="flex space-x-4 pt-6 flex-shrink-0">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckOut}
                disabled={isLoading || !checkoutDate}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Processing...' : 'Check Out'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Incomplete Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 w-full max-w-md mx-auto max-h-[90vh] flex flex-col shadow-2xl border border-gray-200/50 overflow-hidden">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-900">Payment Incomplete</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <span className="text-gray-500 font-bold">×</span>
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-200/50 mb-6 overflow-hidden">
              <p className="text-sm font-medium text-orange-800 break-words whitespace-normal leading-relaxed">
                {paymentIncompleteMessage}
              </p>
            </div>
            
            <div className="flex space-x-4 flex-shrink-0">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handlePayNow}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 