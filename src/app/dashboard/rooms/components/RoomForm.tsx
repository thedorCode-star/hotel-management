'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Upload, X, Building, Users, DollarSign, FileText } from 'lucide-react';

interface RoomFormProps {
  room?: {
    id: string;
    number: string;
    type: string;
    capacity: number;
    price: number;
    description?: string;
    status: string;
  };
  mode: 'create' | 'edit';
  onClose: () => void;
}

const roomTypes = ['SINGLE', 'DOUBLE', 'SUITE', 'DELUXE'];
const roomStatuses = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED'];

export default function RoomForm({ room, mode, onClose }: RoomFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    number: room?.number || '',
    type: room?.type || 'SINGLE',
    capacity: room?.capacity || '',
    price: room?.price || '',
    description: room?.description || '',
    status: room?.status || 'AVAILABLE',
  });
  const [roomImage, setRoomImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageError, setImageError] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.number.trim()) {
      newErrors.number = 'Room number is required';
    }

    const capacity = Number(formData.capacity);
    if (!capacity || capacity < 1 || capacity > 10) {
      newErrors.capacity = 'Capacity must be between 1 and 10';
    }

    const price = Number(formData.price);
    if (!price || price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    // Validate image if provided
    if (roomImage) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (roomImage.size > maxSize) {
        newErrors.image = 'Image size must be less than 5MB';
      }
      
      if (!roomImage.type.startsWith('image/')) {
        newErrors.image = 'Please select a valid image file';
      }
    }

    setErrors(newErrors);
    setImageError(newErrors.image || '');
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Form submission started');
    console.log('📝 Form data:', formData);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    setIsSubmitting(true);
    setErrors({}); // Clear previous errors

    try {
      const roomData: any = { ...formData };
      
      console.log('🏗️ Preparing room data:', roomData);
      
      // If there's an image, upload it first
      if (roomImage) {
        console.log('🖼️ Image upload required');
        const formDataImage = new FormData();
        formDataImage.append('image', roomImage);
        formDataImage.append('roomNumber', formData.number);
        
        const imageResponse = await fetch('/api/rooms/image', {
          method: 'POST',
          body: formDataImage
        });
        
        if (imageResponse.ok) {
          const imageResult = await imageResponse.json();
          roomData.imageUrl = imageResult.imageUrl;
          console.log('✅ Image upload successful:', imageResult);
        } else {
          const errorData = await imageResponse.json();
          console.log('❌ Image upload failed:', errorData);
          setErrors({ submit: `Image upload failed: ${errorData.message}` });
          return;
        }
      }

      const url = mode === 'create' ? '/api/rooms' : `/api/rooms/${room?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      console.log('🌐 Making API request:', { url, method, roomData });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
      });

      console.log('📡 API response received:', { status: response.status, ok: response.ok });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to save room';
        
        // Handle specific error cases
        if (errorMessage.includes('Room number already exists')) {
          setErrors({ number: 'Room number already exists. Please choose a different number.' });
        } else if (errorMessage.includes('Capacity must be between')) {
          setErrors({ capacity: errorMessage });
        } else if (errorMessage.includes('Price must be positive')) {
          setErrors({ price: errorMessage });
        } else {
          setErrors({ submit: errorMessage });
        }
        return; // Don't proceed with success actions
      }

      // Success!
      setIsSuccess(true);
      setTimeout(() => {
        router.refresh();
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error saving room:', error);
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
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

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setRoomImage(file);
      setImageError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setRoomImage(null);
    setImagePreview('');
    setImageError('');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.5) 0%, rgba(147, 51, 234, 0.5) 50%, rgba(79, 70, 229, 0.5) 100%)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      backgroundColor: 'rgba(59, 130, 246, 0.3)'
    }}>
      <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-3xl p-4 w-full max-w-md mx-auto max-h-[80vh] flex flex-col shadow-2xl border border-blue-200 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {mode === 'create' ? 'Create New Room' : 'Edit Room'}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center hover:from-red-500 hover:to-red-600 transition-all duration-200 shadow-sm"
          >
            <span className="text-white font-bold text-sm">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto">
          {/* Room Image Upload Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Room Image
            </label>
            <div className="space-y-2">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Room preview"
                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              {/* Upload Button */}
              {!imagePreview && (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-gradient-to-br from-blue-50/50 to-indigo-50/50 hover:from-blue-100/50 hover:to-indigo-100/50 transition-all duration-200">
                  <div className="flex flex-col items-center justify-center">
                    <Camera className="w-6 h-6 text-blue-500 mb-1" />
                    <p className="text-xs text-blue-600 text-center">
                      <span className="font-semibold">Click to upload</span><br/>or drag and drop
                    </p>
                    <p className="text-xs text-blue-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
              
              {imageError && (
                <p className="text-red-500 text-xs">{imageError}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Room Number *
            </label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 ${
                errors.number ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 101"
            />
            {errors.number && (
              <p className="text-red-500 text-sm mt-1">{errors.number}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
              <Building className="w-4 h-4 mr-2 text-blue-500" />
              Room Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
            >
              {roomTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
              <Users className="w-4 h-4 mr-2 text-green-500" />
              Capacity *
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', e.target.value)}
              placeholder="Enter guest capacity"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 ${
                errors.capacity ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.capacity && (
              <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-yellow-500" />
              Price per Night *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="Enter nightly rate"
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.price && (
              <p className="text-red-500 text-xs mt-1">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
            >
              {roomStatuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-purple-500" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={2}
              placeholder="Describe the room's features, amenities, and unique characteristics..."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-600">
                    {mode === 'create' ? 'Room created successfully!' : 'Room updated successfully!'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-200 hover:shadow-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-all duration-200 hover:shadow-lg shadow-md"
            >
              {isSubmitting ? 'Saving...' : isSuccess ? 'Success!' : mode === 'create' ? 'Create Room' : 'Update Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 