'use client';

import { useState, useEffect } from 'react';
import { Mail, Send, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface Booking {
  id: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
  user: { name: string; email: string };
  room: { number: string; type: string };
}

export default function NotificationsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [emailType, setEmailType] = useState<'booking_reminder' | 'custom'>('booking_reminder');
  const [customEmail, setCustomEmail] = useState({
    subject: '',
    html: '',
    recipient: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/bookings');
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      setError('Failed to load bookings');
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedBooking && emailType === 'booking_reminder') {
      setError('Please select a booking for reminder email');
      return;
    }

    if (emailType === 'custom' && (!customEmail.subject || !customEmail.html || !customEmail.recipient)) {
      setError('Please fill in all custom email fields');
      return;
    }

    setIsSending(true);
    setError(null);
    setSendResult(null);

    try {
      const requestBody = emailType === 'booking_reminder' 
        ? {
            type: 'booking_reminder',
            bookingId: selectedBooking?.id
          }
        : {
            type: 'custom',
            email: customEmail.recipient,
            customData: {
              subject: customEmail.subject,
              html: customEmail.html
            }
          };

      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setSendResult({ success: true, message: 'Email sent successfully!' });
        if (emailType === 'custom') {
          setCustomEmail({ subject: '', html: '', recipient: '' });
        }
      } else {
        setSendResult({ success: false, message: data.error || 'Failed to send email' });
      }
    } catch (error) {
      setSendResult({ success: false, message: 'Network error. Please try again.' });
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Email Notifications</h1>
        <Mail className="h-6 w-6 text-blue-600" />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {sendResult && (
        <div className={`border rounded-md p-4 mb-6 ${sendResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center">
            {sendResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            )}
            <p className={sendResult.success ? 'text-green-600' : 'text-red-600'}>{sendResult.message}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Type Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Type</h2>
          
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="booking_reminder"
                checked={emailType === 'booking_reminder'}
                onChange={(e) => setEmailType(e.target.value as 'booking_reminder' | 'custom')}
                className="mr-2"
              />
              <span>Booking Reminder</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                value="custom"
                checked={emailType === 'custom'}
                onChange={(e) => setEmailType(e.target.value as 'booking_reminder' | 'custom')}
                className="mr-2"
              />
              <span>Custom Email</span>
            </label>
          </div>
        </div>

        {/* Email Content */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Content</h2>
          
          {emailType === 'booking_reminder' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Booking
              </label>
              <select
                value={selectedBooking?.id || ''}
                onChange={(e) => {
                  const booking = bookings.find(b => b.id === e.target.value);
                  setSelectedBooking(booking || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a booking...</option>
                {bookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    {booking.user.name} - Room {booking.room.number} ({formatDate(booking.checkIn)})
                  </option>
                ))}
              </select>
              
              {selectedBooking && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="font-medium text-gray-900 mb-2">Booking Details</h3>
                  <div className="text-sm text-gray-600">
                    <p><strong>Guest:</strong> {selectedBooking.user.name}</p>
                    <p><strong>Email:</strong> {selectedBooking.user.email}</p>
                    <p><strong>Room:</strong> Room {selectedBooking.room.number} ({selectedBooking.room.type})</p>
                    <p><strong>Dates:</strong> {formatDate(selectedBooking.checkIn)} - {formatDate(selectedBooking.checkOut)}</p>
                    <p><strong>Amount:</strong> ${selectedBooking.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={customEmail.recipient}
                  onChange={(e) => setCustomEmail(prev => ({ ...prev, recipient: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="customer@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={customEmail.subject}
                  onChange={(e) => setCustomEmail(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email subject"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HTML Content
                </label>
                <textarea
                  value={customEmail.html}
                  onChange={(e) => setCustomEmail(prev => ({ ...prev, html: e.target.value }))}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="<div>Your HTML email content here...</div>"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Send Button */}
      <div className="mt-6">
        <button
          onClick={handleSendEmail}
          disabled={isSending || (emailType === 'booking_reminder' && !selectedBooking) || (emailType === 'custom' && (!customEmail.subject || !customEmail.html || !customEmail.recipient))}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Sending Email...
            </>
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              Send Email
            </>
          )}
        </button>
      </div>
    </div>
  );
} 