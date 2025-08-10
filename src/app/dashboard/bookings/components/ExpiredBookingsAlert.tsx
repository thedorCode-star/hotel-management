'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, RefreshCw, Users, Calendar, Hotel, ChevronDown, ChevronUp } from 'lucide-react';

interface ExpiredBooking {
  id: string;
  checkIn: string;
  checkOut: string;
  status: string;
  room: {
    number: string;
    type: string;
  };
  user: {
    name: string;
    email: string;
  };
}

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="relative overflow-hidden animate-slide-in-up">
    <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-3xl"></div>
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-200/20 to-orange-200/20 rounded-full -translate-y-16 translate-x-16 animate-float"></div>
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-200/20 to-amber-200/20 rounded-full translate-y-12 -translate-x-12 animate-float" style={{animationDelay: '1s'}}></div>
    
    <div className="relative glass-amber rounded-3xl p-6 mb-6 shadow-2xl shadow-amber-100/50">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 bg-amber-200 rounded-full animate-pulse"></div>
          <div>
            <div className="w-48 h-8 bg-amber-200 rounded-lg animate-pulse mb-2"></div>
            <div className="w-32 h-4 bg-amber-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="w-24 h-10 bg-amber-200 rounded-xl animate-pulse"></div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-amber-200 rounded-lg animate-pulse"></div>
              <div>
                <div className="w-8 h-8 bg-amber-200 rounded animate-pulse mb-1"></div>
                <div className="w-20 h-3 bg-amber-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Button Skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 bg-amber-200 rounded animate-pulse"></div>
          <div>
            <div className="w-40 h-4 bg-amber-200 rounded animate-pulse mb-1"></div>
            <div className="w-32 h-3 bg-amber-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="w-32 h-12 bg-amber-200 rounded-xl animate-pulse"></div>
      </div>

      {/* List Skeleton */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-amber-200/50 overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200/50">
          <div className="flex items-center justify-between">
            <div className="w-32 h-5 bg-amber-200 rounded animate-pulse"></div>
            <div className="w-20 h-8 bg-amber-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
        <div className="p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-4 last:mb-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="w-24 h-6 bg-amber-200 rounded-full animate-pulse"></div>
                    <div className="w-32 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                    <div className="w-32 h-3 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-16 h-3 bg-amber-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="w-16 h-6 bg-amber-200 rounded-full animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function ExpiredBookingsAlert() {
  const [expiredBookings, setExpiredBookings] = useState<ExpiredBooking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const checkExpiredBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/bookings/auto-checkout');
      if (response.ok) {
        const data = await response.json();
        setExpiredBookings(data.expiredBookings || []);
        setLastChecked(new Date());
        if (data.count > 0) {
          setMessage(`Found ${data.count} expired booking(s) that need attention`);
        } else {
          setMessage('No expired bookings found');
        }
      } else {
        setMessage('Failed to check expired bookings');
      }
    } catch (error) {
      console.error('Error checking expired bookings:', error);
      setMessage('Error checking expired bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const processAutoCheckout = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/bookings/auto-checkout', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessage(`Successfully processed ${data.processedCount} expired booking(s)`);
        // Refresh the list
        await checkExpiredBookings();
      } else {
        const errorData = await response.json();
        setMessage(`Failed to process auto-checkout: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error processing auto-checkout:', error);
      setMessage('Error processing auto-checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    checkExpiredBookings();
  }, []);

  // Show loading skeleton while fetching data
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Don't show anything if no expired bookings
  if (expiredBookings.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="relative overflow-hidden animate-slide-in-up">
      {/* Enhanced Background decoration with animations */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-3xl"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-200/20 to-orange-200/20 rounded-full -translate-y-16 translate-x-16 animate-float"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-200/20 to-amber-200/20 rounded-full translate-y-12 -translate-x-12 animate-float" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-orange-200/15 to-amber-200/15 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
      
      {/* Main content with enhanced glassmorphism */}
      <div className="relative glass-amber rounded-3xl p-6 mb-6 shadow-2xl shadow-amber-100/50 hover-lift">
        {/* Header Section with enhanced styling */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center space-x-3">
            <div className="relative animate-pulse-glow">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-sm opacity-60"></div>
              <AlertTriangle className="relative h-7 w-7 text-amber-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-800 to-orange-800 bg-clip-text text-transparent">
                Expired Bookings Alert
              </h3>
              <p className="text-sm text-amber-600 mt-1 mobile-text">
                {expiredBookings.length} booking{expiredBookings.length !== 1 ? 's' : ''} require{expiredBookings.length !== 1 ? '' : 's'} immediate attention
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={checkExpiredBookings}
              disabled={isLoading}
              className="group relative px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-xl hover:from-amber-200 hover:to-orange-200 disabled:opacity-50 transition-all duration-300 shadow-sm hover:shadow-md hover-lift border border-amber-200/50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 inline transition-transform duration-500 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              <span className="hidden sm:inline font-medium">Refresh</span>
              <span className="sm:hidden font-medium">↻</span>
            </button>
          </div>
        </div>

        {/* Enhanced Message Banner */}
        {message && (
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl border border-amber-200/50 animate-fade-in-scale">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <p className="text-amber-800 font-medium mobile-text">{message}</p>
            </div>
          </div>
        )}

        {/* Stats and Action Section */}
        {expiredBookings.length > 0 && (
          <div className="space-y-6">
            {/* Enhanced Quick Stats with hover effects */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200/50 hover-lift transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Users className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-800">{expiredBookings.length}</p>
                    <p className="text-sm text-amber-600 mobile-text">Expired Bookings</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200/50 hover-lift transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Hotel className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-800">{expiredBookings.length}</p>
                    <p className="text-sm text-orange-600 mobile-text">Rooms Affected</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-xl border border-red-200/50 hover-lift transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-800">Urgent</p>
                    <p className="text-sm text-red-600 mobile-text">Action Required</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-amber-700 font-medium mobile-text">
                    {expiredBookings.length} booking{expiredBookings.length !== 1 ? 's' : ''} past checkout date
                  </p>
                  <p className="text-sm text-amber-600 mobile-text">These rooms need to be marked as available</p>
                </div>
              </div>
              
              <button
                onClick={processAutoCheckout}
                disabled={isProcessing}
                className="group relative px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none hover-lift"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative flex items-center space-x-2">
                  {isProcessing ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle className="h-5 w-5" />
                  )}
                  <span className="font-semibold mobile-text">
                    {isProcessing ? 'Processing...' : 'Auto Checkout All'}
                  </span>
                </div>
              </button>
            </div>

            {/* Enhanced Bookings List */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-amber-200/50 overflow-hidden hover-lift transition-all duration-300">
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200/50">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-amber-800 mobile-text">Expired Bookings Details</h4>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center space-x-2 text-sm text-amber-600 hover:text-amber-800 transition-colors hover-lift px-3 py-1 rounded-lg hover:bg-amber-100/50"
                  >
                    <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
                    {showDetails ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              
              {showDetails && (
                <div className="max-h-80 overflow-y-auto animate-fade-in-scale">
                  {expiredBookings.map((booking, index) => (
                    <div 
                      key={booking.id} 
                      className={`p-4 border-b border-amber-100/50 last:border-b-0 transition-all duration-200 hover:bg-amber-50/50 hover-lift ${
                        index % 2 === 0 ? 'bg-white/40' : 'bg-white/20'
                      }`}
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
                            <span className="font-semibold text-gray-900 bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1 rounded-full border border-amber-200/50">
                              {booking.user.name}
                            </span>
                            <span className="text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
                              Room {booking.room.number} ({booking.room.type})
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs text-gray-500">
                            <span>Checked out: {new Date(booking.checkOut).toLocaleDateString()}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-amber-600 font-medium">Past due</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="px-3 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-full text-xs font-medium border border-amber-200/50 animate-pulse-glow">
                            EXPIRED
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Footer */}
        {lastChecked && (
          <div className="mt-6 pt-4 border-t border-amber-200/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-amber-600 gap-2">
              <span className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
                <span>Last checked: {lastChecked.toLocaleTimeString()}</span>
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline text-amber-500">Auto-refresh on page load</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
