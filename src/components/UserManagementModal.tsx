'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Camera,
  Shield,
  Settings,
  Eye,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  isActive?: boolean;
  profile?: {
    phone?: string;
    address?: string;
  };
}

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData | null;
  mode: 'view' | 'edit' | 'delete';
  onSave?: (userData: UserData) => Promise<void>;
  onDelete?: (userId: string) => Promise<void>;
}

export default function UserManagementModal({
  isOpen,
  onClose,
  user,
  mode,
  onSave,
  onDelete
}: UserManagementModalProps) {
  const [formData, setFormData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({ ...user });
      // Set default profile picture if none exists
      setProfilePicture(`https://ui-avatars.com/api/?name=${user.name}&background=random&color=fff&size=128`);
    }
  }, [user]);

  const handleInputChange = (field: keyof UserData, value: string | boolean) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleProfileChange = (field: string, value: string) => {
    if (formData) {
      setFormData({
        ...formData,
        profile: {
          ...formData.profile,
          [field]: value
        }
      });
    }
  };

  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData || !onSave) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await onSave(formData);
      setSuccess('User updated successfully!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setError(error.message || 'Failed to save user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !onDelete) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await onDelete(user.id);
      setSuccess('User deleted successfully!');
      setTimeout(() => {
        setShowDeleteConfirm(false);
        onClose();
      }, 1500);
    } catch (error: any) {
      setError(error.message || 'Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200';
      case 'MANAGER': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'STAFF': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONCIERGE': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'GUEST': return 'bg-gray-100 text-gray-800 border-gray-200';
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

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-blue-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {mode === 'view' && <Eye className="w-6 h-6 text-blue-600" />}
              {mode === 'edit' && <Edit className="w-6 h-6 text-green-600" />}
              {mode === 'delete' && <Trash2 className="w-6 h-6 text-red-600" />}
              <h2 className="text-2xl font-bold text-gray-900">
                {mode === 'view' && 'View User Profile'}
                {mode === 'edit' && 'Edit User Profile'}
                {mode === 'delete' && 'Delete User'}
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mx-6 mt-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {mode === 'delete' ? (
            /* Delete Confirmation */
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Delete User: {user.name}?
              </h3>
              <p className="text-gray-600 mb-6">
                This action cannot be undone. The user will be permanently removed from the system.
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isLoading ? 'Deleting...' : 'Delete User'}
                </Button>
              </div>
            </div>
          ) : (
            /* View/Edit Content */
            <div className="space-y-6">
              {/* Profile Picture Section */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 mx-auto mb-4 shadow-lg">
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-16 h-16 text-white" />
                      </div>
                    )}
                  </div>
                  {mode === 'edit' && (
                    <label className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <Camera className="w-5 h-5 text-blue-600" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h3>
                <Badge className={`${getRoleColor(user.role)} px-4 py-2 text-sm font-medium`}>
                  {user.role}
                </Badge>
                <p className="text-sm text-gray-600 mt-2">{getRoleDescription(user.role)}</p>
              </div>

              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <User className="w-4 h-4 mr-2 text-blue-600" />
                    Full Name
                  </label>
                  {mode === 'edit' ? (
                    <input
                      type="text"
                      value={formData?.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{user.name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-blue-600" />
                    Email Address
                  </label>
                  {mode === 'edit' ? (
                    <input
                      type="email"
                      value={formData?.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{user.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-blue-600" />
                    Phone Number
                  </label>
                  {mode === 'edit' ? (
                    <input
                      type="tel"
                      value={formData?.profile?.phone || ''}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{user.profile?.phone || 'Not provided'}</p>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                    Address
                  </label>
                  {mode === 'edit' ? (
                    <input
                      type="text"
                      value={formData?.profile?.address || ''}
                      onChange={(e) => handleProfileChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter address"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{user.profile?.address || 'Not provided'}</p>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-blue-600" />
                    User Role
                  </label>
                  {mode === 'edit' ? (
                    <select
                      value={formData?.role || ''}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="GUEST">Guest</option>
                      <option value="STAFF">Staff</option>
                      <option value="CONCIERGE">Concierge</option>
                      <option value="MANAGER">Manager</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  ) : (
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  )}
                </div>

                {/* Join Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-blue-600" />
                    Member Since
                  </label>
                  <p className="text-gray-900 font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Account Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Settings className="w-4 h-4 mr-2 text-blue-600" />
                  Account Status
                </label>
                {mode === 'edit' ? (
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="status"
                        value="active"
                        checked={formData?.isActive !== false}
                        onChange={() => handleInputChange('isActive', true)}
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="status"
                        value="inactive"
                        checked={formData?.isActive === false}
                        onChange={() => handleInputChange('isActive', false)}
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Inactive</span>
                    </label>
                  </div>
                ) : (
                  <Badge className={user.isActive !== false ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                    {user.isActive !== false ? 'Active' : 'Inactive'}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 p-6 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            {mode === 'view' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => onClose()}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {/* Switch to edit mode */}}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit User
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </Button>
              </>
            )}
            {mode === 'edit' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => onClose()}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
