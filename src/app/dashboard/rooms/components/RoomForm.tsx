'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    capacity: room?.capacity || 1,
    price: room?.price || 0,
    description: room?.description || '',
    status: room?.status || 'AVAILABLE',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.number.trim()) {
      newErrors.number = 'Room number is required';
    }

    if (formData.capacity < 1 || formData.capacity > 10) {
      newErrors.capacity = 'Capacity must be between 1 and 10';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
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
    setErrors({}); // Clear previous errors

    try {
      const url = mode === 'create' ? '/api/rooms' : `/api/rooms/${room?.id}`;
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
    let processedValue = value;
    
    // Handle numeric fields to prevent NaN
    if (field === 'price' || field === 'capacity') {
      if (typeof value === 'string') {
        // If the input is empty, set to appropriate default
        if (value === '') {
          processedValue = field === 'price' ? 0 : 1;
        } else {
          // Parse the number and handle NaN
          const parsed = field === 'price' ? parseFloat(value) : parseInt(value);
          processedValue = isNaN(parsed) ? (field === 'price' ? 0 : 1) : parsed;
        }
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 w-full max-w-md mx-auto max-h-[90vh] flex flex-col shadow-2xl border border-gray-200/50">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'create' ? 'Create New Room' : 'Edit Room'}
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
              Room Number *
            </label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm ${
                errors.number ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 101"
            />
            {errors.number && (
              <p className="text-red-500 text-sm mt-1">{errors.number}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {roomTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity *
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.capacity ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.capacity && (
              <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price per Night *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className={`w-full pl-8 pr-3 py-2 border rounded-md ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="0.00"
              />
            </div>
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {roomStatuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Room description..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
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

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : isSuccess ? 'Success!' : mode === 'create' ? 'Create Room' : 'Update Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 