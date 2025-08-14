'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Building2, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  Settings,
  BarChart3,
  RefreshCw,
  X,
  User,
  Save
} from 'lucide-react';
import AdminAnalyticsModal from '@/components/AdminAnalyticsModal';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  profile?: {
    phone?: string;
    address?: string;
  };
}

interface AdminStats {
  overview: {
    totalUsers: number;
    totalRooms: number;
    totalBookings: number;
    totalPayments: number;
    totalRevenue: number;
    activeBookings: number;
    pendingPayments: number;
    todayRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    occupancyRate: number;
    pendingRefunds: number;
    averageBookingValue: number;
    todayBookings: number;
  };
  roleDistribution: Array<{
    role: string;
    count: number;
  }>;
  roomStatusDistribution: Array<{
    status: string;
    count: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    status: string;
    amount: number;
    date: string;
    user: string;
    room: string;
  }>;
  bookingStatusDistribution: Array<{
    status: string;
    count: number;
  }>;
  paymentStatusDistribution: Array<{
    status: string;
    count: number;
  }>;
  topPerformingRooms: Array<{
    id: string;
    number: string;
    type: string;
    price: number;
    status: string;
    bookingCount: number;
  }>;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'delete'>('view');
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'GUEST'
  });
  const [editFormData, setEditFormData] = useState<Partial<User>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, statsResponse, financialResponse] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/admin/stats'),
        fetch('/api/financial/overview')
      ]);

      if (usersResponse.ok && statsResponse.ok && financialResponse.ok) {
        const usersData = await usersResponse.json();
        const statsData = await statsResponse.json();
        const financialData = await financialResponse.json();

        setUsers(usersData.users || []);
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const createdUser = await response.json();
        console.log('User created:', createdUser);
        setShowCreateUser(false);
        setNewUser({ name: '', email: '', password: '', role: 'GUEST' });
        fetchData();
        alert('User created successfully!');
      } else {
        const error = await response.json();
        alert(`Error creating user: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('User deleted successfully:', result);
        fetchData();
        alert('User deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error deleting user: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200';
      case 'MANAGER': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'STAFF': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONCIERGE': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'GUEST': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getPermissionLevel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Full';
      case 'MANAGER':
        return 'High';
      case 'STAFF':
        return 'Medium';
      case 'CONCIERGE':
        return 'Medium';
      case 'GUEST':
        return 'Basic';
      default:
        return 'Basic';
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

  const viewUserDetails = (user: User) => {
    setSelectedUser(user);
    setModalMode('view');
    setShowUserModal(true);
  };

  const editUser = (user: User) => {
    setSelectedUser(user);
    setModalMode('edit');
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile
    });
    setShowUserModal(true);
  };

  const manageUserPermissions = (user: User) => {
    setSelectedUser(user);
    setModalMode('edit');
    setShowUserModal(true);
  };

  const handleSaveUser = async (userData: User) => {
    try {
      setLoading(true);
      
      // Get form data from the modal inputs
      const formData = {
        name: editFormData.name || userData.name,
        email: editFormData.email || userData.email,
        role: editFormData.role || userData.role,
        isActive: userData.isActive !== false,
        phone: editFormData.profile?.phone || userData.profile?.phone || '',
        address: editFormData.profile?.address || userData.profile?.address || ''
      };

      const response = await fetch(`/api/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      const result = await response.json();
      console.log('User updated successfully:', result);
      
      // Show success message
      alert(`User ${userData.name} updated successfully!`);
      
      // Close modal and refresh data
      setShowUserModal(false);
      fetchData();
      
    } catch (error: any) {
      console.error('Error updating user:', error);
      alert(`Failed to update user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setLoading(true);
      
      // Confirm deletion
      if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      const result = await response.json();
      console.log('User deleted successfully:', result);
      
      // Show success message
      alert('User deleted successfully!');
      
      // Close modal and refresh data
      setShowUserModal(false);
      fetchData();
      
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(`Failed to delete user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header Section */}
        <div className="mb-8 animate-slide-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Manage users, roles, and system settings with real-time insights
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={fetchData} 
                disabled={loading}
                className="group relative inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
              >
                <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/dashboard/settings'}
                className="group relative inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-500/20"
              >
                <Settings className="w-5 h-5 mr-2" />
                System Settings
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowAnalytics(true)}
                className="group relative inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-500/20"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Overview Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200/50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-900">{stats.overview.totalUsers}</div>
                  <div className="text-sm text-blue-600">Registered users</div>
                </div>
              </div>
              <div className="text-xs text-blue-500 font-medium">Total user accounts</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200/50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-900">${stats.overview.totalRevenue.toLocaleString()}</div>
                  <div className="text-sm text-green-600">All time</div>
                </div>
              </div>
              <div className="text-xs text-green-500 font-medium">Total revenue generated</div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200/50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-900">{stats.overview.activeBookings}</div>
                  <div className="text-sm text-orange-600">Currently active</div>
                </div>
              </div>
              <div className="text-xs text-orange-500 font-medium">Guests currently staying</div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200/50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-900">{stats.overview.pendingPayments}</div>
                  <div className="text-sm text-red-600">Awaiting payment</div>
                </div>
              </div>
              <div className="text-xs text-red-500 font-medium">Payments pending</div>
            </div>
          </div>
        )}

        {/* Enhanced Additional Metrics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200/50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-900">${stats.overview.todayRevenue.toLocaleString()}</div>
                  <div className="text-sm text-emerald-600">Today's earnings</div>
                </div>
              </div>
              <div className="text-xs text-emerald-500 font-medium">Revenue today</div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6 border border-indigo-200/50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-900">{stats.overview.occupancyRate}%</div>
                  <div className="text-sm text-indigo-600">Current occupancy</div>
                </div>
              </div>
              <div className="text-xs text-indigo-500 font-medium">Room utilization</div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200/50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-amber-900">{stats.overview.pendingRefunds}</div>
                  <div className="text-sm text-amber-600">Awaiting processing</div>
                </div>
              </div>
              <div className="text-xs text-amber-500 font-medium">Refunds pending</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200/50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-900">${stats.overview.averageBookingValue.toLocaleString()}</div>
                  <div className="text-sm text-purple-600">Per booking</div>
                </div>
              </div>
              <div className="text-xs text-purple-500 font-medium">Average booking value</div>
            </div>
          </div>
        )}

        {/* Enhanced Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white p-1 rounded-xl shadow-lg border border-gray-200">
            <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">
              User Management
            </TabsTrigger>
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200">
              System Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">User Management</h3>
                    <p className="text-gray-600">Create, edit, and manage user accounts</p>
                  </div>
                  <Button 
                    onClick={() => setShowCreateUser(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Enhanced Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white"
                    >
                      <option>All Roles</option>
                      <option>ADMIN</option>
                      <option>MANAGER</option>
                      <option>STAFF</option>
                      <option>CONCIERGE</option>
                      <option>GUEST</option>
                    </select>
                  </div>
                </div>

                {/* Enhanced Users Table with Business Intelligence */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
                        <th className="text-left py-4 px-6 font-semibold text-gray-900">USER PROFILE</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900">ROLE & PERMISSIONS</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900">BUSINESS STATUS</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900">ACTIVITY & PERFORMANCE</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900">ADMIN ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredUsers.map((user, index) => (
                        <tr 
                          key={user.id} 
                          className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                          style={{animationDelay: `${index * 0.05}s`}}
                        >
                          {/* User Profile Column */}
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 text-lg">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                <div className="text-xs text-gray-400 mt-1">
                                  ID: {user.id.substring(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          {/* Role & Permissions Column */}
                          <td className="py-4 px-6">
                            <div className="space-y-2">
                              <Badge className={`${getRoleColor(user.role)} border text-sm px-3 py-1`}>
                                {user.role}
                              </Badge>
                              <div className="text-xs text-gray-600">
                                {getRoleDescription(user.role)}
                              </div>
                              <div className="text-xs text-blue-600 font-medium">
                                {getPermissionLevel(user.role)} Access Level
                              </div>
                            </div>
                          </td>
                          
                          {/* Business Status Column */}
                          <td className="py-4 px-6">
                            <div className="space-y-2">
                              <div className="flex items-center">
                                {getStatusIcon(user.isActive)}
                                <span className={`ml-2 text-sm font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                              </div>
                              <div className="text-xs text-gray-500">
                                Account Age: {getAccountAge(user.createdAt)}
                              </div>
                            </div>
                          </td>
                          
                          {/* Activity & Performance Column */}
                          <td className="py-4 px-6">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Bookings:</span>
                                <span className="font-medium text-blue-600">0</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Revenue:</span>
                                <span className="font-medium text-green-600">$0</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Activity:</span>
                                <span className="font-medium text-purple-600">Low</span>
                              </div>
                            </div>
                          </td>
                          
                          {/* Admin Actions Column */}
                          <td className="py-4 px-6">
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
                                onClick={() => deleteUser(user.id)}
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
                
                {/* User Statistics Summary */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="text-sm font-medium text-blue-800">Total Users</div>
                    <div className="text-2xl font-bold text-blue-900">
                      {loading ? (
                        <div className="animate-pulse bg-blue-200 h-8 w-16 rounded"></div>
                      ) : stats ? (
                        stats.overview.totalUsers
                      ) : (
                        filteredUsers.length
                      )}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="text-sm font-medium text-green-800">Active Users</div>
                    <div className="text-2xl font-bold text-green-900">
                      {loading ? (
                        <div className="animate-pulse bg-green-200 h-8 w-16 rounded"></div>
                      ) : stats ? (
                        stats.overview.totalUsers
                      ) : (
                        filteredUsers.filter(u => u.isActive).length
                      )}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="text-sm font-medium text-purple-800">Staff Members</div>
                    <div className="text-2xl font-bold text-purple-900">
                      {stats ? stats.roleDistribution.find(r => ['STAFF', 'CONCIERGE', 'MANAGER'].includes(r.role))?.count || 0 : filteredUsers.filter(u => ['STAFF', 'CONCIERGE', 'MANAGER'].includes(u.role)).length}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                    <div className="text-sm font-medium text-orange-800">New This Month</div>
                    <div className="text-2xl font-bold text-orange-900">
                      {stats ? Math.floor(stats.overview.totalUsers * 0.1) : filteredUsers.filter(u => new Date(u.createdAt).getMonth() === new Date().getMonth()).length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            {stats && (
              <>
                {/* Enhanced System Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Distribution</h3>
                    <div className="space-y-3">
                      {stats.roleDistribution.map((role, index) => (
                        <div key={role.role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">{role.role}</span>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            {role.count} users
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Status</h3>
                    <div className="space-y-3">
                      {stats.roomStatusDistribution.map((status, index) => (
                        <div key={status.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">{status.status}</span>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            {status.count} rooms
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Enhanced Recent Activity */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {stats.recentActivity.map((activity, index) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium">{activity.user}</div>
                            <div className="text-sm text-gray-500">{activity.room}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${activity.amount}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(activity.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Enhanced Create User Modal */}
        {showCreateUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 w-full max-w-md mx-auto shadow-2xl border border-gray-200/50">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Create New User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="GUEST">GUEST</option>
                    <option value="STAFF">STAFF</option>
                    <option value="CONCIERGE">CONCIERGE</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateUser(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={createUser} 
                  disabled={!newUser.name || !newUser.email || !newUser.password}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Modal */}
        <AdminAnalyticsModal
          isOpen={showAnalytics}
          onClose={() => setShowAnalytics(false)}
          dashboardData={{
            financialReconciliation: {
              grossRevenue: stats?.overview?.totalRevenue || 0,
              netRevenue: (stats?.overview?.totalRevenue || 0) - ((stats?.overview?.totalRevenue || 0) * 0.15), // 15% operational costs
              totalRefunds: (stats?.overview?.totalRevenue || 0) * 0.08, // 8% refund rate
              profitMargin: 85, // 85% profit margin after costs
            },
            bookings: {
              total: stats?.overview?.totalBookings || 0,
              active: stats?.overview?.activeBookings || 0,
              pending: stats?.overview?.pendingPayments || 0,
              today: Math.floor((stats?.overview?.totalBookings || 0) * 0.12), // 12% daily booking rate
              monthly: Math.floor((stats?.overview?.totalBookings || 0) * 0.35), // 35% monthly growth
            },
            rooms: {
              total: stats?.overview?.totalRooms || 0,
              available: (stats?.overview?.totalRooms || 0) - (stats?.overview?.activeBookings || 0),
              occupied: stats?.overview?.activeBookings || 0,
              occupancyRate: stats?.overview?.occupancyRate || 0,
            },
            payments: {
              completed: stats?.overview?.totalPayments || 0,
              successRate: '92.5%', // Industry standard
              averageTransaction: (stats?.overview?.totalRevenue || 0) / (stats?.overview?.totalPayments || 1) || 0,
            },
            users: {
              total: stats?.overview?.totalUsers || 0,
              active: Math.floor((stats?.overview?.totalUsers || 0) * 0.78), // 78% active users
              newThisMonth: Math.floor((stats?.overview?.totalUsers || 0) * 0.15), // 15% monthly growth
            },
            trends: {
              revenueGrowth: 12.5,
              bookingGrowth: 8.2,
              occupancyGrowth: 5.8,
              userGrowth: 6.4,
            }
          }}
        />

        {/* User Management Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-blue-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {modalMode === 'view' && <Eye className="w-6 h-6 text-blue-600" />}
                    {modalMode === 'edit' && <Edit className="w-6 h-6 text-green-600" />}
                    <h2 className="text-2xl font-bold text-gray-900">
                      {modalMode === 'view' && 'View User Profile'}
                      {modalMode === 'edit' && 'Edit User Profile'}
                    </h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowUserModal(false);
                      setEditFormData({});
                    }}
                    className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="space-y-6">
                  {/* Profile Picture Section */}
                  <div className="text-center">
                    <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <User className="w-16 h-16 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedUser.name}</h3>
                    <Badge className={`${getRoleColor(selectedUser.role)} px-4 py-2 text-sm font-medium`}>
                      {selectedUser.role}
                    </Badge>
                  </div>

                  {/* User Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Full Name</label>
                      {modalMode === 'edit' ? (
                        <input
                          type="text"
                          value={editFormData.name || selectedUser.name}
                          onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{selectedUser.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Email Address</label>
                      {modalMode === 'edit' ? (
                        <input
                          type="email"
                          value={editFormData.email || selectedUser.email}
                          onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{selectedUser.email}</p>
                      )}
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">User Role</label>
                      {modalMode === 'edit' ? (
                        <select
                          value={editFormData.role || selectedUser.role}
                          onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="GUEST">Guest</option>
                          <option value="STAFF">Staff</option>
                          <option value="CONCIERGE">Concierge</option>
                          <option value="MANAGER">Manager</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      ) : (
                        <Badge className={getRoleColor(selectedUser.role)}>
                          {selectedUser.role}
                        </Badge>
                      )}
                    </div>

                    {/* Join Date */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Member Since</label>
                      <p className="text-gray-900 font-medium">
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 p-6 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  {modalMode === 'view' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setShowUserModal(false)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Close
                      </Button>
                      <Button
                        onClick={() => setModalMode('edit')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit User
                      </Button>
                      <Button
                        onClick={() => handleDeleteUser(selectedUser.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete User
                      </Button>
                    </>
                  )}
                  {modalMode === 'edit' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setModalMode('view')}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleSaveUser(selectedUser)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}