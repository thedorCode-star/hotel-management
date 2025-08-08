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
  CheckCircle,
  ArrowDownRight
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
    checkInToday: number;
    stayingToday: number;
    bookingsMadeToday: number;
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
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Bed className="h-5 w-5 text-indigo-600" />
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
                  <p className="text-xs text-gray-500 mb-1">Available</p>
                  <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 text-green-700 px-2.5 py-0.5 text-xs font-medium">
                    {stats.rooms.available}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600" />
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
                  <p className="text-xs text-gray-500 mb-1">Today</p>
                  <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-0.5 text-xs font-medium">
                    {stats.bookings.today}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
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
                  <p className="text-xs text-gray-500 mb-1">This Month</p>
                  <span className="inline-flex items-center rounded-full bg-purple-50 border border-purple-200 text-purple-700 px-2.5 py-0.5 text-xs font-medium">
                    {stats.guests.uniqueThisMonth}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500 overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-yellow-600" />
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
                  {/* Revenue Breakdown */}
                  {stats && !isStatsLoading && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Check-ins:</span>
                        <span className="text-green-600 font-medium">
                          {formatCurrency(stats.revenue.checkInToday)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Staying:</span>
                        <span className="text-blue-600 font-medium">
                          {formatCurrency(stats.revenue.stayingToday)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">New bookings:</span>
                        <span className="text-purple-600 font-medium">
                          {formatCurrency(stats.revenue.bookingsMadeToday)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {stats && (
              <div className="mt-6">
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-4 border border-yellow-200/50 w-full md:w-auto">
                  <p className="text-xs text-gray-500">Net This Month</p>
                  <p className="text-xl font-semibold text-yellow-600">{formatCurrency(stats.revenue.netRevenue)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Stats Row */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Occupancy Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.rooms.occupancyRate}%</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
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
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
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
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
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
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </div>

            {/* **FIXED: Refunded Revenue Display - Shows as negative impact */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Refunds This Month</p>
                  <p className="text-2xl font-semibold text-red-600">
                    {isStatsLoading ? (
                      <span className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                    ) : (
                      `-${formatCurrency(stats?.revenue?.refunded || 0)}`
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Deducted from revenue</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <ArrowDownRight className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comprehensive Revenue Insights */}
        {stats && !isStatsLoading && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Insights</h3>
              <div className="text-sm text-gray-500">
                <details className="cursor-pointer">
                  <summary className="hover:text-gray-700">What do these metrics mean?</summary>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs space-y-1">
                    <p><strong>Check-ins Today:</strong> Revenue from guests checking in today</p>
                    <p><strong>Guests Staying:</strong> Revenue from guests currently staying (check-in ≤ today ≤ check-out)</p>
                    <p><strong>New Bookings:</strong> Revenue from bookings created today</p>
                    <p><strong>Total Processed:</strong> Actual payments processed today</p>
                  </div>
                </details>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Check-ins Today</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(stats.revenue.checkInToday)}
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
                    <p className="text-sm font-medium text-blue-800">Guests Staying</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(stats.revenue.stayingToday)}
                    </p>
                  </div>
                  <div className="bg-blue-100 rounded-full p-2">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-800">New Bookings</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {formatCurrency(stats.revenue.bookingsMadeToday)}
                    </p>
                  </div>
                  <div className="bg-purple-100 rounded-full p-2">
                    <Plus className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Total Processed</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {formatCurrency(stats.revenue.today)}
                    </p>
                  </div>
                  <div className="bg-yellow-100 rounded-full p-2">
                    <CreditCard className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/dashboard/bookings"
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/60 shadow p-6 transition-all transform-gpu hover:-translate-y-1 hover:shadow-xl group"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 ring-1 ring-indigo-200/40 mb-4 transition-colors transition-transform duration-200 group-hover:bg-indigo-100 group-hover:scale-105">
              <Calendar className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Bookings</h3>
            <p className="text-gray-600 leading-relaxed">
              View, create, and manage all hotel bookings and reservations.
            </p>
          </Link>

          <Link
            href="/dashboard/rooms"
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/60 shadow p-6 transition-all transform-gpu hover:-translate-y-1 hover:shadow-xl group"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-50 ring-1 ring-green-200/40 mb-4 transition-colors transition-transform duration-200 group-hover:bg-green-100 group-hover:scale-105">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Room Management</h3>
            <p className="text-gray-600 leading-relaxed">
              Manage room availability, status, and room information.
            </p>
          </Link>

          <Link
            href="/dashboard/guests"
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/60 shadow p-6 transition-all transform-gpu hover:-translate-y-1 hover:shadow-xl group"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-50 ring-1 ring-purple-200/40 mb-4 transition-colors transition-transform duration-200 group-hover:bg-purple-100 group-hover:scale-105">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Guest Management</h3>
            <p className="text-gray-600 leading-relaxed">
              Manage guest profiles, preferences, and contact information.
            </p>
          </Link>

          <Link
            href="/dashboard/reviews"
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/60 shadow p-6 transition-all transform-gpu hover:-translate-y-1 hover:shadow-xl group"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-50 ring-1 ring-yellow-200/40 mb-4 transition-colors transition-transform duration-200 group-hover:bg-yellow-100 group-hover:scale-105">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reviews & Ratings</h3>
            <p className="text-gray-600 leading-relaxed">
              View and manage guest reviews and ratings for rooms and services.
            </p>
          </Link>

          <Link
            href="/dashboard/analytics"
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/60 shadow p-6 transition-all transform-gpu hover:-translate-y-1 hover:shadow-xl group"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 ring-1 ring-blue-200/40 mb-4 transition-colors transition-transform duration-200 group-hover:bg-blue-100 group-hover:scale-105">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600 leading-relaxed">
              View detailed analytics and reports on hotel performance.
            </p>
          </Link>

          <Link
            href="/dashboard/settings"
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/60 shadow p-6 transition-all transform-gpu hover:-translate-y-1 hover:shadow-xl group"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 ring-1 ring-gray-200/40 mb-4 transition-colors transition-transform duration-200 group-hover:bg-gray-100 group-hover:scale-105">
              <Plus className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings</h3>
            <p className="text-gray-600 leading-relaxed">
              Configure hotel settings, user permissions, and system preferences.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
} 