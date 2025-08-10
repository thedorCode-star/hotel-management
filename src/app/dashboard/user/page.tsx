'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogIn, AlertCircle, Info } from 'lucide-react';
import PaymentForm from '../payments/components/PaymentForm';
import ReviewForm from '../reviews/components/ReviewForm';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Room {
  id: string;
  number: string;
  type: string;
  price: number;
  averageRating?: number;
  reviewCount?: number;
}

interface Booking {
  id: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  room: Room;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  processedAt: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
  room: Room;
}

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user profile
      const userResponse = await fetch('/api/auth/me');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);
        setIsAuthenticated(true);
        
        // Only fetch other data if user is authenticated
        await Promise.all([
          fetchUserBookings(),
          fetchUserPayments(),
          fetchUserReviews()
        ]);
      } else {
        setIsAuthenticated(false);
        setError('Authentication required');
      }
    } catch (error) {
      setIsAuthenticated(false);
      setError('Failed to load user data');
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserBookings = async () => {
    try {
      const bookingsResponse = await fetch('/api/bookings?userId=current');
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchUserPayments = async () => {
    try {
      const paymentsResponse = await fetch('/api/payments?userId=current');
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData.payments || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchUserReviews = async () => {
    try {
      const reviewsResponse = await fetch('/api/reviews?userId=current');
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setSelectedBooking(null);
    fetchUserData();
  };

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    setSelectedRoom(null);
    fetchUserReviews();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'CHECKED_IN':
        return 'bg-blue-100 text-blue-800';
      case 'CHECKED_OUT':
        return 'bg-gray-100 text-gray-800';
      case 'REFUNDED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysBetween = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show authentication required message
  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">Access your personal dashboard and booking information</p>
          </div>

          {/* Authentication Required Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              To view your profile, bookings, and payment history, you need to be logged in.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <LogIn className="w-5 h-5" />
                <span>Login to Your Account</span>
              </button>
              
              <button
                onClick={() => router.push('/register')}
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Create New Account
              </button>
            </div>
          </div>

          {/* Information Card */}
          <div className="mt-6 bg-blue-50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">What you'll see after login:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Your personal information and account details</li>
                  <li>• Complete booking history and current reservations</li>
                  <li>• Payment history and transaction records</li>
                  <li>• Reviews you've written for rooms</li>
                  <li>• Quick actions for payments and reviews</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* User Welcome */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600">{user?.email}</p>
        <div className="mt-2 text-sm text-blue-600">
          Role: {user?.role}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Bookings</h3>
          <p className="text-3xl font-bold text-blue-600">{bookings.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Bookings</h3>
          <p className="text-3xl font-bold text-green-600">
            {bookings.filter(b => b.status === 'CONFIRMED').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Spent</h3>
          <p className="text-3xl font-bold text-purple-600">
            ${bookings.reduce((sum, b) => sum + b.totalPrice, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Reviews Written</h3>
          <p className="text-3xl font-bold text-orange-600">{reviews.length}</p>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
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
              {bookings.slice(0, 5).map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${booking.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowPaymentForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Pay Now
                        </button>
                      )}
                      {booking.status === 'COMPLETED' && (
                        <button
                          onClick={() => {
                            setSelectedRoom(booking.room);
                            setShowReviewForm(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          Write Review
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {bookings.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No bookings found.</p>
          </div>
        )}
      </div>

      {/* Recent Payments */}
      {payments.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Payments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.slice(0, 5).map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.processedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Reviews */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Reviews</h2>
          </div>
          <div className="p-6 space-y-4">
            {reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      Room {review.room.number}
                    </span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-sm ${
                            star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    review.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    review.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {review.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{review.comment}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {formatDate(review.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showPaymentForm && selectedBooking && (
        <PaymentForm
          booking={selectedBooking}
          onClose={() => {
            setShowPaymentForm(false);
            setSelectedBooking(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {showReviewForm && selectedRoom && (
        <ReviewForm
          room={selectedRoom}
          onClose={() => {
            setShowReviewForm(false);
            setSelectedRoom(null);
          }}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
} 