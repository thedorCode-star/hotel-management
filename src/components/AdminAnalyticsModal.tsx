'use client';

import { useState } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building2, 
  Download,
  BarChart3,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdminAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardData: any;
}

export default function AdminAnalyticsModal({ isOpen, onClose, dashboardData }: AdminAnalyticsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'performance' | 'trends'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getPercentageColor = (value: number) => {
    if (value >= 80) return 'text-green-600 bg-green-100';
    if (value >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendIcon = (isPositive: boolean) => {
    return isPositive ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-indigo-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-blue-200/30">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-blue-200/50 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
              <p className="text-gray-600">Comprehensive insights and performance metrics</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTimeRange('7d')}
              className={`transition-all duration-200 ${
                timeRange === '7d' 
                  ? 'bg-blue-100 border-blue-400 text-blue-700 shadow-md' 
                  : 'border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-300'
              }`}
            >
              7D
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTimeRange('30d')}
              className={timeRange === '30d' ? 'bg-blue-100 border-blue-300' : ''}
            >
              30D
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTimeRange('90d')}
              className={timeRange === '90d' ? 'bg-blue-100 border-blue-300' : ''}
            >
              90D
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTimeRange('1y')}
              className={timeRange === '1y' ? 'bg-blue-100 border-blue-300' : ''}
            >
              1Y
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-blue-200/50 bg-gradient-to-r from-gray-50 via-blue-50/30 to-indigo-50/30">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'financial', label: 'Financial', icon: DollarSign },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'trends', label: 'Trends', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white shadow-sm'
                  : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50/50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Total Revenue</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {formatCurrency(dashboardData?.financialReconciliation?.grossRevenue || 0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    {getTrendIcon(true)}
                    <span className="text-sm text-blue-700">+12.5% vs last month</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Active Users</p>
                      <p className="text-2xl font-bold text-green-900">
                        {formatNumber(dashboardData?.bookings?.active || 0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    {getTrendIcon(true)}
                    <span className="text-sm text-green-700">+8.2% vs last month</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-800">Room Occupancy</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {dashboardData?.rooms?.occupancyRate || '0%'}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    {getTrendIcon(true)}
                    <span className="text-sm text-purple-700">+5.8% vs last month</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-800">Success Rate</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {dashboardData?.payments?.successRate || '0%'}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    {getTrendIcon(true)}
                    <span className="text-sm text-orange-700">+2.1% vs last month</span>
                  </div>
                </div>
              </div>

              {/* Performance Summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {formatCurrency(dashboardData?.financialReconciliation?.netRevenue || 0)}
                    </div>
                    <p className="text-sm text-gray-600">Net Revenue</p>
                    <Badge className={`mt-2 ${getPercentageColor(68)}`}>
                      Excellent Performance
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {dashboardData?.bookings?.total || 0}
                    </div>
                    <p className="text-sm text-gray-600">Total Bookings</p>
                    <Badge className={`mt-2 ${getPercentageColor(75)}`}>
                      Strong Growth
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {dashboardData?.rooms?.total || 0}
                    </div>
                    <p className="text-sm text-gray-600">Total Rooms</p>
                    <Badge className={`mt-2 ${getPercentageColor(90)}`}>
                      Optimal Capacity
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-6">
              {/* Financial Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Gross Revenue</span>
                      <span className="font-semibold">
                        {formatCurrency(dashboardData?.financialReconciliation?.grossRevenue || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Refunds</span>
                      <span className="font-semibold text-red-600">
                        -{formatCurrency(dashboardData?.financialReconciliation?.totalRefunds || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Net Revenue</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(dashboardData?.financialReconciliation?.netRevenue || 0)}
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Profit Margin</span>
                        <Badge className={getPercentageColor(68)}>
                          {((dashboardData?.financialReconciliation?.netRevenue || 0) / (dashboardData?.financialReconciliation?.grossRevenue || 1) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Analytics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Completed Payments</span>
                      <span className="font-semibold text-green-600">
                        {dashboardData?.payments?.completed || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Success Rate</span>
                      <Badge className={getPercentageColor(parseInt(dashboardData?.payments?.successRate || '0'))}>
                        {dashboardData?.payments?.successRate || '0%'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Average Transaction</span>
                      <span className="font-semibold">
                        {formatCurrency(dashboardData?.financialReconciliation?.grossRevenue / (dashboardData?.payments?.completed || 1) || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Performance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Rooms</span>
                      <span className="font-semibold">{dashboardData?.rooms?.total || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Available</span>
                      <span className="font-semibold text-green-600">{dashboardData?.rooms?.available || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Occupied</span>
                      <span className="font-semibold text-blue-600">{dashboardData?.rooms?.occupied || 0}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Occupancy Rate</span>
                        <Badge className={getPercentageColor(parseFloat(dashboardData?.rooms?.occupancyRate || '0'))}>
                          {dashboardData?.rooms?.occupancyRate || '0%'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Performance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Bookings</span>
                      <span className="font-semibold">{dashboardData?.bookings?.total || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Active</span>
                      <span className="font-semibold text-green-600">{dashboardData?.bookings?.active || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Pending</span>
                      <span className="font-semibold text-yellow-600">{dashboardData?.bookings?.pending || 0}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Today&apos;s Bookings</span>
                        <span className="font-semibold text-blue-600">{dashboardData?.bookings?.today || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-6">
              {/* Trends Analysis */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">Revenue Trends</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm text-gray-600">Monthly Growth</span>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-600">+12.5%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm text-gray-600">Booking Growth</span>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold text-blue-600">+8.2%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">Performance Trends</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <span className="text-sm text-gray-600">Occupancy Rate</span>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                          <span className="font-semibold text-purple-600">+5.8%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <span className="text-sm text-gray-600">Success Rate</span>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4 text-orange-600" />
                          <span className="font-semibold text-orange-600">+2.1%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-blue-200/50 bg-gradient-to-r from-gray-50 via-blue-50/30 to-indigo-50/30">
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400 transition-all duration-200">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button onClick={onClose} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
