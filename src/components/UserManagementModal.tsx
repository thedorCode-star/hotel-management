'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  X, 
  Save, 
  Eye, 
  EyeOff,
  Shield,
  Trash2,
  AlertCircle
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  preferences?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile | null;
  onUserUpdate: (updatedUser: UserProfile) => void;
  onUserDelete?: (userId: string) => void;
  isAdmin?: boolean;
}

export default function UserManagementModal({ 
  isOpen, 
  onClose, 
  user, 
  onUserUpdate, 
  onUserDelete,
  isAdmin = false 
}: UserManagementModalProps) {
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // Available roles
  const availableRoles = ['GUEST', 'STAFF', 'CONCIERGE', 'MANAGER', 'ADMIN'];

  useEffect(() => {
    if (user) {
      console.log('👤 Setting user data:', user);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'GUEST',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
        postalCode: user.postalCode || '',
        dateOfBirth: user.dateOfBirth || '',
        emergencyContact: user.emergencyContact || '',
        preferences: user.preferences || '',
        avatar: user.avatar || '',
        isActive: user.isActive !== undefined ? user.isActive : true
      });
      
      // Set avatar preview - check if user has profile data
      if (user.avatar) {
        console.log('🖼️ Setting avatar preview:', user.avatar);
        setAvatarPreview(user.avatar);
      } else {
        console.log('🖼️ No avatar found, using default');
        setAvatarPreview('');
      }
    }
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPEG, PNG, GIF)');
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      setAvatarFile(file);
      setError(null); // Clear any previous errors
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      console.log('🖼️ Avatar file selected:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Validate passwords if changing
      if (newPassword && newPassword !== confirmPassword) {
        setError('New passwords do not match');
        setIsLoading(false);
        return;
      }

      if (newPassword && newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        setIsLoading(false);
        return;
      }

      // Prepare update data
      const updateData = {
        ...formData,
        ...(newPassword && { password: newPassword })
      };

      // If there's a new avatar file, upload it first
      if (avatarFile) {
        try {
          setSuccess('Uploading profile picture...');
          
          const formDataAvatar = new FormData();
          formDataAvatar.append('avatar', avatarFile);
          formDataAvatar.append('userId', user?.id || '');

          console.log('🖼️ Uploading avatar for user:', user?.id);
          console.log('🖼️ File details:', {
            name: avatarFile.name,
            size: avatarFile.size,
            type: avatarFile.type
          });

          const avatarResponse = await fetch('/api/users/avatar', {
            method: 'POST',
            body: formDataAvatar
          });

          if (avatarResponse.ok) {
            const avatarResult = await avatarResponse.json();
            console.log('✅ Avatar uploaded successfully:', avatarResult);
            updateData.avatar = avatarResult.avatarUrl;
            setSuccess('Profile picture uploaded! Saving user data...');
          } else {
            const errorData = await avatarResponse.json();
            console.error('❌ Avatar upload failed:', errorData);
            setError(`Avatar upload failed: ${errorData.message || 'Unknown error'}`);
            setIsLoading(false);
            return;
          }
        } catch (avatarError) {
          console.error('❌ Avatar upload error:', avatarError);
          setError('Failed to upload avatar. Please try again.');
          setIsLoading(false);
          return;
        }
      }

      // Update user profile
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        onUserUpdate(updatedUser);
        setSuccess(`User ${updatedUser.name || 'updated'} successfully!${avatarFile ? ' Profile picture saved!' : ''}`);
        
        // Reset password fields
        setNewPassword('');
        setConfirmPassword('');
        
        // Reset avatar file but keep preview for display
        setAvatarFile(null);
        
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update user');
      }
    } catch (err) {
      setError('An error occurred while updating the user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!onUserDelete || !user) return;
    
    if (confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/users/${user.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          onUserDelete(user.id);
          setSuccess('User deleted successfully!');
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to delete user');
        }
      } catch (err) {
        setError('An error occurred while deleting the user');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(147, 51, 234, 0.4) 50%, rgba(79, 70, 229, 0.4) 100%)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)'
    }}>
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-blue-200/50 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-200/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {user ? 'Edit User' : 'Add New User'}
              </h2>
              <p className="text-sm text-blue-700 font-medium">
                {user ? `Managing ${user.name}` : 'Create a new user account'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-md"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-lg">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Camera Upload Button */}
              <label 
                className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                title="Click to upload or drag image here"
              >
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
              
              {/* Remove Avatar Button (only show if there's a preview) */}
              {avatarPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarFile(null);
                    setAvatarPreview('');
                    setError(null);
                  }}
                  className="absolute top-0 right-0 w-6 h-6 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center cursor-pointer hover:from-red-500 hover:to-red-600 transition-all duration-200 shadow-md"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-blue-600 font-medium">
                {avatarPreview ? 'Profile picture updated' : 'Click the camera icon to change profile picture'}
              </p>
              {avatarFile && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">
                    File: {avatarFile.name} ({(avatarFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{width: '100%'}}></div>
                  </div>
                  <p className="text-xs text-blue-600">Ready to save</p>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Supported formats: JPEG, PNG, GIF • Max size: 5MB
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                value={formData.role || 'GUEST'}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                disabled={!isAdmin}
              >
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              {!isAdmin && (
                <p className="text-xs text-gray-500 mt-1">
                  Only admins can change user roles
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={formData.country || ''}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                value={formData.postalCode || ''}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth || ''}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact
              </label>
              <input
                type="text"
                value={formData.emergencyContact || ''}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferences
            </label>
            <textarea
              value={formData.preferences || ''}
              onChange={(e) => handleInputChange('preferences', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any special preferences or notes..."
            />
          </div>

          {/* Password Change Section */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-blue-500" />
              Change Password
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Leave blank to keep current"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive !== undefined ? formData.isActive : true}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Account is active
            </label>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-green-700">{success}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-blue-200/50 bg-gradient-to-r from-blue-50/30 to-indigo-50/30">
            <div className="flex space-x-3">
              {onUserDelete && user && (
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete User</span>
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
