'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BookingForm from './components/BookingForm';
import PaymentModal from './components/PaymentModal';
import BookingActions from './components/BookingActions';
import { CreditCard, DollarSign } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Room {
  id: string;
  number: string;
  type: string;
  price: number;
  status: string;
}

interface Booking {
  id: string;
  roomId: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  actualCheckOut?: string;
  totalPrice: number;
  status: string;
  paidAmount: number;
  refundAmount: number;
  paymentRequired: boolean;
  notes?: string;
  createdAt: string;
  user: User;
  room: Room;
}

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateRange: 'all',
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, filters]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/bookings');
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      setError('Failed to load bookings');
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = bookings;

    if (filters.status !== 'all') {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }

    if (filters.search) {
      filtered = filtered.filter(booking =>
        booking.user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        booking.user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        booking.room.number.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (filters.dateRange) {
        case 'today':
          filtered = filtered.filter(booking => {
            const checkIn = new Date(booking.checkIn);
            return checkIn.toDateString() === today.toDateString();
          });
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(booking => {
            const checkIn = new Date(booking.checkIn);
            return checkIn >= weekAgo;
          });
          break;
        case 'month':
          const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
          filtered = filtered.filter(booking => {
            const checkIn = new Date(booking.checkIn);
            return checkIn >= monthAgo;
          });
          break;
      }
    }

    setFilteredBookings(filtered);
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update booking');
      }

      await fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      alert(error instanceof Error ? error.message : 'Failed to update booking');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchBookings();
      } else {
        setError('Failed to delete booking');
      }
    } catch (error) {
      setError('Failed to delete booking');
      console.error('Error deleting booking:', error);
    }
  };

  const handlePaymentClick = (booking: Booking) => {
    setSelectedBookingForPayment(booking);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    fetchBookings(); // Refresh bookings to show updated status
    setShowPaymentModal(false);
    setSelectedBookingForPayment(null);
  };

  const checkPaymentStatus = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/payments?bookingId=${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        return data.payments.length > 0;
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
    return false;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysBetween = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create New Booking
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by guest name, email, or room number..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: 'all', search: '', dateRange: 'all' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {booking.user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Room {booking.room.number}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.room.type}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {getDaysBetween(booking.checkIn, booking.checkOut)} nights
                    </div>
                    {booking.actualCheckOut && (
                      <div className="text-xs text-purple-600">
                        Checked out: {formatDate(booking.actualCheckOut)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>Total: ${booking.totalPrice.toFixed(2)}</div>
                      {booking.paidAmount > 0 && (
                        <div className="text-green-600">Paid: ${booking.paidAmount.toFixed(2)}</div>
                      )}
                      {booking.refundAmount > 0 && (
                        <div className="text-purple-600">Refunded: ${booking.refundAmount.toFixed(2)}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <BookingActions booking={booking} onAction={fetchBookings} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingBooking(booking);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      
                      {/* Payment Button */}
                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => handlePaymentClick(booking)}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Pay
                        </button>
                      )}
                      
                      {/* Legacy status buttons for backward compatibility */}
                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'PAID')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Confirm
                        </button>
                      )}
                      {booking.status === 'PAID' && (
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Complete
                        </button>
                      )}
                      {(booking.status === 'PENDING' || booking.status === 'PAID') && (
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      )}
                      {(booking.status === 'PENDING' || booking.status === 'CANCELLED') && (
                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredBookings.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No bookings found matching your criteria.</p>
        </div>
      )}

      {showForm && (
        <BookingForm
          booking={editingBooking || undefined}
          mode={editingBooking ? 'edit' : 'create'}
          onClose={() => {
            setShowForm(false);
            setEditingBooking(null);
            fetchBookings();
          }}
        />
      )}

      {showPaymentModal && selectedBookingForPayment && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedBookingForPayment(null);
          }}
          booking={selectedBookingForPayment}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
} 