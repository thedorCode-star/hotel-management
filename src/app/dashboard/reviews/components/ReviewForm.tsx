'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ReviewFormProps {
  room: {
    id: string;
    number: string;
    type: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewForm({ room, onClose, onSuccess }: ReviewFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Please select a rating';
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'Please write a review comment';
    } else if (formData.comment.length < 10) {
      newErrors.comment = 'Review must be at least 10 characters long';
    } else if (formData.comment.length > 1000) {
      newErrors.comment = 'Review must be less than 1000 characters';
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
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: room.id,
          rating: formData.rating,
          comment: formData.comment.trim(),
          userId: 'user-id', // This should come from authentication
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }

      onSuccess();
      router.refresh();
    } catch (error) {
      console.error('Error submitting review:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to submit review' });
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

  const renderStars = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleInputChange('rating', star)}
            className={`text-2xl ${
              star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const getRatingText = () => {
    switch (formData.rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select Rating';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 w-full max-w-md mx-auto max-h-[90vh] flex flex-col shadow-2xl border border-gray-200/50">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <span className="text-gray-500 font-bold">×</span>
          </button>
        </div>

        {/* Room Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 mb-6 border border-blue-200/50">
          <h3 className="font-semibold text-blue-900 mb-1">Room {room.number}</h3>
          <p className="text-sm text-blue-700">{room.type}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rating *
            </label>
            <div className="space-y-2">
              {renderStars()}
              <p className="text-sm text-gray-600">{getRatingText()}</p>
            </div>
            {errors.rating && (
              <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Review *
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => handleInputChange('comment', e.target.value)}
              rows={4}
              placeholder="Share your experience with this room..."
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm ${
                errors.comment ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.comment && (
                <p className="text-red-500 text-sm">{errors.comment}</p>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {formData.comment.length}/1000 characters
              </p>
            </div>
          </div>

          {errors.submit && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-4 border border-red-200/50">
              <p className="text-red-600 text-sm font-medium break-words">{errors.submit}</p>
            </div>
          )}

          <div className="flex space-x-4 pt-6 flex-shrink-0">
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
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-xs text-gray-500 flex-shrink-0">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200/50">
            <p className="text-gray-600 mb-1">• Reviews are moderated before being published</p>
            <p className="text-gray-600 mb-1">• You can only review rooms you have stayed in</p>
            <p className="text-gray-600">• Be honest and constructive in your feedback</p>
          </div>
        </div>
      </div>
    </div>
  );
} 