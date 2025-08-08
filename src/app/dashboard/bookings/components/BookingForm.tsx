'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Room {
  id: string;
  number: string;
  type: string;
  capacity: number;
  price: number;
  status: string;
}

interface BookingFormProps {
  booking?: {
    id: string;
    roomId: string;
    checkIn: string;
    checkOut: string;
    guestCount?: number;
    status: string;
  };
  mode: 'create' | 'edit';
  onClose: () => void;
}

export default function BookingForm({ booking, mode, onClose }: BookingFormProps) {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [formData, setFormData] = useState({
    roomId: booking?.roomId || '',
    checkIn: booking?.checkIn ? new Date(booking.checkIn).toISOString().split('T')[0] : (() => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })(),
    checkOut: booking?.checkOut ? new Date(booking.checkOut).toISOString().split('T')[0] : (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const year = tomorrow.getFullYear();
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const day = String(tomorrow.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })(),
    guestCount: booking?.guestCount || 1,
    status: booking?.status || 'PENDING',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      console.log('Fetching rooms with status: AVAILABLE,RESERVED');
      // Fetch both AVAILABLE and RESERVED rooms (RESERVED might be from expired bookings)
      const response = await fetch('/api/rooms?status=AVAILABLE,RESERVED');
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Rooms data:', data);
        setRooms(data.rooms || []);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch rooms:', response.status, errorText);
        setErrors({ submit: `Failed to load available rooms (${response.status}). Please refresh the page.` });
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setErrors({ submit: 'Failed to load available rooms. Please check your connection.' });
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.roomId) {
      newErrors.roomId = 'Please select a room';
    }

    if (!formData.checkIn || formData.checkIn.trim() === '') {
      newErrors.checkIn = 'Check-in date is required';
    }

    if (!formData.checkOut || formData.checkOut.trim() === '') {
      newErrors.checkOut = 'Check-out date is required';
    }

    if (formData.checkIn && formData.checkOut && formData.checkIn.trim() !== '' && formData.checkOut.trim() !== '') {
      const checkInDate = new Date(formData.checkIn + 'T00:00:00');
      const checkOutDate = new Date(formData.checkOut + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Allow same-day bookings but ensure check-in is not in the past
      const checkInDay = new Date(checkInDate);
      checkInDay.setHours(0, 0, 0, 0);

      if (checkInDay < today) {
        newErrors.checkIn = 'Check-in date cannot be in the past';
      }

      if (checkOutDate <= checkInDate) {
        newErrors.checkOut = 'Check-out date must be after check-in date';
      }
    }

    if (formData.guestCount < 1) {
      newErrors.guestCount = 'Guest count must be at least 1';
    }

    const selectedRoom = rooms.find(room => room.id === formData.roomId);
    if (selectedRoom && formData.guestCount > selectedRoom.capacity) {
      newErrors.guestCount = `Room capacity is ${selectedRoom.capacity} guests`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const url = mode === 'create' ? '/api/bookings' : `/api/bookings/${booking?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('API error response:', errorData); // Debug log
        
        // Handle specific error cases
        if (errorData.error.includes('Room is currently reserved')) {
          setErrors({ submit: 'This room is currently reserved. Please try another room or contact staff.' });
        } else if (errorData.error.includes('Room is already booked')) {
          setErrors({ submit: 'This room is already booked for these dates. Please select different dates or another room.' });
        } else if (errorData.error.includes('Room is not available')) {
          setErrors({ submit: 'This room is not available. Please select another room.' });
        } else if (errorData.error.includes('Check-in date cannot be in the past')) {
          setErrors({ checkIn: 'Check-in date cannot be in the past' });
        } else if (errorData.error.includes('Check-out date must be after check-in date')) {
          setErrors({ checkOut: 'Check-out date must be after check-in date' });
        } else if (errorData.error.includes('Room capacity is')) {
          setErrors({ guestCount: errorData.error });
        } else {
          setErrors({ submit: errorData.error || 'Failed to save booking' });
        }
        return;
      }

      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error saving booking:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save booking' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateTotalPrice = () => {
    const selectedRoom = rooms.find(room => room.id === formData.roomId);
    if (!selectedRoom || !formData.checkIn || !formData.checkOut) return 0;

    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return selectedRoom.price * nights;
  };

  if (isLoadingRooms) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 shadow-2xl border border-gray-200/50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-2 text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 w-full max-w-md mx-auto max-h-[90vh] flex flex-col shadow-2xl border border-gray-200/50 overflow-hidden">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'create' ? 'Create New Booking' : 'Edit Booking'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <span className="text-gray-500 font-bold">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Room *
            </label>
            <select
              value={formData.roomId}
              onChange={(e) => handleInputChange('roomId', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm ${
                errors.roomId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a room</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  Room {room.number} - {room.type} (${room.price}/night)
                </option>
              ))}
            </select>
            {errors.roomId && (
              <p className="text-red-500 text-sm mt-1">{errors.roomId}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Check-in Date *
              </label>
              <input
                type="date"
                value={formData.checkIn}
                onChange={(e) => handleInputChange('checkIn', e.target.value)}
                min={(() => {
                  const today = new Date();
                  const year = today.getFullYear();
                  const month = String(today.getMonth() + 1).padStart(2, '0');
                  const day = String(today.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                })()}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm ${
                  errors.checkIn ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.checkIn && (
                <p className="text-red-500 text-sm mt-1">{errors.checkIn}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Check-out Date *
              </label>
              <input
                type="date"
                value={formData.checkOut}
                onChange={(e) => handleInputChange('checkOut', e.target.value)}
                min={formData.checkIn || (() => {
                  const today = new Date();
                  const year = today.getFullYear();
                  const month = String(today.getMonth() + 1).padStart(2, '0');
                  const day = String(today.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                })()}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm ${
                  errors.checkOut ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.checkOut && (
                <p className="text-red-500 text-sm mt-1">{errors.checkOut}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Number of Guests *
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.guestCount}
              onChange={(e) => {
                const value = e.target.value;
                const parsedValue = value === '' ? 1 : parseInt(value) || 1;
                handleInputChange('guestCount', parsedValue);
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm ${
                errors.guestCount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.guestCount && (
              <p className="text-red-500 text-sm mt-1">{errors.guestCount}</p>
            )}
          </div>

          {formData.roomId && formData.checkIn && formData.checkOut && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200/50">
              <p className="text-sm font-semibold text-blue-800">
                <strong>Total Price:</strong> ${calculateTotalPrice().toFixed(2)}
              </p>
            </div>
          )}

          {errors.submit && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-4 border border-red-200/50 overflow-hidden">
              <p className="text-red-600 text-sm font-medium break-words whitespace-normal leading-relaxed">{errors.submit}</p>
            </div>
          )}

          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Booking' : 'Update Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 