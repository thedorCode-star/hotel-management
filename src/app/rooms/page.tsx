'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BookingForm from '../dashboard/bookings/components/BookingForm';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Room {
  id: string;
  number: string;
  type: string;
  capacity: number;
  price: number;
  description?: string;
  status: string;
  averageRating?: number;
  reviewCount?: number;
}

export default function RoomsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [filters, setFilters] = useState({
    type: 'all',
    minPrice: '',
    maxPrice: '',
    guests: '',
    checkIn: '',
    checkOut: '',
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  // Check auth for hiding the "Sign In" button when logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/auth/me', { headers });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          // Keep route consistency: logged-in users should use dashboard namespace
          router.replace('/dashboard/rooms');
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (err) {
        localStorage.removeItem('token');
        setUser(null);
      }
    };
    checkAuthStatus();
    const handler = () => checkAuthStatus();
    window.addEventListener('auth-changed', handler as EventListener);
    return () => window.removeEventListener('auth-changed', handler as EventListener);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rooms, filters]);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/rooms?status=AVAILABLE');
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }
      const data = await response.json();
      setRooms(data.rooms || []);
    } catch (error) {
      setError('Failed to load rooms');
      console.error('Error fetching rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = rooms;

    if (filters.type !== 'all') {
      filtered = filtered.filter(room => room.type === filters.type);
    }

    if (filters.minPrice) {
      filtered = filtered.filter(room => room.price >= parseFloat(filters.minPrice));
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(room => room.price <= parseFloat(filters.maxPrice));
    }

    if (filters.guests) {
      filtered = filtered.filter(room => room.capacity >= parseInt(filters.guests));
    }

    setFilteredRooms(filtered);
  };

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room);
    setShowBookingForm(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'OCCUPIED':
        return 'bg-red-100 text-red-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SUITE':
        return 'bg-purple-100 text-purple-800';
      case 'DELUXE':
        return 'bg-indigo-100 text-indigo-800';
      case 'DOUBLE':
        return 'bg-blue-100 text-blue-800';
      case 'SINGLE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number = 0) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-sm ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Available Rooms</h1>
              <p className="text-gray-600">Find your perfect stay with us</p>
            </div>
            {/* No extra Sign In button here to avoid duplication with global navigation */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search & Filter</h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="SINGLE">Single</option>
                <option value="DOUBLE">Double</option>
                <option value="SUITE">Suite</option>
                <option value="DELUXE">Deluxe</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Price
              </label>
              <input
                type="number"
                placeholder="Min price"
                value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price
              </label>
              <input
                type="number"
                placeholder="Max price"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guests
              </label>
              <input
                type="number"
                min="1"
                max="10"
                placeholder="Number of guests"
                value={filters.guests}
                onChange={(e) => setFilters(prev => ({ ...prev, guests: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-in Date
              </label>
              <input
                type="date"
                value={filters.checkIn}
                onChange={(e) => setFilters(prev => ({ ...prev, checkIn: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  type: 'all',
                  minPrice: '',
                  maxPrice: '',
                  guests: '',
                  checkIn: '',
                  checkOut: '',
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div key={room.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Room {room.number}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(room.type)}`}>
                      {room.type}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                    {room.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Capacity:</span>
                    <span className="text-sm font-medium">{room.capacity} guests</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Price:</span>
                    <span className="text-lg font-bold text-blue-600">${room.price}/night</span>
                  </div>
                  {room.averageRating && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Rating:</span>
                      <div className="flex items-center space-x-2">
                        {renderStars(room.averageRating)}
                        <span className="text-sm text-gray-500">({room.reviewCount || 0})</span>
                      </div>
                    </div>
                  )}
                  {room.description && (
                    <p className="text-sm text-gray-600">{room.description}</p>
                  )}
                </div>

                <button
                  onClick={() => handleBookRoom(room)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredRooms.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No rooms available matching your criteria.</p>
            <button
              onClick={() => setFilters({
                type: 'all',
                minPrice: '',
                maxPrice: '',
                guests: '',
                checkIn: '',
                checkOut: '',
              })}
              className="mt-4 text-blue-600 hover:text-blue-500"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {showBookingForm && selectedRoom && (
        <BookingForm
          mode="create"
          onClose={() => {
            setShowBookingForm(false);
            setSelectedRoom(null);
          }}
        />
      )}
    </div>
  );
} 