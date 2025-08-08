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
  User
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
  };
}

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [refundMethod, setRefundMethod] = useState('CASH');
  const [refundNotes, setRefundNotes] = useState('');

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Refund Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage and process guest refunds</p>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-200/50">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{refunds.length}</div>
            <div className="text-xs text-blue-600 font-medium">Total Refunds</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Refunds Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md max-w-full">
        {/* Desktop Cards - Show on medium screens and up */}
        <div className="hidden md:block">
          {refunds.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No refunds found</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {refunds.map((refund) => (
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

        {/* Mobile Cards - Show on screens smaller than medium */}
        <div className="block md:hidden">
          {refunds.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Refunds Found</h3>
                <p className="text-gray-500">There are currently no refund records to display.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {refunds.map((refund) => (
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
                      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl shadow-md">
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
  );
}
