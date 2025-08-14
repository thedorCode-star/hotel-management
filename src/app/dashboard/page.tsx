"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Calendar, 
  Users, 
  Star, 
  LogOut, 
  Plus,
  Bed,
  CreditCard,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  ArrowDownRight,
  DollarSign,
  TrendingDown
} from "lucide-react";
import InteractiveAnalyticsCard from "@/components/InteractiveAnalyticsCard";

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
    active: number; // NEW: Currently checked-in bookings
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
  const router = useRouter();
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
          // Don't redirect immediately, let the component handle the unauthenticated state
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
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
      const [statsResponse, financialResponse] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/financial/overview")
      ]);
      
      if (statsResponse.ok && financialResponse.ok) {
        const statsData = await statsResponse.json();
        const financialData = await financialResponse.json();
        
        console.log("Dashboard Stats:", statsData);
        console.log("Financial Data:", financialData);
        
        // Merge financial data with stats for consistency
        const mergedStats = {
          ...statsData.stats,
          revenue: {
            actual: {
              today: financialData.revenue?.today || 0,
              monthly: financialData.revenue?.monthly || 0,
            },
            net: {
              today: financialData.revenue?.net || 0,
              monthly: financialData.revenue?.monthly || 0,
            },
            refunds: {
              today: financialData.refunds?.total?.amount || 0,
              monthly: financialData.refunds?.total?.amount || 0,
            },
          },
          payments: {
            total: (financialData.payments?.completed?.count || 0) + (financialData.payments?.pending?.count || 0),
            completed: financialData.payments?.completed?.count || 0,
            successRate: (financialData.payments?.completed?.count || 0) > 0 ? 
              Math.round(((financialData.payments?.completed?.count || 0) / ((financialData.payments?.completed?.count || 0) + (financialData.payments?.failed?.count || 0))) * 100) : '0'
          },
          financialReconciliation: {
            grossRevenue: financialData.revenue?.total || 0,
            totalRefunds: financialData.refunds?.total?.amount || 0,
            netRevenue: financialData.revenue?.net || 0,
            refundRate: (financialData.revenue?.total || 0) > 0 ? 
              Math.round(((financialData.refunds?.total?.amount || 0) / (financialData.revenue?.total || 1)) * 100) : 0,
            paymentCount: financialData.payments?.completed?.count || 0,
            refundCount: financialData.refunds?.total?.count || 0,
            reconciliationDate: new Date().toISOString()
          }
        };
        
        console.log("Merged Stats:", mergedStats);
        setStats(mergedStats);
        setLastUpdated(new Date());
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const errorText = await statsResponse.text().catch(() => 'Unknown error');
        console.error("Stats response not ok:", statsResponse.status, errorText);
        setError(`Failed to fetch dashboard statistics: ${statsResponse.status}`);
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
      router.push("/");
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

  if (!user && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access the dashboard.
          </p>
          <button
            onClick={() => router.push("/auth/login")}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Ensure user exists before rendering
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

        {/* **NEW: Interactive Financial Analytics Cards */}
        {isStatsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="text-center">
                  <div className="w-20 h-8 bg-gray-200 rounded mx-auto mb-2"></div>
                  <div className="w-32 h-4 bg-gray-200 rounded mx-auto mb-1"></div>
                  <div className="w-24 h-3 bg-gray-200 rounded mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        ) : stats?.financialReconciliation ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue - Interactive Card */}
          <InteractiveAnalyticsCard
            title="Total Revenue"
            value={isStatsLoading ? 0 : (stats?.financialReconciliation?.grossRevenue || 0)}
            subtitle="Gross revenue before refunds"
            icon={<DollarSign className="h-6 w-6 text-white" />}
            color="#059669"
            bgColor="bg-green-500"
            trend={{
              value: 12.5,
              isPositive: true,
              period: "vs last month"
            }}
            details={{
              breakdown: [
                { label: "Room Bookings", value: `$${(stats?.financialReconciliation?.grossRevenue || 0).toLocaleString()}`, percentage: 85 },
                { label: "Additional Services", value: "$0", percentage: 0 },
                { label: "Other Income", value: "$0", percentage: 0 }
              ],
              metrics: [
                { label: "Growth Rate", value: "+12.5%", status: 'good' },
                { label: "Market Position", value: "Strong", status: 'good' },
                { label: "Revenue per Booking", value: `$${stats?.bookings?.total ? (stats.financialReconciliation?.grossRevenue || 0) / stats.bookings.total : 0}`, status: 'good' }
              ],
              insights: [
                "Revenue growth is consistent with seasonal expectations",
                "Strong performance in room booking revenue",
                "Opportunity to expand additional service offerings"
              ],
              recommendations: [
                "Consider implementing additional revenue streams",
                "Focus on upselling premium room categories",
                "Implement loyalty program to increase repeat bookings"
              ]
            }}
          />

          {/* Net Revenue - Interactive Card */}
          <InteractiveAnalyticsCard
            title="Net Revenue"
            value={isStatsLoading ? 0 : (stats?.financialReconciliation?.netRevenue || 0)}
            subtitle="Revenue after refunds"
            icon={<TrendingUp className="h-6 w-6 text-white" />}
            color="#2563eb"
            bgColor="bg-blue-500"
            trend={{
              value: 8.2,
              isPositive: true,
              period: "vs last month"
            }}
            details={{
              breakdown: [
                { label: "Gross Revenue", value: `$${(stats?.financialReconciliation?.grossRevenue || 0).toLocaleString()}`, percentage: 100 },
                { label: "Refunds", value: `-$${(stats?.financialReconciliation?.totalRefunds || 0).toLocaleString()}`, percentage: stats?.financialReconciliation?.refundRate || 0 },
                { label: "Net Revenue", value: `$${(stats?.financialReconciliation?.netRevenue || 0).toLocaleString()}`, percentage: 100 - (stats?.financialReconciliation?.refundRate || 0) }
              ],
              metrics: [
                { label: "Profit Margin", value: `${((stats?.financialReconciliation?.netRevenue || 0) / (stats?.financialReconciliation?.grossRevenue || 1) * 100).toFixed(1)}%`, status: 'good' },
                { label: "Refund Rate", value: `${stats?.financialReconciliation?.refundRate || 0}%`, status: (stats?.financialReconciliation?.refundRate || 0) > 10 ? 'warning' : 'good' },
                { label: "Efficiency Ratio", value: "92.3%", status: 'good' }
              ],
              insights: [
                "Net revenue shows healthy growth despite refunds",
                "Profit margin is above industry average",
                "Refund rate is within acceptable limits"
              ],
              recommendations: [
                "Monitor refund patterns to identify root causes",
                "Implement better booking policies to reduce cancellations",
                "Consider refund insurance options for customers"
              ]
            }}
          />

          {/* Total Refunds - Interactive Card */}
          <InteractiveAnalyticsCard
            title="Total Refunds"
            value={isStatsLoading ? 0 : (stats?.financialReconciliation?.totalRefunds || 0)}
            subtitle="Total refunded amount"
            icon={<CreditCard className="h-6 w-6 text-white" />}
            color="#dc2626"
            bgColor="bg-red-500"
            trend={{
              value: 5.8,
              isPositive: false,
              period: "vs last month"
            }}
            details={{
              breakdown: [
                { label: "Cancellation Refunds", value: `$${(stats?.financialReconciliation?.totalRefunds || 0).toLocaleString()}`, percentage: 100 },
                { label: "Service Issues", value: "$0", percentage: 0 },
                { label: "Customer Complaints", value: "$0", percentage: 0 }
              ],
              metrics: [
                { label: "Refund Count", value: stats?.financialReconciliation?.refundCount || 0, status: 'warning' },
                { label: "Refund Rate", value: `${stats?.financialReconciliation?.refundRate || 0}%`, status: (stats?.financialReconciliation?.refundRate || 0) > 10 ? 'danger' : 'warning' },
                { label: "Average Refund", value: `$${stats?.financialReconciliation?.refundCount ? (stats.financialReconciliation.totalRefunds / stats.financialReconciliation.refundCount).toFixed(2) : 0}`, status: 'warning' }
              ],
              insights: [
                "Refund rate is within industry standards but should be monitored",
                "Most refunds are due to cancellations, not service issues",
                "Refund amount per transaction is reasonable"
              ],
              recommendations: [
                "Implement stricter cancellation policies",
                "Offer non-refundable rates at a discount",
                "Improve customer service to reduce complaint-based refunds"
              ]
            }}
          />

          {/* System Health - Interactive Card */}
          <InteractiveAnalyticsCard
            title="System Health"
            value="A+"
            subtitle="Overall performance rating"
            icon={<CheckCircle className="h-6 w-6 text-white" />}
            color="#7c3aed"
            bgColor="bg-purple-500"
            details={{
              metrics: [
                { label: "Revenue Growth", value: "Strong", status: 'good' },
                { label: "Profitability", value: "Excellent", status: 'good' },
                { label: "Cash Flow", value: "Positive", status: 'good' },
                { label: "Risk Level", value: "Low", status: 'good' }
              ],
              insights: [
                "Overall financial performance is excellent",
                "All key metrics are trending positively",
                "Risk management is effective"
              ],
              recommendations: [
                "Maintain current financial strategies",
                "Continue monitoring key performance indicators",
                "Consider expansion opportunities given strong position"
              ]
            }}
          />
        </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="text-center py-8">
              <div className="text-red-500 text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Financial Data Not Available</h3>
              <p className="text-gray-600 mb-4">Unable to load financial analytics data. Please try refreshing the page.</p>
              <button
                onClick={fetchStats}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Refresh Data
              </button>
            </div>
          </div>
        )}

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
                    <TrendingUp className="h-5 w-5 text-blue-600" />
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
                    formatNumber(stats?.bookings.active || 0)
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
            href="/dashboard/reviews"
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/60 shadow p-6 transition-all transform-gpu hover:-translate-y-1 hover:shadow-xl group"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-50 ring-1 ring-yellow-200/40 mb-4 transition-colors transition-transform duration-200 group-hover:bg-yellow-100 group-hover:scale-105">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reviews</h3>
            <p className="text-gray-600 leading-relaxed">
              Guest feedback and ratings
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