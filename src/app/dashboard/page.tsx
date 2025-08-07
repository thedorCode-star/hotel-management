"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  Calendar, 
  Users, 
  Star, 
  LogOut, 
  Plus,
  Bed,
  CreditCard,
  BarChart3,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  CheckCircle
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface DashboardStats {
  rooms: {
    total: number;
    available: number;
    occupied: number;
    maintenance: number;
    occupancyRate: string;
  };
  bookings: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    today: number;
    weekly: number;
    monthly: number;
  };
  revenue: {
    today: number;
    weekly: number;
    monthly: number;
    pending: number;
    refunded: number;
    average: number;
    netRevenue: number;
  };
  payments: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
    successRate: string;
  };
  guests: {
    uniqueThisMonth: number;
    averageStayDuration: number;
  };
  roomTypes: { [key: string]: number };
  recentBookings: any[];
  recentPayments: any[];
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        } else {
          // Redirect to login if not authenticated
          window.location.href = "/auth/login";
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        window.location.href = "/auth/login";
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const fetchStats = async () => {
    try {
      setIsStatsLoading(true);
      setError(null);
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setLastUpdated(new Date());
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000); // Hide success message after 3 seconds
      } else {
        setError("Failed to fetch dashboard statistics");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Failed to load dashboard data");
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStats();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchStats, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Hotel Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">Real-time Statistics</h2>
            {isStatsLoading && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                <span className="text-sm text-indigo-600 font-medium">Updating...</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <span className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchStats}
              disabled={isStatsLoading}
              className="flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isStatsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <p className="text-sm text-green-700 mt-1">Data refreshed successfully!</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Bed className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Rooms</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {isStatsLoading ? (
                      <span className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                    ) : (
                      formatNumber(stats?.rooms.total || 0)
                    )}
                  </p>
                </div>
              </div>
              {stats && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Available</p>
                  <p className="text-sm font-medium text-green-600">
                    {stats.rooms.available}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Bookings</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {isStatsLoading ? (
                      <span className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                    ) : (
                      formatNumber(stats?.bookings.confirmed || 0)
                    )}
                  </p>
                </div>
              </div>
              {stats && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Today</p>
                  <p className="text-sm font-medium text-blue-600">
                    {stats.bookings.today}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Guests Today</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {isStatsLoading ? (
                      <span className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                    ) : (
                      formatNumber(stats?.bookings.today || 0)
                    )}
                  </p>
                </div>
              </div>
              {stats && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">This Month</p>
                  <p className="text-sm font-medium text-purple-600">
                    {stats.guests.uniqueThisMonth}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCard className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Revenue Today</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {isStatsLoading ? (
                      <span className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                    ) : (
                      formatCurrency(stats?.revenue.today || 0)
                    )}
                  </p>
                </div>
              </div>
              {stats && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Net This Month</p>
                  <p className="text-sm font-medium text-yellow-600">
                    {formatCurrency(stats.revenue.netRevenue)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Occupancy Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.rooms.occupancyRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Success Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {isStatsLoading ? (
                      <span className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                    ) : (
                      `${stats?.payments?.successRate || 0}%`
                    )}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {isStatsLoading ? (
                      <span className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                    ) : (
                      formatCurrency(stats?.revenue?.pending || 0)
                    )}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Average Payment</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {isStatsLoading ? (
                      <span className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                    ) : (
                      formatCurrency(stats?.revenue?.average || 0)
                    )}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/dashboard/bookings"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4 group-hover:bg-indigo-200 transition-colors">
              <Calendar className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Bookings</h3>
            <p className="text-gray-600">
              View, create, and manage all hotel bookings and reservations.
            </p>
          </Link>

          <Link
            href="/dashboard/rooms"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 group-hover:bg-green-200 transition-colors">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Room Management</h3>
            <p className="text-gray-600">
              Manage room availability, status, and room information.
            </p>
          </Link>

          <Link
            href="/dashboard/guests"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 group-hover:bg-purple-200 transition-colors">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Guest Management</h3>
            <p className="text-gray-600">
              Manage guest profiles, preferences, and contact information.
            </p>
          </Link>

          <Link
            href="/dashboard/reviews"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mb-4 group-hover:bg-yellow-200 transition-colors">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reviews & Ratings</h3>
            <p className="text-gray-600">
              View and manage guest reviews and ratings for rooms and services.
            </p>
          </Link>

          <Link
            href="/dashboard/analytics"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600">
              View detailed analytics and reports on hotel performance.
            </p>
          </Link>

          <Link
            href="/dashboard/settings"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4 group-hover:bg-gray-200 transition-colors">
              <Plus className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings</h3>
            <p className="text-gray-600">
              Configure hotel settings, user permissions, and system preferences.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
} 