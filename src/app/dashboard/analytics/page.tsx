'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  DollarSign, 
  BarChart3, 
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';

interface AnalyticsData {
  dailyPayments: Array<{
    date: string;
    amount: number;
    method: string;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>;
  topCustomers: Array<{
    customerName: string;
    customerEmail: string;
    totalSpent: number;
    transactionCount: number;
  }>;
  paymentMethods: Array<{
    method: string;
    totalAmount: number;
    transactionCount: number;
    percentage: number;
  }>;
  roomPerformance: Array<{
    roomNumber: string;
    roomType: string;
    totalRevenue: number;
    bookingCount: number;
    averageRevenue: number;
  }>;
  growth: {
    revenueGrowth: string;
    paymentSuccessRate: string;
    currentMonthRevenue: number;
    lastMonthRevenue: number;
  };
  refunds: {
    totalRefunded: number;
    refundCount: number;
    refundRate: number;
  };
  summary: {
    totalRevenue: number;
    totalTransactions: number;
    averageTransactionValue: number;
    uniqueCustomers: number;
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/analytics/payments?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      setError('Failed to load analytics data');
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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

  if (!analytics) {
    return (
      <div className="p-6">
        <p className="text-gray-500">No analytics data available.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment Analytics</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              timeRange === '30d' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimeRange('90d')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              timeRange === '90d' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            90 Days
          </button>
          <button
            onClick={() => setTimeRange('1y')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              timeRange === '1y' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            1 Year
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.summary.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.summary.totalTransactions}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unique Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.summary.uniqueCustomers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Transaction</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.summary.averageTransactionValue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Growth</h3>
          <div className="flex items-center">
            {parseFloat(analytics.growth.revenueGrowth) >= 0 ? (
              <ArrowUpRight className="h-6 w-6 text-green-600" />
            ) : (
              <ArrowDownRight className="h-6 w-6 text-red-600" />
            )}
            <span className={`text-2xl font-bold ml-2 ${
              parseFloat(analytics.growth.revenueGrowth) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analytics.growth.revenueGrowth}%
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            vs last month
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Success Rate</h3>
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xl font-bold text-blue-600">
                {analytics.growth.paymentSuccessRate}%
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            This month
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Refund Rate</h3>
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-xl font-bold text-red-600">
                {formatPercentage(analytics.refunds.refundRate)}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Total refunded: {formatCurrency(analytics.refunds.totalRefunded)}
          </p>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Customers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h3>
          <div className="space-y-4">
            {analytics.topCustomers.slice(0, 5).map((customer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium text-gray-900">{customer.customerName}</p>
                  <p className="text-sm text-gray-600">{customer.customerEmail}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                  <p className="text-sm text-gray-600">{customer.transactionCount} transactions</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="space-y-4">
            {analytics.paymentMethods.map((method, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="font-medium text-gray-900 capitalize">
                    {method.method.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(method.totalAmount)}</p>
                  <p className="text-sm text-gray-600">{method.transactionCount} transactions</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Room Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Performance</h3>
          <div className="space-y-4">
            {analytics.roomPerformance.slice(0, 5).map((room, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium text-gray-900">Room {room.roomNumber}</p>
                  <p className="text-sm text-gray-600 capitalize">{room.roomType}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(room.totalRevenue)}</p>
                  <p className="text-sm text-gray-600">{room.bookingCount} bookings</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
          <div className="space-y-3">
            {analytics.monthlyRevenue.slice(-6).map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{month.month}</span>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(month.revenue)}</p>
                  <p className="text-sm text-gray-600">{month.transactions} transactions</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 