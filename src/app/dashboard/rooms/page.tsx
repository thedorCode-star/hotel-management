'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building, 
  Users, 
  DollarSign, 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  Plus,
  Edit,
  Trash2,
  Home,
  Bed,
  Star,
  Crown,
  Shield,
  AlertTriangle
} from 'lucide-react';
import RoomForm from './components/RoomForm';
import { canCreateRooms, canEditRooms, canDeleteRooms, getRoleDisplayName, getRoleColor } from '../../../lib/permissions';
import { getRoomImage } from '../../../lib/room-images';

interface Room {
  id: string;
  number: string;
  type: string;
  capacity: number;
  price: number;
  description?: string;
  status: string;
  createdAt: string;
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
      
      {/* Filters Skeleton */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-lg animate-shimmer"></div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-shimmer"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-24 animate-shimmer"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-shimmer"></div>
              <div className="h-4 bg-gray-200 rounded w-28 animate-shimmer"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded-lg mt-4 animate-shimmer"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    search: '',
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  // User role state - will be set from authentication
  const [userRole, setUserRole] = useState<'ADMIN' | 'MANAGER' | 'STAFF' | 'CONCIERGE' | 'GUEST'>('STAFF');
  
  // Check permissions
  const canCreate = canCreateRooms(userRole);
  const canEdit = canEditRooms(userRole);
  const canDelete = canDeleteRooms(userRole);

  // Check authentication on component mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRooms();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    applyFilters();
  }, [rooms, filters]);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/rooms');
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

  const checkAuthentication = async () => {
    try {
      // Check for auth token in cookies or localStorage
      const token = localStorage.getItem('token') || getCookie('auth-token');
      
      if (!token) {
        console.log('❌ No auth token found, redirecting to login');
        router.push('/auth/login');
        return;
      }

      // Get user info from the backend
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const actualUserRole = data.user?.role || 'STAFF';
        
        console.log('✅ User authenticated with role:', actualUserRole);
        
        // Set the actual user role from authentication
        setUserRole(actualUserRole as 'ADMIN' | 'MANAGER' | 'STAFF' | 'CONCIERGE' | 'GUEST');
        setIsAuthenticated(true);
        setAuthLoading(false);
      } else {
        console.log('❌ Failed to get user info, redirecting to login');
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      router.push('/auth/login');
    }
  };

  // Helper function to get cookie value
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  const applyFilters = () => {
    let filtered = rooms;

    if (filters.status !== 'all') {
      filtered = filtered.filter(room => room.status === filters.status);
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(room => room.type === filters.type);
    }

    if (filters.search) {
      filtered = filtered.filter(room =>
        room.number.toLowerCase().includes(filters.search.toLowerCase()) ||
        room.type.toLowerCase().includes(filters.search.toLowerCase()) ||
        (room.description && room.description.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    setFilteredRooms(filtered);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) {
      return;
    }

    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete room');
      }

      await fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete room');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'text-green-600 bg-green-100';
      case 'OCCUPIED':
        return 'text-blue-600 bg-blue-100';
      case 'MAINTENANCE':
        return 'text-red-600 bg-red-100';
      case 'RESERVED':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SUITE':
        return 'text-purple-600 bg-purple-100';
      case 'DELUXE':
        return 'text-indigo-600 bg-indigo-100';
      case 'DOUBLE':
        return 'text-blue-600 bg-blue-100';
      case 'SINGLE':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SUITE':
        return <Crown className="h-4 w-4" />;
      case 'DELUXE':
        return <Star className="h-4 w-4" />;
      case 'DOUBLE':
        return <Bed className="h-4 w-4" />;
      case 'SINGLE':
        return <Home className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  // Calculate statistics
  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'AVAILABLE').length,
    occupied: rooms.filter(r => r.status === 'OCCUPIED').length,
    maintenance: rooms.filter(r => r.status === 'MAINTENANCE').length,
    reserved: rooms.filter(r => r.status === 'RESERVED').length,
    totalRevenue: rooms.reduce((sum, r) => sum + r.price, 0)
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null; // Component will unmount and redirect
  }

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
                Room Management
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Manage hotel rooms, availability, and pricing with comprehensive control
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-2xl border border-blue-200/50 shadow-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-blue-600 font-medium">Total Rooms</div>
                </div>
              </div>
              
                          {/* Role Selector for Testing - Only visible to Admin/Manager */}
            {canCreate && (
              <div className="flex items-center space-x-3 bg-white rounded-xl p-3 shadow-sm border border-gray-200">
                <Shield className="w-5 h-5 text-gray-600" />
                <div className="text-sm font-medium text-gray-700">
                  Current Role: <span className="font-bold text-blue-600">{getRoleDisplayName(userRole)}</span>
                </div>
                {/* Keep dropdown for testing - remove in production */}
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as any)}
                  className="text-sm font-medium text-gray-700 bg-transparent border-none focus:ring-0 focus:outline-none"
                >
                  <option value="ADMIN">Administrator</option>
                  <option value="MANAGER">Manager</option>
                  <option value="STAFF">Staff</option>
                  <option value="CONCIERGE">Concierge</option>
                  <option value="GUEST">Guest</option>
                </select>
              </div>
            )}
              
              {canCreate && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center font-semibold"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Room
                </button>
              )}
            </div>
          </div>
          
          {/* Permission Status */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(userRole)}`}>
              {getRoleDisplayName(userRole)}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className={`flex items-center ${canCreate ? 'text-green-600' : 'text-red-600'}`}>
                {canCreate ? '✓' : '✗'} Create Rooms
              </span>
              <span className={`flex items-center ${canEdit ? 'text-green-600' : 'text-red-600'}`}>
                {canEdit ? '✓' : '✗'} Edit Rooms
              </span>
              <span className={`flex items-center ${canDelete ? 'text-green-600' : 'text-red-600'}`}>
                {canDelete ? '✓' : '✗'} Delete Rooms
              </span>
            </div>
          </div>
          
          {/* Permission Warning */}
          {!canCreate && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    Limited Room Management Access
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    As a {getRoleDisplayName(userRole).toLowerCase()}, you can view rooms but cannot create, edit, or delete them. 
                    Contact an administrator or manager for room management tasks.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="mb-8 animate-slide-in-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mr-4">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mr-4">
                  <Home className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Occupied</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.occupied}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center mr-4">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Reserved</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.reserved}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center mr-4">
                  <DollarSign className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Price</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${Math.round(stats.totalRevenue / stats.total)}
                  </p>
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
                  onClick={() => setError(null)}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Search Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center">
                      <Search className="w-4 h-4 mr-2 text-gray-500" />
                      Search
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search rooms..."
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
                      <option value="all">All Status</option>
                      <option value="AVAILABLE">Available</option>
                      <option value="OCCUPIED">Occupied</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="RESERVED">Reserved</option>
                    </select>
                  </div>

                  {/* Type Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                    >
                      <option value="all">All Types</option>
                      <option value="SINGLE">Single</option>
                      <option value="DOUBLE">Double</option>
                      <option value="SUITE">Suite</option>
                      <option value="DELUXE">Deluxe</option>
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <button
                      onClick={() => setFilters({ status: 'all', type: 'all', search: '' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Room Grid */}
        <div className="animate-slide-in-up">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Grid Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900">Room Inventory</h3>
              <p className="text-sm text-gray-500 mt-1">
                {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Room Grid */}
            <div className="p-6">
              {filteredRooms.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
                  <p className="text-gray-500 mb-6">No rooms match your current search criteria.</p>
                  <button
                    onClick={() => setFilters({ status: 'all', type: 'all', search: '' })}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredRooms.map((room, index) => (
                    <div 
                      key={room.id} 
                      className="bg-gradient-to-br from-white to-gray-50 border border-gray-200/60 rounded-2xl p-6 shadow-lg shadow-gray-200/50 backdrop-blur-sm hover:shadow-xl hover:scale-105 transition-all duration-200 group"
                      style={{animationDelay: `${index * 0.05}s`}}
                    >
                      {/* Room Image */}
                      <div className="mb-4 relative overflow-hidden rounded-xl">
                        <img
                          src={getRoomImage(room.type).url}
                          alt={getRoomImage(room.type).alt}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/rooms/default-room.svg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>

                      {/* Header Section */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                            <span className="text-white font-bold text-lg">
                              {room.number}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                              Room {room.number}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <div className="w-5 h-5 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                                {getTypeIcon(room.type)}
                              </div>
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${getTypeColor(room.type)}`}>
                                {room.type}
                              </span>
                              <img
                                src={getRoomImage(room.type).url}
                                alt={room.type}
                                className="w-4 h-4 rounded object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/images/rooms/default-room.svg';
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusColor(room.status)}`}>
                          {room.status}
                        </span>
                      </div>

                      {/* Room Details */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Capacity:</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{room.capacity} guests</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Price:</span>
                          </div>
                          <span className="text-lg font-bold text-green-600">${room.price}/night</span>
                        </div>

                        {room.description && (
                          <div className="text-sm text-gray-600 mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200/50">
                            <p className="line-clamp-2">
                              {room.description.length > 80 
                                ? `${room.description.substring(0, 80)}...` 
                                : room.description}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        {canEdit ? (
                          <button
                            onClick={() => {
                              setEditingRoom(room);
                              setShowForm(true);
                            }}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center font-semibold"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </button>
                        ) : (
                          <div className="flex-1 px-4 py-2.5 bg-gray-300 text-gray-500 text-sm rounded-xl flex items-center justify-center font-semibold cursor-not-allowed">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </div>
                        )}
                        
                        {canDelete ? (
                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center font-semibold"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <div className="px-4 py-2.5 bg-gray-300 text-gray-500 text-sm rounded-xl flex items-center justify-center font-semibold cursor-not-allowed">
                            <Trash2 className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Room Form Modal */}
        {showForm && (
          <RoomForm
            room={editingRoom || undefined}
            mode={editingRoom ? 'edit' : 'create'}
            onClose={() => {
              setShowForm(false);
              setEditingRoom(null);
              fetchRooms();
            }}
          />
        )}
      </div>
    </div>
  );
} 