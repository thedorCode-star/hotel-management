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
  ArrowDownRight,
  DollarSign,
  TrendingDown
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
    occupancyRate: string;
  };
  bookings: {
    total: number;
    confirmed: number;
    pending: number;
    today: number;
    monthly: number;
  };
  revenue: {
    actual: {
      today: number;
      monthly: number;
    };
    net: {
      today: number;
      monthly: number;
    };
    refunds: {
      today: number;
      monthly: number;
    };
  };
  payments: {
    total: number;
    completed: number;
    successRate: string;
  };
  financialReconciliation?: {
    grossRevenue: number;
    totalRefunds: number;
    netRevenue: number;
    refundRate: number;
    paymentCount: number;
    refundCount: number;
    reconciliationDate: string;
  };
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
        setTimeout(() => setShowSuccess(false), 3000);
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
            <h2 className="text-xl font-semibold text-gray-900">Financial Overview</h2>
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

        {/* **CLEANED: Core Financial Metrics - 4 Key Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue Today */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Revenue Today</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {isStatsLoading ? (
                      <span className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                    ) : (
                      formatCurrency(stats?.revenue.actual.today || 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Net Monthly Revenue */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Net Monthly</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {isStatsLoading ? (
                      <span className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                    ) : (
                      formatCurrency(stats?.revenue.net.monthly || 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Total Refunds */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Monthly Refunds</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {isStatsLoading ? (
                      <span className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                    ) : (
                      formatCurrency(stats?.revenue.refunds.monthly || 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Occupancy Rate */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Bed className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Occupancy</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {isStatsLoading ? (
                      <span className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                    ) : (
                      `${stats?.rooms.occupancyRate || 0}%`
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* **NEW: Financial Reconciliation Summary - Single Source of Truth */}
        {stats?.financialReconciliation && !isStatsLoading && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Financial Reconciliation</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Single source of truth for all financial data • Last reconciled: {new Date(stats.financialReconciliation.reconciliationDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.financialReconciliation.netRevenue)}
                </div>
                <div className="text-sm text-gray-500">Net Revenue</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Gross Revenue</p>
                    <p className="text-xl font-bold text-green-900">
                      {formatCurrency(stats.financialReconciliation.grossRevenue)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {stats.financialReconciliation.paymentCount} payments
                    </p>
                  </div>
                  <div className="bg-green-200 rounded-full p-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-800">Total Refunds</p>
                    <p className="text-xl font-bold text-red-900">
                      -{formatCurrency(stats.financialReconciliation.totalRefunds)}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      {stats.financialReconciliation.refundCount} refunds
                    </p>
                  </div>
                  <div className="bg-red-200 rounded-full p-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Refund Rate</p>
                    <p className="text-xl font-bold text-blue-900">
                      {stats.financialReconciliation.refundRate}%
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      of gross revenue
                    </p>
                  </div>
                  <div className="bg-blue-200 rounded-full p-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* **CLEANED: Operational Metrics - 3 Key Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isStatsLoading ? (
                    <span className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                  ) : (
                    formatNumber(stats?.bookings.confirmed || 0)
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {stats?.bookings.today || 0} check-ins today
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Payment Success</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isStatsLoading ? (
                    <span className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                  ) : (
                    `${stats?.payments?.successRate || 0}%`
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {stats?.payments?.completed || 0} completed
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Room Status</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isStatsLoading ? (
                    <span className="inline-block animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                  ) : (
                    formatNumber(stats?.rooms.total || 0)
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {stats?.rooms.available || 0} available
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* **CLEANED: Navigation Grid - Essential Actions Only */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/dashboard/bookings"
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/60 shadow p-6 transition-all transform-gpu hover:-translate-y-1 hover:shadow-xl group"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 ring-1 ring-indigo-200/40 mb-4 transition-colors transition-transform duration-200 group-hover:bg-indigo-100 group-hover:scale-105">
              <Calendar className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bookings</h3>
            <p className="text-gray-600 leading-relaxed">
              Manage reservations and guest check-ins
            </p>
          </Link>

          <Link
            href="/dashboard/rooms"
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/60 shadow p-6 transition-all transform-gpu hover:-translate-y-1 hover:shadow-xl group"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-50 ring-1 ring-green-200/40 mb-4 transition-colors transition-transform duration-200 group-hover:bg-green-100 group-hover:scale-105">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Rooms</h3>
            <p className="text-gray-600 leading-relaxed">
              Manage room availability and status
            </p>
          </Link>

          <Link
            href="/dashboard/refunds"
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/60 shadow p-6 transition-all transform-gpu hover:-translate-y-1 hover:shadow-xl group"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 ring-1 ring-red-200/40 mb-4 transition-colors transition-transform duration-200 group-hover:bg-red-100 group-hover:scale-105">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Refunds</h3>
            <p className="text-gray-600 leading-relaxed">
              Track and manage refunds
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
              Detailed performance reports
            </p>
          </Link>

          <Link
            href="/dashboard/user"
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/60 shadow p-6 transition-all transform-gpu hover:-translate-y-1 hover:shadow-xl group"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-50 ring-1 ring-purple-200/40 mb-4 transition-colors transition-transform duration-200 group-hover:bg-purple-100 group-hover:scale-105">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile</h3>
            <p className="text-gray-600 leading-relaxed">
              Your account and booking history
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
              System configuration
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
} 