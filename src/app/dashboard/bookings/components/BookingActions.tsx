'use client';

import { useState } from 'react';
import { CheckIn, CheckOut, CreditCard, DollarSign, AlertCircle } from 'lucide-react';

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
}

export default function BookingActions({ booking, onAction }: BookingActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutReason, setCheckoutReason] = useState('');
  const [checkoutDate, setCheckoutDate] = useState('');

  const handleCheckIn = async () => {
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
      case 'CHECKED_IN': return <CheckIn className="h-4 w-4" />;
      case 'CHECKED_OUT': return <CheckOut className="h-4 w-4" />;
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
            <CheckIn className="h-3 w-3 mr-1" />
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
            <CheckOut className="h-3 w-3 mr-1" />
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
      </div>

      {/* Check-out Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Early Check-out</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out Date *
                </label>
                <input
                  type="date"
                  value={checkoutDate}
                  onChange={(e) => setCheckoutDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(booking.checkOut).toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (Optional)
                </label>
                <textarea
                  value={checkoutReason}
                  onChange={(e) => setCheckoutReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Reason for early check-out..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-600">
                  <strong>Note:</strong> Early check-out will automatically calculate and process refunds for unused days.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckOut}
                disabled={isLoading || !checkoutDate}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Check Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 