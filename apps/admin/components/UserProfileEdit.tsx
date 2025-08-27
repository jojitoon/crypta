'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@repo/backend/convex';
import { toast } from 'sonner';
import { Id } from '@repo/backend/dataModel';

interface UserProfileEditProps {
  userId: Id<'users'>;
  onClose: () => void;
}

export function UserProfileEdit({ userId, onClose }: UserProfileEditProps) {
  const user = useQuery(api.admin.getUserProfileForAdmin, { userId });
  const updateUserProfile = useMutation(api.admin.updateUserProfileAdmin);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatarUrl: '',
    location: '',
    website: '',
    socialLinks: {
      twitter: '',
      linkedin: '',
      github: '',
    },
    isAdmin: false,
    isActive: true,
    notes: '',
  });

  // Update form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
        location: user.location || '',
        website: user.website || '',
        socialLinks: {
          twitter: user.socialLinks?.twitter || '',
          linkedin: user.socialLinks?.linkedin || '',
          github: user.socialLinks?.github || '',
        },
        isAdmin: user.isAdmin || false,
        isActive: user.isActive !== false, // Default to true if not set
        notes: user.notes || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'socialLinks') {
        setFormData((prev) => ({
          ...prev,
          socialLinks: {
            ...prev.socialLinks,
            [child as keyof typeof prev.socialLinks]: value as string,
          },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateUserProfile({
        userId,
        name: formData.name || undefined,
        email: formData.email || undefined,
        bio: formData.bio || undefined,
        avatarUrl: formData.avatarUrl || undefined,
        location: formData.location || undefined,
        website: formData.website || undefined,
        socialLinks: {
          twitter: formData.socialLinks.twitter || undefined,
          linkedin: formData.socialLinks.linkedin || undefined,
          github: formData.socialLinks.github || undefined,
        },
        isAdmin: formData.isAdmin,
        isActive: formData.isActive,
        notes: formData.notes || undefined,
      });
      toast.success('User profile updated successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to update user profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className='flex justify-center items-center min-h-96'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-black'>
      <div className='bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
        <div className='p-6 border-b border-gray-200'>
          <div className='flex justify-between items-center'>
            <h2 className='text-2xl font-bold text-gray-900'>
              Edit User Profile
            </h2>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* User Stats Overview */}
          <div className='bg-gray-50 rounded-lg p-4'>
            <h3 className='text-lg font-semibold text-gray-900 mb-3'>
              User Statistics
            </h3>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
              <div>
                <span className='text-gray-600'>Total Points:</span>
                <div className='font-semibold'>
                  {user.stats?.totalPoints || 0}
                </div>
              </div>
              <div>
                <span className='text-gray-600'>Courses Created:</span>
                <div className='font-semibold'>{user.coursesCreatedCount}</div>
              </div>
              <div>
                <span className='text-gray-600'>Achievements:</span>
                <div className='font-semibold'>{user.achievementsCount}</div>
              </div>
              <div>
                <span className='text-gray-600'>Lessons Completed:</span>
                <div className='font-semibold'>{user.lessonsCompleted}</div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Full Name
              </label>
              <input
                type='text'
                id='name'
                placeholder='Full Name'
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Email
              </label>
              <input
                type='email'
                id='email'
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
            <div>
              <label
                htmlFor='location'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Location
              </label>
              <input
                type='text'
                id='location'
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder='City, Country'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
            <div>
              <label
                htmlFor='website'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Website
              </label>
              <input
                type='url'
                id='website'
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder='https://example.com'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label
              htmlFor='bio'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Bio
            </label>
            <textarea
              id='bio'
              rows={3}
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder='Tell us about yourself...'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>

          {/* Avatar URL */}
          <div>
            <label
              htmlFor='avatarUrl'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Avatar URL
            </label>
            <input
              type='url'
              id='avatarUrl'
              value={formData.avatarUrl}
              onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
              placeholder='https://example.com/avatar.jpg'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>

          {/* Social Links */}
          <div>
            <h3 className='text-lg font-semibold text-gray-900 mb-3'>
              Social Links
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label
                  htmlFor='twitter'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Twitter
                </label>
                <input
                  type='url'
                  id='twitter'
                  value={formData.socialLinks.twitter}
                  onChange={(e) =>
                    handleInputChange('socialLinks.twitter', e.target.value)
                  }
                  placeholder='https://twitter.com/username'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
              <div>
                <label
                  htmlFor='linkedin'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  LinkedIn
                </label>
                <input
                  type='url'
                  id='linkedin'
                  value={formData.socialLinks.linkedin}
                  onChange={(e) =>
                    handleInputChange('socialLinks.linkedin', e.target.value)
                  }
                  placeholder='https://linkedin.com/in/username'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
              <div>
                <label
                  htmlFor='github'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  GitHub
                </label>
                <input
                  type='url'
                  id='github'
                  value={formData.socialLinks.github}
                  onChange={(e) =>
                    handleInputChange('socialLinks.github', e.target.value)
                  }
                  placeholder='https://github.com/username'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
            </div>
          </div>

          {/* Admin Controls */}
          <div className='border-t border-gray-200 pt-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-3'>
              Admin Controls
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  id='isAdmin'
                  checked={formData.isAdmin}
                  onChange={(e) =>
                    handleInputChange('isAdmin', e.target.checked)
                  }
                  className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                />
                <label
                  htmlFor='isAdmin'
                  className='ml-2 block text-sm text-gray-900'
                >
                  Admin Access
                </label>
              </div>
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  id='isActive'
                  checked={formData.isActive}
                  onChange={(e) =>
                    handleInputChange('isActive', e.target.checked)
                  }
                  className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                />
                <label
                  htmlFor='isActive'
                  className='ml-2 block text-sm text-gray-900'
                >
                  Active Account
                </label>
              </div>
            </div>
            <div className='mt-4'>
              <label
                htmlFor='notes'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Admin Notes
              </label>
              <textarea
                id='notes'
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder='Add any admin notes about this user...'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className='flex justify-end space-x-4 pt-6 border-t border-gray-200'>
            <button
              type='button'
              onClick={onClose}
              className='px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
