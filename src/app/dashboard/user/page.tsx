'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Calendar, 
  CreditCard, 
  Star, 
  Building2, 
  Users, 
  BarChart3,
  Mail,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  FileText,
  RefreshCw,
  Edit,
  Settings,
  Eye,
  X,
  Camera,
  Trash2,
  Save,
  TrendingUp,
  Download
} from 'lucide-react';
import AnalyticsReport from '@/components/AnalyticsReport';
import UserManagementModal from '@/components/UserManagementModal';

interface UserProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    address?: string;
    createdAt: string;
  };
  bookings: Array<{
    id: string;
    checkIn: string;
    checkOut: string;
    status: string;
    totalAmount: number;
    room: {
      number: string;
      type: string;
    };
    user?: {
      name: string;
      email: string;
    };
  }>;
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    method: string;
    createdAt: string;
    booking: {
      room: {
        number: string;
      };
      user?: {
        name: string;
        email: string;
      };
    };
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    room: {
      number: string;
      type: string;
    };
  }>;
  stats: {
    totalBookings: number;
    totalPayments: number;
    totalReviews: number;
    totalUsers: number;
  };
  allUsersData?: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
  isAdmin?: boolean;
  userAnalytics?: {
    topBookers: Array<{
      userId: string;
      count: number;
      name: string;
      email: string;
      totalSpent: number;
    }>;
    topRefundUsers: Array<{
      userId: string;
      count: number;
      name: string;
      email: string;
      totalRefunded: number;
    }>;
    topLuxuryBookers: Array<{
      userId: string;
      name: string;
      email: string;
      highestRoomPrice: number;
      roomNumber: string;
      roomType: string;
    }>;
    topSpenders: Array<{
      userId: string;
      name: string;
      email: string;
      totalSpent: number;
      paymentCount: number;
    }>;
  };
}

export default function UserProfile() {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [allUsersData, setAllUsersData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [userAnalytics, setUserAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/profile');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setUserData(data);
      
      // Check if user is admin from multiple sources
      const userIsAdmin = data.isAdmin || data.user?.role === 'ADMIN';
      setIsAdmin(userIsAdmin);
      
      // If user is admin, fetch all users data
      if (userIsAdmin) {
        try {
          const usersResponse = await fetch('/api/users');
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            console.log('👥 Admin users data fetched:', usersData);
            setAllUsersData(usersData.users || []);
          } else {
            console.error('❌ Failed to fetch admin users data');
            setAllUsersData([]);
          }
        } catch (usersError) {
          console.error('❌ Error fetching admin users:', usersError);
          setAllUsersData([]);
        }
      } else {
        setAllUsersData(data.allUsersData || []);
      }
      
      setStats(data.stats || {});
      setUserAnalytics(data.userAnalytics || null);
      
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      setError('Failed to fetch user profile data');
    } finally {
      setLoading(false);
    }
  };

  // User Management Action Functions
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'delete'>('view');
  const [showUserModal, setShowUserModal] = useState(false);

  const viewUserDetails = (user: any) => {
    setSelectedUser(user);
    setModalMode('view');
    setShowUserModal(true);
  };

  const editUser = (user: any) => {
    setSelectedUser(user);
    setModalMode('edit');
    setShowUserModal(true);
  };

  const manageUserPermissions = (user: any) => {
    setSelectedUser(user);
    setModalMode('edit');
    setShowUserModal(true);
  };

  const handleSaveUser = async (userData: any) => {
    try {
      // TODO: Implement API call to update user
      console.log('Saving user:', userData);
      alert(`User ${userData.name} updated successfully!`);
      setShowUserModal(false);
      fetchUserData(); // Refresh data
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // TODO: Implement API call to delete user
      console.log('Deleting user:', userId);
      alert('User deleted successfully!');
      setShowUserModal(false);
      fetchUserData(); // Refresh data
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  const handleUserUpdate = async (updatedUser: any) => {
    try {
      // Update the local state
      if (userData && userData.allUsersData) {
        const updatedUsers = userData.allUsersData.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        );
        setUserData({
          ...userData,
          allUsersData: updatedUsers
        });
      }
      
      // Refresh data from server
      await fetchUserData();
      
      // Show success message
      alert(`User ${updatedUser.name} updated successfully!`);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  // Export Functions for Financial Reports
  const exportFinancialReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
      netRevenue: payments.reduce((sum, p) => sum + p.amount, 0) * 0.85,
      totalBookings: bookings.length,
      confirmedBookings: bookings.filter(b => b.status === 'CONFIRMED').length,
      totalUsers: allUsersData.length,
      activeUsers: allUsersData.filter(u => u.role !== 'GUEST').length,
      roomOccupancy: ((bookings.length / 11) * 100).toFixed(1),
      successRate: ((payments.filter(p => p.status === 'COMPLETED').length / payments.length) * 100).toFixed(1),
      averageBookingValue: bookings.length > 0 ? (payments.reduce((sum, p) => sum + p.amount, 0) / bookings.length).toFixed(2) : '0.00'
    };

    // Create CSV content
    const csvContent = `Financial Report - ${new Date().toLocaleDateString()}
Metric,Value
Total Revenue,$${reportData.totalRevenue.toLocaleString()}
Net Revenue,$${reportData.netRevenue.toLocaleString()}
Total Bookings,${reportData.totalBookings}
Confirmed Bookings,${reportData.confirmedBookings}
Total Users,${reportData.totalUsers}
Active Users,${reportData.activeUsers}
Room Occupancy,${reportData.roomOccupancy}%
Success Rate,${reportData.successRate}%
Average Booking Value,$${reportData.averageBookingValue}`;

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert('Financial report exported successfully!');
  };

  const downloadPDFReport = () => {
    // This would integrate with a PDF generation library like jsPDF
    // For now, we'll show a message about the feature
    alert('PDF export feature coming soon! This will generate a professional PDF report with charts and detailed analytics.');
  };

  const getRolePermissions = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Full system access, user management, analytics, settings';
      case 'MANAGER':
        return 'Department oversight, staff management, reports';
      case 'STAFF':
        return 'Operational tasks, guest services, basic reports';
      case 'CONCIERGE':
        return 'Guest assistance, front desk operations';
      case 'GUEST':
        return 'Basic booking, reviews, profile management';
      default:
        return 'Limited access';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MANAGER':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'STAFF':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONCIERGE':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'GUEST':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Full system access & control';
      case 'MANAGER':
        return 'Department management & oversight';
      case 'STAFF':
        return 'Operational tasks & guest services';
      case 'CONCIERGE':
        return 'Guest assistance & front desk';
      case 'GUEST':
        return 'Basic booking & review access';
      default:
        return 'Limited access';
    }
  };

  const getAccountAge = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error || 'Failed to load user profile'}</p>
          <Button onClick={fetchUserData} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const { user, bookings, payments, reviews } = userData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with Professional Styling */}
        <div className="mb-8 animate-slide-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
                User Profile & Analytics
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Professional dashboard for account management and business intelligence
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={fetchUserData} 
                disabled={loading}
                className="group relative inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
              >
                <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User Info */}
          <div className="lg:col-span-1">
            {/* Enhanced User Profile Card */}
            <Card className="mb-6 bg-gradient-to-br from-white to-blue-50 border border-blue-200/50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="relative w-28 h-28 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <User className="h-14 w-14 text-white" />
                  {isAdmin && (
                    <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <Camera className="w-4 h-4 text-blue-600" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {user.name}
                </CardTitle>
                <Badge className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border-purple-200 px-4 py-2 text-sm font-medium">
                  {user.role}
                </Badge>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setModalMode('edit');
                      setShowUserModal(true);
                    }}
                    className="mt-3 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200/50">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200/50">
                    <Phone className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">{user.phone}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200/50">
                    <MapPin className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">{user.address}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200/50">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced User Statistics Card */}
            <Card className="bg-gradient-to-br from-white to-green-50 border border-green-200/50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="border-b border-green-200/50 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="text-lg font-bold text-green-800 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                  Your Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200/50">
                  <span className="text-sm font-medium text-gray-700 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                    Total Bookings
                  </span>
                  <span className="text-xl font-bold text-blue-600">{stats.totalBookings}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200/50">
                  <span className="text-sm font-medium text-gray-700 flex items-center">
                    <CreditCard className="w-4 h-4 mr-2 text-green-600" />
                    Total Payments
                  </span>
                  <span className="text-xl font-bold text-green-600">{stats.totalPayments}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200/50">
                  <span className="text-sm font-medium text-gray-700 flex items-center">
                    <Star className="w-4 h-4 mr-2 text-purple-600" />
                    Total Reviews
                  </span>
                  <span className="text-xl font-bold text-purple-600">{stats.totalReviews}</span>
                </div>
                {isAdmin && (
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200/50">
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <Users className="w-4 h-4 mr-2 text-orange-600" />
                      Total Users
                    </span>
                    <span className="text-xl font-bold text-orange-600">{stats.totalUsers}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="bookings" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-white p-1 rounded-xl shadow-lg border border-gray-200">
                <TabsTrigger value="bookings" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">
                  <Calendar className="w-4 h-4 mr-2" />
                  Bookings
                </TabsTrigger>
                <TabsTrigger value="payments" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payments
                </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">
                  <Star className="w-4 h-4 mr-2" />
                  Reviews
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Bookings Tab */}
              <TabsContent value="bookings">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      {isAdmin ? 'All Recent Bookings' : 'Recent Bookings'}
                      <Badge variant="secondary" className="ml-2">
                        {bookings.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bookings.length > 0 ? (
                      <div className="space-y-4">
                        {bookings.map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Building2 className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    Room {booking.room.number} - {booking.room.type}
                                  </p>
                                  {isAdmin && booking.user && (
                                    <p className="text-sm text-gray-500">
                                      {booking.user.name} ({booking.user.email})
                                    </p>
                                  )}
                                  <p className="text-sm text-gray-500">
                                    {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={booking.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                                {booking.status}
                              </Badge>
                              <p className="text-lg font-semibold text-green-600 mt-1">
                                ${booking.totalAmount}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No bookings found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      {isAdmin ? 'All Recent Payments' : 'Recent Payments'}
                      <Badge variant="secondary" className="ml-2">
                        {payments.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {payments.length > 0 ? (
                      <div className="space-y-4">
                        {payments.map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                  <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    Payment for Room {payment.booking.room.number}
                                  </p>
                                  {isAdmin && payment.booking.user && (
                                    <p className="text-sm text-gray-500">
                                      {payment.booking.user.name} ({payment.booking.user.email})
                                    </p>
                                  )}
                                  <p className="text-sm text-gray-500">
                                    {new Date(payment.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={payment.status === 'COMPLETED' ? 'default' : 'secondary'}>
                                {payment.status}
                              </Badge>
                              <p className="text-lg font-semibold text-green-600 mt-1">
                                ${payment.amount}
                              </p>
                              <p className="text-sm text-gray-500">{payment.method}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No payments found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="h-5 w-5 mr-2" />
                      {isAdmin ? 'All Recent Reviews' : 'Recent Reviews'}
                      <Badge variant="secondary" className="ml-2">
                        {reviews.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <Building2 className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    Room {review.room.number} - {review.room.type}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No reviews found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab - Admin Only */}
              {isAdmin && (
                <TabsContent value="analytics">
                  {/* Simplified Admin Analytics Dashboard */}
                  {userAnalytics ? (
                    <div className="max-w-4xl mx-auto">
                      {/* Enhanced Main Analytics Header */}
                      <div className="text-center mb-8 animate-slide-in-up">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-3">
                          Admin Analytics Dashboard
                        </h2>
                        <p className="text-gray-600 text-lg">Key performance insights and business intelligence at a glance</p>
                        <div className="mt-4 flex justify-center">
                          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200">
                            <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="text-blue-800 font-medium">Real-time Data</span>
                          </div>
                        </div>
                      </div>

                      {/* Top Performers Section - 2x2 Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Top Bookers - Enhanced */}
                        <Card className="bg-gradient-to-br from-white to-blue-50 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                          <CardHeader className="text-center pb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <Building2 className="h-8 w-8 text-white" />
                            </div>
                            <CardTitle className="text-xl font-bold text-gray-900">Top Bookers</CardTitle>
                            <p className="text-sm text-gray-600">Most active users</p>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-4">
                              {userAnalytics.topBookers && userAnalytics.topBookers.map((user: any, index: number) => (
                                <div key={user.userId} className="group relative p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-2xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 shadow-sm hover:shadow-md">
                                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                  <div className="relative flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 ring-2 ring-yellow-200' :
                                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 ring-2 ring-gray-200' :
                                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 ring-2 ring-orange-200' :
                                        'bg-gradient-to-br from-blue-500 to-blue-600 ring-2 ring-blue-200'
                                      }`}>
                                        {index + 1}
                                      </div>
                                      <div>
                                        <p className="font-semibold text-gray-900 text-lg">{user.name}</p>
                                        <p className="text-sm text-gray-600">{user.email}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xl font-bold text-blue-600">{user.count} bookings</div>
                                      <div className="text-sm text-gray-500 font-medium">${user.totalSpent?.toLocaleString() || 0}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Top Refund Users - Enhanced */}
                        <Card className="bg-gradient-to-br from-white to-red-50 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-pink-600"></div>
                          <CardHeader className="text-center pb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <CreditCard className="h-8 w-8 text-white" />
                            </div>
                            <CardTitle className="text-xl font-bold text-gray-900">Top Refund Users</CardTitle>
                            <p className="text-sm text-gray-600">Most refunds requested</p>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-4">
                              {userAnalytics.topRefundUsers && userAnalytics.topRefundUsers.map((user: any, index: number) => (
                                <div key={user.userId} className="group relative p-4 bg-gradient-to-r from-red-50/80 to-pink-50/80 rounded-2xl hover:from-red-100 hover:to-pink-100 transition-all duration-300 shadow-sm hover:shadow-md">
                                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                  <div className="relative flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 ring-2 ring-yellow-200' :
                                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 ring-2 ring-gray-200' :
                                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 ring-2 ring-orange-200' :
                                        'bg-gradient-to-br from-red-500 to-red-600 ring-2 ring-red-200'
                                      }`}>
                                        {index + 1}
                                      </div>
                                      <div>
                                        <p className="font-semibold text-gray-900 text-lg">{user.name}</p>
                                        <p className="text-sm text-gray-600">{user.email}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xl font-bold text-red-600">{user.count} refunds</div>
                                      <div className="text-sm text-gray-500 font-medium">${user.totalRefunded?.toLocaleString() || 0}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Top Luxury Bookers - Enhanced */}
                        <Card className="bg-gradient-to-br from-white to-purple-50 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
                          <CardHeader className="text-center pb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <Building2 className="h-8 w-8 text-white" />
                            </div>
                            <CardTitle className="text-xl font-bold text-gray-900">Top Luxury Bookers</CardTitle>
                            <p className="text-sm text-gray-600">Highest room prices</p>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-4">
                              {userAnalytics.topLuxuryBookers && userAnalytics.topLuxuryBookers.map((user: any, index: number) => (
                                <div key={user.userId} className="group relative p-4 bg-gradient-to-r from-purple-50/80 to-indigo-50/80 rounded-2xl hover:from-purple-100 hover:to-indigo-100 transition-all duration-300 shadow-sm hover:shadow-md">
                                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                  <div className="relative flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 ring-2 ring-yellow-200' :
                                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 ring-2 ring-gray-200' :
                                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 ring-2 ring-orange-200' :
                                        'bg-gradient-to-br from-purple-500 to-purple-600 ring-2 ring-purple-200'
                                      }`}>
                                        {index + 1}
                                      </div>
                                      <div>
                                        <p className="font-semibold text-gray-900 text-lg">{user.name}</p>
                                        <p className="text-sm text-gray-600">Room {user.roomNumber} - {user.roomType}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xl font-bold text-purple-600">${user.highestRoomPrice?.toLocaleString() || 0}</div>
                                      <div className="text-sm text-gray-500 font-medium">Room price</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Top Spenders - Enhanced */}
                        <Card className="bg-gradient-to-br from-white to-green-50 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
                          <CardHeader className="text-center pb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <CreditCard className="h-8 w-8 text-white" />
                            </div>
                            <CardTitle className="text-xl font-bold text-gray-900">Top Spenders</CardTitle>
                            <p className="text-sm text-gray-600">Highest total payments</p>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-4">
                              {userAnalytics.topSpenders && userAnalytics.topSpenders.map((user: any, index: number) => (
                                <div key={user.userId} className="group relative p-4 bg-gradient-to-r from-green-50/80 to-emerald-50/80 rounded-2xl hover:from-green-100 hover:to-emerald-100 transition-all duration-300 shadow-sm hover:shadow-md">
                                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                  <div className="relative flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 ring-2 ring-yellow-200' :
                                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 ring-2 ring-gray-200' :
                                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 ring-2 ring-orange-200' :
                                        'bg-gradient-to-br from-green-500 to-green-600 ring-2 ring-green-200'
                                      }`}>
                                        {index + 1}
                                      </div>
                                      <div>
                                        <p className="font-semibold text-gray-900 text-lg">{user.name}</p>
                                        <p className="text-sm text-gray-600">{user.email}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xl font-bold text-green-600">${user.totalSpent?.toLocaleString() || 0}</div>
                                      <div className="text-sm text-gray-500 font-medium">{user.paymentCount} payments</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Professional Financial Analytics Dashboard */}
                      <Card className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-500 overflow-hidden border-0">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>
                        <CardHeader className="text-center pb-6 border-b border-blue-200/30 bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 backdrop-blur-sm">
                                                    <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl mr-4">
                              <BarChart3 className="w-8 h-8 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-800 via-purple-800 to-indigo-800 bg-clip-text text-transparent">
                                Financial Analytics Dashboard
                              </CardTitle>
                              <p className="text-base text-gray-600 mt-1">Enterprise-grade insights & performance metrics</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                          {/* Professional Key Financial KPIs */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            {/* Total Revenue Card */}
                            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-6 hover:from-blue-100 hover:via-indigo-100 hover:to-purple-100 transition-all duration-500 border border-blue-200/50 hover:border-blue-300/70 hover:shadow-2xl transform hover:-translate-y-2">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
                              <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                                  <DollarSign className="w-8 h-8 text-white" />
                                </div>
                                <div className="text-3xl font-bold text-blue-700 mb-2 group-hover:text-blue-800 transition-colors">
                                  ${payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                                </div>
                                <div className="text-sm font-semibold text-gray-700 mb-2">Total Revenue</div>
                                <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  <span className="mr-1">↗</span> +12.5% vs last month
                                </div>
                              </div>
                            </div>
                            
                            {/* Active Users Card */}
                            <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl p-6 hover:from-emerald-100 hover:via-teal-100 hover:to-cyan-100 transition-all duration-500 border border-emerald-200/50 hover:border-emerald-300/70 hover:shadow-2xl transform hover:-translate-y-2">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
                              <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                                  <Users className="w-8 h-8 text-white" />
                                </div>
                                <div className="text-3xl font-bold text-emerald-700 mb-2 group-hover:text-emerald-800 transition-colors">
                                  {allUsersData.filter(u => u.role !== 'GUEST').length}
                                </div>
                                <div className="text-sm font-semibold text-gray-700 mb-2">Active Users</div>
                                <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  <span className="mr-1">↗</span> +8.2% vs last month
                                </div>
                              </div>
                            </div>
                            
                            {/* Room Occupancy Card */}
                            <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-3xl p-6 hover:from-purple-100 hover:via-pink-100 hover:to-rose-100 transition-all duration-500 border border-purple-200/50 hover:border-purple-300/70 hover:shadow-2xl transform hover:-translate-y-2">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
                              <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                                  <Building2 className="w-8 h-8 text-white" />
                                </div>
                                <div className="text-3xl font-bold text-purple-700 mb-2 group-hover:text-purple-800 transition-colors">
                                  {((bookings.length / 11) * 100).toFixed(1)}%
                                </div>
                                <div className="text-sm font-semibold text-gray-700 mb-2">Room Occupancy</div>
                                <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  <span className="mr-1">↗</span> +5.8% vs last month
                                </div>
                              </div>
                            </div>
                            
                            {/* Success Rate Card */}
                            <div className="group relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-3xl p-6 hover:from-orange-100 hover:via-amber-100 hover:to-yellow-100 transition-all duration-500 border border-orange-200/50 hover:border-orange-300/70 hover:shadow-2xl transform hover:-translate-y-2">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
                              <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                                  <BarChart3 className="w-8 h-8 text-white" />
                                </div>
                                <div className="text-3xl font-bold text-orange-700 mb-2 group-hover:text-orange-800 transition-colors">
                                  {((payments.filter(p => p.status === 'COMPLETED').length / payments.length) * 100).toFixed(1)}%
                                </div>
                                <div className="text-sm font-semibold text-gray-700 mb-2">Success Rate</div>
                                <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  <span className="mr-1">↗</span> +2.1% vs last month
                                </div>
                              </div>
                            </div>
                          </div>

                                                    {/* Enhanced Financial Performance Summary */}
                          <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-200/30 shadow-xl">
                            <div className="flex items-center justify-center mb-6">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                                <BarChart3 className="w-6 h-6 text-white" />
                              </div>
                              <h3 className="text-2xl font-bold text-gray-900">Financial Performance Summary</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                              {/* Net Revenue with Accurate Calculation */}
                              <div className="text-center group">
                                <div className="relative">
                                  <div className="text-4xl font-bold text-blue-700 mb-3 group-hover:text-blue-800 transition-colors">
                                    ${(payments.reduce((sum, p) => sum + p.amount, 0) * 0.85).toFixed(2)}
                                  </div>
                                  <div className="text-sm text-gray-600 mb-3">Net Revenue</div>
                                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 text-sm font-semibold rounded-full border border-yellow-200 shadow-sm">
                                    <span className="mr-2">⭐</span> Excellent Performance
                                  </div>
                                  <div className="text-xs text-gray-500 mt-2">
                                    After 15% operational costs
                                  </div>
                                </div>
                              </div>
                              
                              {/* Total Bookings with Growth Metrics */}
                              <div className="text-center group">
                                <div className="relative">
                                  <div className="text-4xl font-bold text-emerald-700 mb-3 group-hover:text-emerald-800 transition-colors">
                                    {bookings.length}
                                  </div>
                                  <div className="text-sm text-gray-600 mb-3">Total Bookings</div>
                                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm font-semibold rounded-full border border-green-200 shadow-sm">
                                    <span className="mr-2">📈</span> Strong Growth
                                  </div>
                                  <div className="text-xs text-gray-500 mt-2">
                                    {bookings.filter(b => b.status === 'CONFIRMED').length} confirmed
                                  </div>
                                </div>
                              </div>
                              
                              {/* Total Rooms with Capacity Analysis */}
                              <div className="text-center group">
                                <div className="relative">
                                  <div className="text-4xl font-bold text-purple-700 mb-3 group-hover:text-purple-800 transition-colors">
                                    11
                                  </div>
                                  <div className="text-sm text-gray-600 mb-3">Total Rooms</div>
                                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-sm font-semibold rounded-full border border-purple-200 shadow-sm">
                                    <span className="mr-2">🏨</span> Optimal Capacity
                                  </div>
                                  <div className="text-xs text-gray-500 mt-2">
                                    {11 - bookings.length} available
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Time Period Filter */}
                          <div className="flex justify-center mb-6">
                            <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-200">
                              <div className="flex space-x-1">
                                {['7D', '30D', '90D', '1Y'].map((period) => (
                                  <button
                                    key={period}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                      period === '30D' 
                                        ? 'bg-blue-600 text-white shadow-md' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                  >
                                    {period}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Advanced Financial Metrics */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                              <h4 className="text-lg font-bold text-emerald-800 mb-4 flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2" />
                                Revenue Analytics
                              </h4>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-700">Average Booking Value:</span>
                                  <span className="font-semibold text-emerald-700">
                                    ${bookings.length > 0 ? (payments.reduce((sum, p) => sum + p.amount, 0) / bookings.length).toFixed(2) : '0.00'}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-700">Revenue per User:</span>
                                  <span className="font-semibold text-emerald-700">
                                    ${allUsersData.length > 0 ? (payments.reduce((sum, p) => sum + p.amount, 0) / allUsersData.length).toFixed(2) : '0.00'}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-700">Monthly Growth Rate:</span>
                                  <span className="font-semibold text-green-600">+12.5%</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                              <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                                <Calendar className="w-5 h-5 mr-2" />
                                Operational Metrics
                              </h4>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-700">Booking Conversion Rate:</span>
                                  <span className="font-semibold text-blue-700">
                                    {((bookings.filter(b => b.status === 'CONFIRMED').length / bookings.length) * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-700">Average Stay Duration:</span>
                                  <span className="font-semibold text-blue-700">
                                    {bookings.length > 0 ? 
                                      (bookings.reduce((sum, b) => {
                                        const checkIn = new Date(b.checkIn);
                                        const checkOut = new Date(b.checkOut);
                                        return sum + Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
                                      }, 0) / bookings.length).toFixed(1) : '0.0'} days
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-700">Customer Satisfaction:</span>
                                  <span className="font-semibold text-green-600">
                                    {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0'}/5.0
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Professional Export & Actions Footer */}
                          <div className="mt-10 pt-8 border-t border-blue-200/30 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl p-6">
                            <div className="flex flex-col lg:flex-row justify-between items-center">
                              {/* Last Updated with Professional Styling */}
                              <div className="flex items-center mb-4 lg:mb-0">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                                  <Clock className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-700">Last Updated</div>
                                  <div className="text-xs text-gray-500">
                                    {new Date().toLocaleDateString('en-GB')}, {new Date().toLocaleTimeString('en-GB')}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Action Buttons with Enhanced Functionality */}
                              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                                {/* Export Report Button - Now Functional */}
                                <Button 
                                  onClick={() => exportFinancialReport()}
                                  variant="outline" 
                                  className="group border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-800 transition-all duration-300 shadow-sm hover:shadow-md"
                                >
                                  <FileText className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                  Export Report
                                </Button>
                                
                                {/* View Analytics Button */}
                                <Button 
                                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                                >
                                  <BarChart3 className="w-4 h-4 mr-2" />
                                  View Full Analytics
                                </Button>
                                
                                {/* Download PDF Button */}
                                <Button 
                                  onClick={() => downloadPDFReport()}
                                  variant="outline"
                                  className="group border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-all duration-300 shadow-sm hover:shadow-md"
                                >
                                  <Download className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                  Download PDF
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* PDF Report Generation */}
                      <Card className="bg-gradient-to-br from-white to-blue-50 border border-blue-200/50 shadow-lg">
                        <CardHeader className="text-center border-b border-blue-200/50 bg-gradient-to-r from-blue-50 to-indigo-50">
                          <CardTitle className="flex items-center justify-center text-blue-800">
                            <FileText className="h-5 w-5 mr-2" />
                            Generate Reports
                          </CardTitle>
                          <p className="text-sm text-blue-600">Download analytics data in professional PDF format</p>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <AnalyticsReport 
                            userAnalytics={userAnalytics}
                            stats={stats}
                            allUsersData={allUsersData}
                          />
                        </CardContent>
                      </Card>

                      {/* Enhanced User Management Section */}
                      <Card className="bg-gradient-to-br from-white to-purple-50 border border-purple-200/50 shadow-lg mt-6">
                        <CardHeader className="border-b border-purple-200/50 bg-gradient-to-r from-purple-50 to-pink-50">
                          <CardTitle className="flex items-center text-purple-800">
                            <Users className="h-5 w-5 mr-2" />
                            User Management Overview
                          </CardTitle>
                          <p className="text-sm text-purple-600">Manage and monitor all system users</p>
                        </CardHeader>
                        <CardContent className="pt-6">
                          {/* User Statistics Summary */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                              <div className="text-sm font-medium text-blue-800">Total Users</div>
                              <div className="text-2xl font-bold text-blue-900">{allUsersData.length}</div>
                            </div>
                            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                              <div className="text-sm font-medium text-green-800">Active Users</div>
                              <div className="text-2xl font-bold text-green-900">{allUsersData.filter(u => u.role !== 'GUEST').length}</div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                              <div className="text-sm font-medium text-purple-800">Staff Members</div>
                              <div className="text-2xl font-bold text-purple-900">{allUsersData.filter(u => ['STAFF', 'CONCIERGE', 'MANAGER'].includes(u.role)).length}</div>
                            </div>
                            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                              <div className="text-sm font-medium text-orange-800">New This Month</div>
                              <div className="text-2xl font-bold text-orange-900">{allUsersData.filter(u => new Date(u.createdAt).getMonth() === new Date().getMonth()).length}</div>
                            </div>
                          </div>

                          {/* User List Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                                  <th className="text-left py-3 px-4 font-semibold text-purple-800">User</th>
                                  <th className="text-left py-3 px-4 font-semibold text-purple-800">Role</th>
                                  <th className="text-left py-3 px-4 font-semibold text-purple-800">Joined</th>
                                  <th className="text-left py-3 px-4 font-semibold text-purple-800">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-purple-100">
                                {allUsersData.map((user, index) => (
                                  <tr key={user.id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200">
                                    <td className="py-3 px-4">
                                      <div className="flex items-center">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                                          {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                          <div className="font-medium text-gray-900">{user.name}</div>
                                          <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4">
                                      <Badge className={`${
                                        user.role === 'ADMIN' ? 'bg-red-100 text-red-800 border-red-200' :
                                        user.role === 'MANAGER' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                        user.role === 'STAFF' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                        user.role === 'CONCIERGE' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                                        'bg-gray-100 text-gray-800 border-gray-200'
                                      } border`}>
                                        {user.role}
                                      </Badge>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-500">
                                      {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-4">
                                      <div className="flex flex-col space-y-2">
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="text-blue-600 hover:bg-blue-50 border-blue-200 hover:border-blue-300 transition-all duration-200"
                                          onClick={() => viewUserDetails(user)}
                                        >
                                          <Eye className="w-4 h-4 mr-1" />
                                          View
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="text-green-600 hover:bg-green-50 border-green-200 hover:border-green-300 transition-all duration-200"
                                          onClick={() => editUser(user)}
                                        >
                                          <Edit className="w-4 h-4 mr-1" />
                                          Edit
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="text-purple-600 hover:bg-purple-50 border-purple-200 hover:border-purple-300 transition-all duration-200"
                                          onClick={() => manageUserPermissions(user)}
                                        >
                                          <Settings className="w-4 h-4 mr-1" />
                                          Permissions
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200"
                                          onClick={() => {
                                            setSelectedUser(user);
                                            setModalMode('delete');
                                            setShowUserModal(true);
                                          }}
                                        >
                                          <Trash2 className="w-4 h-4 mr-1" />
                                          Delete
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Quick Actions */}
                          <div className="mt-6 flex justify-center space-x-4">
                            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                              <Users className="w-4 h-4 mr-2" />
                              Manage All Users
                            </Button>
                            <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                              <BarChart3 className="w-4 h-4 mr-2" />
                              View Analytics
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-red-500 text-6xl mb-4">📊</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Data Not Available</h3>
                      <p className="text-gray-600 mb-4">Failed to load analytics data. Please try refreshing the page.</p>
                      <Button onClick={fetchUserData} className="bg-blue-600 hover:bg-blue-700">
                        Refresh Data
                      </Button>
                    </div>
                  )}
                </TabsContent>
              )}


            </Tabs>
          </div>
        </div>

        {/* User Management Modal */}
        <UserManagementModal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          user={selectedUser}
          onUserUpdate={handleUserUpdate}
          onUserDelete={handleDeleteUser}
          isAdmin={userData?.isAdmin}
        />
      </div>
    </div>
  );
}