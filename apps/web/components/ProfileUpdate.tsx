'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@repo/backend/convex';
import { toast } from 'sonner';

export function ProfileUpdate() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const updateProfile = useMutation(api.auth.updateUserProfile);
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
  });

  // Update form data when user data loads
  useEffect(() => {
    if (loggedInUser) {
      setFormData({
        name: loggedInUser.name || '',
        email: loggedInUser.email || '',
        bio: loggedInUser.bio || '',
        avatarUrl: loggedInUser.avatarUrl || '',
        location: loggedInUser.location || '',
        website: loggedInUser.website || '',
        socialLinks: {
          twitter: loggedInUser.socialLinks?.twitter || '',
          linkedin: loggedInUser.socialLinks?.linkedin || '',
          github: loggedInUser.socialLinks?.github || '',
        },
      });
    }
  }, [loggedInUser]);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'socialLinks') {
        setFormData((prev) => ({
          ...prev,
          socialLinks: {
            ...prev.socialLinks,
            [child as keyof typeof prev.socialLinks]: value,
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
      await updateProfile({
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
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!loggedInUser) {
    return (
      <div className='flex justify-center items-center min-h-96'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Edit Profile</h1>
        <p className='text-gray-600'>
          Update your personal information and preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Avatar Section */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Profile Picture
          </h3>
          <div className='flex items-center space-x-4'>
            <div className='w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold'>
              {formData.name?.[0] || formData.email?.[0] || '?'}
            </div>
            <div className='flex-1'>
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
          </div>
        </div>

        {/* Basic Information */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Basic Information
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
          <div className='mt-4'>
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
        </div>

        {/* Social Links */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
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

        {/* Submit Button */}
        <div className='flex justify-end space-x-4'>
          <button
            type='button'
            onClick={() => window.history.back()}
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
  );
}
