'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BookingForm from './components/BookingForm';
import PaymentModal from './components/PaymentModal';
import BookingActions from './components/BookingActions';
import ExpiredBookingsAlert from './components/ExpiredBookingsAlert';
import { 
  CreditCard, 
  DollarSign, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Building, 
  Clock,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  Info
} from 'lucide-react';

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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchRefunds(); // Also fetch refunds for financial summary
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

  const fetchRefunds = async () => {
    try {
      setIsRefundsLoading(true);
      const response = await fetch('/api/refunds');
      if (response.ok) {
        const data = await response.json();
        const totalRefundAmount = data.refunds?.reduce((sum: number, refund: any) => sum + refund.amount, 0) || 0;
        setTotalRefunds(totalRefundAmount);
      } else {
        console.error('Failed to fetch refunds for financial summary');
      }
    } catch (error) {
      console.error('Error fetching refunds:', error);
    } finally {
      setIsRefundsLoading(false);
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
      // **ENHANCED: Payment validation for COMPLETED status**
      if (newStatus === 'COMPLETED') {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking && booking.paidAmount < booking.totalPrice) {
          const required = booking.totalPrice.toFixed(2);
          const paid = booking.paidAmount.toFixed(2);
          const shouldProceed = confirm(`Payment incomplete. Required: $${required}, Paid: $${paid}. Would you like to process payment now?`);
          if (shouldProceed) {
            handlePaymentClick(booking);
            return;
          } else {
            return;
          }
        }
      }

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update booking status');
        return;
      }

      fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError('Failed to update booking status');
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

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const totalBookingsValue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
  const confirmedBookingsValue = bookings.filter(b => b.status === 'PAID').reduce((sum, booking) => sum + booking.totalPrice, 0);
  const pendingBookingsValue = bookings.filter(b => b.status === 'PENDING').reduce((sum, booking) => sum + booking.totalPrice, 0);

  // Fetch real refund data for accurate financial calculations
  const [totalRefunds, setTotalRefunds] = useState(0);
  const [isRefundsLoading, setIsRefundsLoading] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mb-4 animate-shimmer"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-48 animate-shimmer"></div>
          </div>
          
          {/* Filters Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-shimmer"></div>
                  <div className="h-10 bg-gray-200 rounded-lg w-full animate-shimmer"></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Table Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="h-4 bg-gray-200 rounded w-32 animate-shimmer"></div>
            </div>
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-12 bg-gray-200 rounded-lg w-12 animate-shimmer"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32 animate-shimmer"></div>
                    <div className="h-3 bg-gray-200 rounded w-24 animate-shimmer"></div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-shimmer"></div>
                    <div className="h-3 bg-gray-200 rounded w-16 animate-shimmer"></div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-28 animate-shimmer"></div>
                    <div className="h-3 bg-gray-200 rounded w-20 animate-shimmer"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header Section */}
        <div className="mb-8 animate-slide-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Booking Management
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Manage all hotel bookings, payments, and guest information
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="group relative inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
              Create New Booking
            </button>
          </div>
        </div>

        {/* Expired Bookings Alert */}
        <div className="mb-8">
          <ExpiredBookingsAlert />
        </div>

        {/* Enhanced Error Display */}
        {error && (
          <div className="mb-8 animate-slide-in-up">
            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <X className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-red-800">Error</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
                <button
                  onClick={() => setError('')}
                  className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Filters Section */}
        <div className="mb-8 animate-slide-in-up">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden p-4 border-b border-gray-100">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span className="flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters & Search
                </span>
                {showMobileFilters ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Filters Content */}
            <div className={`lg:block ${showMobileFilters ? 'block' : 'hidden'}`}>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Search Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center">
                      <Search className="w-4 h-4 mr-2 text-gray-500" />
                      Search
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Guest, email, or room..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-500" />
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white appearance-none cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="CHECKED_IN">Checked In</option>
                      <option value="CHECKED_OUT">Checked Out</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="REFUNDED">Refunded</option>
                    </select>
                  </div>

                  {/* Date Range Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      Date Range
                    </label>
                    <select
                      value={filters.dateRange}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white appearance-none cursor-pointer"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>

                  {/* Clear Filters Button */}
                  <div className="flex items-end">
                    <button
                      onClick={() => setFilters({ status: 'all', search: '', dateRange: 'all' })}
                      className="w-full px-6 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:shadow-sm"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* **FIXED: Financial Summary with Correct Calculations */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Financial Summary</h3>
            <div className="text-sm text-gray-500">
              Based on actual payments and refunds
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Total Bookings</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(totalBookingsValue)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {bookings.length} bookings
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Confirmed Revenue</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(confirmedBookingsValue)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {bookings.filter(b => b.status === 'PAID').length} paid
                  </p>
                </div>
                <div className="bg-blue-100 rounded-full p-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800">Pending Revenue</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {formatCurrency(pendingBookingsValue)}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    {bookings.filter(b => b.status === 'PENDING').length} pending
                  </p>
                </div>
                <div className="bg-orange-100 rounded-full p-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-800">Refund Impact</p>
                  <p className="text-2xl font-bold text-red-900">
                    {isRefundsLoading ? (
                      <span className="text-lg">Loading...</span>
                    ) : (
                      `-${formatCurrency(totalRefunds)}`
                    )}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {isRefundsLoading ? 'Fetching data...' : 'From Refund model'}
                  </p>
                </div>
                <div className="bg-red-100 rounded-full p-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </div>
          </div>
          
          {/* **NEW: Financial Reconciliation Note */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                <Info className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  <strong>Financial Note:</strong> Refund amounts are now calculated exclusively from the Refund model to prevent double-counting. 
                  The <code className="bg-gray-200 px-1 rounded">booking.refundAmount</code> field is deprecated for financial reporting.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bookings Table */}
        <div className="animate-slide-in-up" style={{animationDelay: '0.1s'}}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Table Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Bookings ({filteredBookings.length})
                </h2>
                <div className="text-sm text-gray-600">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        Guest
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-2 text-gray-400" />
                        Room
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        Dates
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                        Payment
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        Status
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredBookings.map((booking, index) => (
                    <tr 
                      key={booking.id} 
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group"
                      style={{animationDelay: `${index * 0.05}s`}}
                    >
                      {/* Guest Column */}
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3 group-hover:scale-110 transition-transform duration-200">
                            {booking.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                              {booking.user.name}
                            </div>
                            <div className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
                              {booking.user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Room Column */}
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-sm mr-3 group-hover:scale-110 transition-transform duration-200">
                            {booking.room.number.slice(-2)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              Room {booking.room.number}
                            </div>
                            <div className="text-sm text-gray-500 capitalize">
                              {booking.room.type}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Dates Column */}
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {getDaysBetween(booking.checkIn, booking.checkOut)} nights
                          </div>
                          {booking.actualCheckOut && (
                            <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full inline-flex items-center">
                              <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>
                              Checked out: {formatDate(booking.actualCheckOut)}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Payment Column */}
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <div className="text-sm font-semibold text-gray-900">
                            Total: ${booking.totalPrice.toFixed(2)}
                          </div>
                          {(booking.paidAmount > 0 || ['PAID', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED'].includes(booking.status)) && (
                            <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full inline-flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              Paid: ${booking.paidAmount > 0 ? booking.paidAmount.toFixed(2) : booking.totalPrice.toFixed(2)}
                            </div>
                          )}
                          {booking.refundAmount > 0 && (
                            <div className="text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full inline-flex items-center">
                              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                              Refunded: ${booking.refundAmount.toFixed(2)}
                            </div>
                          )}
                          {booking.status === 'CHECKED_IN' && booking.paidAmount === 0 && (
                            <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full inline-flex items-center">
                              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                              Payment not recorded
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-6 py-5">
                        <BookingActions 
                          booking={booking} 
                          onAction={fetchBookings}
                          onPaymentRequest={handlePaymentClick}
                        />
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setEditingBooking(booking);
                              setShowForm(true);
                            }}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Edit
                          </button>
                          
                          {/* Payment Button */}
                          {booking.status === 'PENDING' && (
                            <button
                              onClick={() => handlePaymentClick(booking)}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 hover:text-green-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            >
                              <CreditCard className="w-4 h-4 mr-1" />
                              Pay
                            </button>
                          )}
                          
                          {/* Legacy status buttons for backward compatibility */}
                          {booking.status === 'PENDING' && (
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'PAID')}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 hover:text-green-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            >
                              Confirm
                            </button>
                          )}
                          
                          {/* Complete button only shows when payment is completed */}
                          {booking.status === 'PAID' && booking.paidAmount >= booking.totalPrice && (
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                              Complete
                            </button>
                          )}
                          
                          {/* Payment required warning for PAID status without full payment */}
                          {booking.status === 'PAID' && booking.paidAmount < booking.totalPrice && (
                            <span className="inline-flex items-center px-3 py-2 text-xs text-orange-600 bg-orange-50 rounded-lg">
                              ⚠️ Payment incomplete
                            </span>
                          )}
                          
                          {(booking.status === 'PENDING' || booking.status === 'PAID') && (
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                              Cancel
                            </button>
                          )}
                          {(booking.status === 'PENDING' || booking.status === 'CANCELLED') && (
                            <button
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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

            {/* Empty State */}
            {filteredBookings.length === 0 && !isLoading && (
              <div className="text-center py-16 px-6">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-500 mb-6">No bookings match your current search criteria.</p>
                <button
                  onClick={() => setFilters({ status: 'all', search: '', dateRange: 'all' })}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
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
    </div>
  );
} 