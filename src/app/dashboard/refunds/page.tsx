'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowDownRight,
  Banknote,
  CreditCard as CreditCardIcon,
  Building,
  User,
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  BarChart3,
  Info
} from 'lucide-react';

interface Refund {
  id: string;
  bookingId: string;
  amount: number;
  refundMethod: string;
  status: string;
  transactionId: string;
  processedAt?: string;
  notes?: string;
  createdAt: string;
  booking: {
    user: {
      name: string;
      email: string;
    };
    room: {
      number: string;
      type: string;
    };
    refundAmount?: number; // Added for financial reconciliation
  };
}

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
    <div className="max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded-lg w-64 mb-4 animate-shimmer"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-48 animate-shimmer"></div>
      </div>
      
      {/* Stats Skeleton */}
      <div className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="h-6 bg-gray-200 rounded w-24 mb-2 animate-shimmer"></div>
              <div className="h-8 bg-gray-200 rounded w-16 animate-shimmer"></div>
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

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [refundMethod, setRefundMethod] = useState('CASH');
  const [refundNotes, setRefundNotes] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    method: 'all',
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchRefunds = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch('/api/refunds');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched refunds:', data.refunds); // Debug log
        console.log('Refunds length:', data.refunds?.length); // Debug log
        setRefunds(data.refunds || []);
      } else {
        setError('Failed to fetch refunds');
      }
    } catch (error) {
      console.error('Error fetching refunds:', error);
      setError('Failed to load refunds');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleProcessRefund = async () => {
    if (!selectedRefund) return;

    try {
      setProcessingRefund(true);
      const response = await fetch(`/api/refunds/${selectedRefund.id}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refundMethod,
          notes: refundNotes || `Refund processed via ${refundMethod}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Refund processed successfully! Amount: ${formatCurrency(selectedRefund.amount)} via ${refundMethod}`);
        setShowProcessModal(false);
        setSelectedRefund(null);
        setRefundMethod('CASH');
        setRefundNotes('');
        fetchRefunds(); // Refresh the list
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to process refund');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      setError('Failed to process refund');
    } finally {
      setProcessingRefund(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'PROCESSING': return 'text-orange-600 bg-orange-100';
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'FAILED': return 'text-red-600 bg-red-100';
      case 'CANCELLED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRefundMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH': return <Banknote className="h-4 w-4" />;
      case 'STRIPE': return <CreditCardIcon className="h-4 w-4" />;
      case 'BANK_TRANSFER': return <Building className="h-4 w-4" />;
      case 'CREDIT_TO_ACCOUNT': return <User className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getRefundMethodLabel = (method: string) => {
    switch (method) {
      case 'CASH': return 'Cash';
      case 'STRIPE': return 'Credit Card (Stripe)';
      case 'BANK_TRANSFER': return 'Bank Transfer';
      case 'CREDIT_TO_ACCOUNT': return 'Credit to Account';
      default: return method;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter refunds based on current filters
  const filteredRefunds = refunds.filter(refund => {
    const matchesStatus = filters.status === 'all' || refund.status === filters.status;
    const matchesMethod = filters.method === 'all' || refund.refundMethod === filters.method;
    const matchesSearch = filters.search === '' || 
      refund.booking?.user?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      refund.booking?.user?.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
      refund.booking?.room?.number?.toLowerCase().includes(filters.search.toLowerCase()) ||
      refund.transactionId?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesMethod && matchesSearch;
  });

  // Calculate statistics
  const stats = {
    total: refunds.length,
    pending: refunds.filter(r => r.status === 'PENDING').length,
    completed: refunds.filter(r => r.status === 'COMPLETED').length,
    totalAmount: refunds.reduce((sum, r) => sum + r.amount, 0)
  };

  // Financial Impact Summary
  const totalRefunded = refunds.reduce((sum, r) => sum + r.amount, 0);
  const pendingRefunds = refunds.filter(r => r.status === 'PENDING').reduce((sum, r) => sum + r.amount, 0);
  const completedRefunds = refunds.filter(r => r.status === 'COMPLETED').reduce((sum, r) => sum + r.amount, 0);
  const totalRevenue = refunds.reduce((sum, r) => sum + (r.booking.refundAmount || 0), 0); // Assuming booking.refundAmount is the total revenue for the booking
  const refundRate = totalRevenue > 0 ? (totalRefunded / totalRevenue) * 100 : 0;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header Section */}
        <div className="mb-8 animate-slide-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Refund Management
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Manage and process guest refunds with comprehensive tracking
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-2xl border border-blue-200/50 shadow-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-blue-600 font-medium">Total Refunds</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8 animate-slide-in-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mr-4">
                  <TrendingDown className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Refunds</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center mr-4">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mr-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center mr-4">
                  <DollarSign className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalAmount)}</p>
                </div>
              </div>
            </div>
          </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Search Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center">
                      <Search className="w-4 h-4 mr-2 text-gray-500" />
                      Search
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Guest, email, room, or transaction ID..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                    >
                      <option value="all">All Statuses</option>
                      <option value="PENDING">Pending</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="FAILED">Failed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  {/* Method Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Refund Method</label>
                    <select
                      value={filters.method}
                      onChange={(e) => setFilters(prev => ({ ...prev, method: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                    >
                      <option value="all">All Methods</option>
                      <option value="CASH">Cash</option>
                      <option value="STRIPE">Credit Card (Stripe)</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="CREDIT_TO_ACCOUNT">Credit to Account</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Refunds Table */}
        <div className="animate-slide-in-up">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900">Refund Records</h3>
              <p className="text-sm text-gray-500 mt-1">
                {filteredRefunds.length} refund{filteredRefunds.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50/50">
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
                          <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                          Amount & Method
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          Status & Date
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredRefunds.map((refund, index) => (
                      <tr 
                        key={refund.id} 
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group"
                        style={{animationDelay: `${index * 0.05}s`}}
                      >
                        {/* Guest Column */}
                        <td className="px-6 py-5">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3 group-hover:scale-110 transition-transform duration-200">
                              {refund.booking?.user?.name?.charAt(0)?.toUpperCase() || 'G'}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                                {refund.booking?.user?.name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
                                {refund.booking?.user?.email || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Room Column */}
                        <td className="px-6 py-5">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-sm mr-3 group-hover:scale-110 transition-transform duration-200">
                              {refund.booking?.room?.number?.slice(-2) || 'N/A'}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                Room {refund.booking?.room?.number || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500 capitalize">
                                {refund.booking?.room?.type || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Amount & Method Column */}
                        <td className="px-6 py-5">
                          <div className="space-y-2">
                            <div className="text-lg font-bold text-red-600">
                              {formatCurrency(refund.amount)}
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                                {getRefundMethodIcon(refund.refundMethod)}
                              </div>
                              <span className="text-sm text-gray-600">
                                {getRefundMethodLabel(refund.refundMethod)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Status & Date Column */}
                        <td className="px-6 py-5">
                          <div className="space-y-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusColor(refund.status)}`}>
                              {refund.status === 'COMPLETED' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {refund.status === 'PENDING' && <Clock className="h-3 w-3 mr-1" />}
                              {refund.status === 'PROCESSING' && <AlertCircle className="h-3 w-3 mr-1" />}
                              {refund.status}
                            </span>
                            <div className="text-sm text-gray-500">
                              {formatDate(refund.createdAt)}
                            </div>
                            {refund.processedAt && (
                              <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full inline-flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                Processed: {formatDate(refund.processedAt)}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions Column */}
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-2">
                            {refund.status === 'PENDING' && (
                              <button
                                onClick={() => {
                                  setSelectedRefund(refund);
                                  setRefundMethod(refund.refundMethod || 'CASH');
                                  setShowProcessModal(true);
                                }}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                              >
                                <DollarSign className="h-4 w-4 mr-2" />
                                Process
                              </button>
                            )}
                            {refund.status === 'COMPLETED' && (
                              <div className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Completed
                              </div>
                            )}
                            {refund.status === 'PROCESSING' && (
                              <div className="inline-flex items-center px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg">
                                <Clock className="h-4 w-4 mr-2" />
                                Processing
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="block lg:hidden">
              {filteredRefunds.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-sm">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Refunds Found</h3>
                    <p className="text-gray-500">No refunds match your current search criteria.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 p-4">
                  {filteredRefunds.map((refund) => (
                    <div key={refund.id} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200/60 rounded-2xl p-5 shadow-lg shadow-gray-200/50 backdrop-blur-sm">
                      {/* Header Section */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-white font-semibold text-sm">
                                {refund.booking?.user?.name?.charAt(0) || 'G'}
                              </span>
                            </div>
                            {/* Status Indicator Dot */}
                            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                              refund.status === 'COMPLETED' ? 'bg-green-500' :
                              refund.status === 'PENDING' ? 'bg-yellow-500' :
                              refund.status === 'PROCESSING' ? 'bg-orange-500' : 'bg-gray-500'
                            }`}></div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {refund.booking?.user?.name || 'N/A'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {refund.booking?.user?.email || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl shadow-md">
                            <div className="text-lg font-bold">
                              {formatCurrency(refund.amount)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status and Transaction Info */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusColor(refund.status)}`}>
                            {refund.status === 'COMPLETED' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {refund.status === 'PENDING' && <Clock className="h-3 w-3 mr-1" />}
                            {refund.status === 'PROCESSING' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {refund.status}
                          </span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500 font-medium">
                            {formatDate(refund.createdAt)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          #{refund.transactionId?.slice(-8) || refund.id?.slice(-8)}
                        </div>
                      </div>

                      {/* Room and Method Details */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                            <Building className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Room</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {refund.booking?.room?.number || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {refund.booking?.room?.type || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                            {getRefundMethodIcon(refund.refundMethod)}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Method</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {getRefundMethodLabel(refund.refundMethod)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Section */}
                      <div className="flex justify-end">
                        {refund.status === 'PENDING' && (
                          <button
                            onClick={() => {
                              setSelectedRefund(refund);
                              setRefundMethod(refund.refundMethod || 'CASH');
                              setShowProcessModal(true);
                            }}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center font-semibold"
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Process Refund
                          </button>
                        )}
                        {refund.status === 'COMPLETED' && (
                          <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-green-700 font-semibold text-sm">Completed</span>
                          </div>
                        )}
                        {refund.status === 'PROCESSING' && (
                          <div className="flex items-center space-x-2 bg-orange-50 px-4 py-2 rounded-xl border border-orange-200">
                            <Clock className="h-4 w-4 text-orange-600" />
                            <span className="text-orange-700 font-semibold text-sm">Processing</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Empty State */}
            {filteredRefunds.length === 0 && !isLoading && (
              <div className="text-center py-16 px-6">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No refunds found</h3>
                <p className="text-gray-500 mb-6">No refunds match your current search criteria.</p>
                <button
                  onClick={() => setFilters({ status: 'all', search: '', method: 'all' })}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* **FIXED: Financial Impact Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Financial Impact Summary</h3>
            <div className="text-sm text-gray-500">
              Based on Refund model (single source of truth)
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-800">Total Refunds</p>
                  <p className="text-2xl font-bold text-red-900">
                    -{formatCurrency(totalRefunded)}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {refunds.filter(r => r.status === 'COMPLETED').length} completed refunds
                  </p>
                </div>
                <div className="bg-red-100 rounded-full p-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800">Pending Refunds</p>
                  <p className="text-2xl font-bold text-orange-900">
                    -{formatCurrency(pendingRefunds)}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    {refunds.filter(r => r.status === 'PENDING').length} pending refunds
                  </p>
                </div>
                <div className="bg-orange-100 rounded-full p-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Refund Rate</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {refundRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Based on total revenue
                  </p>
                </div>
                <div className="bg-blue-100 rounded-full p-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
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
                  <strong>Financial Note:</strong> Refunds are now calculated exclusively from the Refund model to prevent double-counting. 
                  The <code className="bg-gray-200 px-1 rounded">booking.refundAmount</code> field is no longer updated to maintain data integrity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Process Refund Modal */}
        {showProcessModal && selectedRefund && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Process Refund</h3>
                <button
                  onClick={() => {
                    setShowProcessModal(false);
                    setSelectedRefund(null);
                    setRefundMethod('CASH');
                    setRefundNotes('');
                  }}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <span className="text-gray-500 font-bold">×</span>
                </button>
              </div>
              
              <div className="mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200/50">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700">Guest:</span>
                      <span className="text-sm font-bold text-gray-900">{selectedRefund.booking?.user?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700">Room:</span>
                      <span className="text-sm font-bold text-gray-900">Room {selectedRefund.booking?.room?.number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700">Amount:</span>
                      <span className="text-lg font-bold text-red-600">{formatCurrency(selectedRefund.amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Refund Method
                </label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                >
                  <option value="CASH">💵 Cash - Immediate refund to guest</option>
                  <option value="STRIPE">💳 Credit Card (Stripe) - Automatic refund to original card</option>
                  <option value="BANK_TRANSFER">🏦 Bank Transfer - Manual bank transfer</option>
                  <option value="CREDIT_TO_ACCOUNT">👤 Credit to Account - Future booking credit</option>
                </select>
                
                {/* Method-specific instructions */}
                <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
                  <p className="text-xs text-blue-800 font-medium">
                    {refundMethod === 'CASH' && (
                      <>💡 <strong>Cash Refund:</strong> Issue cash directly to guest. Get receipt signature for audit trail.</>
                    )}
                    {refundMethod === 'STRIPE' && (
                      <>💡 <strong>Stripe Refund:</strong> Automatic refund to original payment method. Takes 5-10 business days.</>
                    )}
                    {refundMethod === 'BANK_TRANSFER' && (
                      <>💡 <strong>Bank Transfer:</strong> Manual transfer to guest's bank account. Get bank confirmation.</>
                    )}
                    {refundMethod === 'CREDIT_TO_ACCOUNT' && (
                      <>💡 <strong>Account Credit:</strong> Apply credit to guest's account for future bookings.</>
                    )}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Notes (Optional)
                </label>
                <textarea
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm resize-none"
                  placeholder="Reason for refund, payment details, etc..."
                />
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-4 mb-6">
                <p className="text-sm text-blue-800 font-medium">
                  <strong>Note:</strong> Processing this refund will mark it as completed and update the booking status accordingly.
                </p>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => {
                    setShowProcessModal(false);
                    setSelectedRefund(null);
                    setRefundMethod('CASH');
                    setRefundNotes('');
                  }}
                  className="w-full px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200"
                  disabled={processingRefund}
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessRefund}
                  disabled={processingRefund}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center font-semibold disabled:opacity-50 disabled:transform-none"
                >
                  {processingRefund ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-5 w-5 mr-2" />
                      Process Refund
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
