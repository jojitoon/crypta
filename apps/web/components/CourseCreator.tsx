'use client';
import { api } from '@repo/backend/convex';
import { useMutation } from 'convex/react';
import { useState } from 'react';
import { toast } from 'sonner';

export function CourseCreator() {
  const createCourse = useMutation(api.courses.createCourse);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    category: '',
    imageUrl: '',
    estimatedDuration: 30,
    totalLessons: 1,
    isPreview: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createCourse({
        ...formData,
        totalLessons: formData.totalLessons,
      });

      toast.success('Course created successfully!');
      // Redirect to the created course
      if (result.courseId) {
        window.location.href = `/courses/${result.courseId}`;
      }
    } catch (error) {
      toast.error('Failed to create course. Please try again.');
      console.error('Error creating course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Create New Course
          </h1>
          <p className='text-gray-600'>
            Share your knowledge by creating engaging cryptocurrency and
            blockchain courses
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit(e);
          }}
          className='space-y-6'
        >
          {/* Basic Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Course Title *
              </label>
              <input
                type='text'
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='e.g., Introduction to Bitcoin'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Category *
              </label>
              <input
                type='text'
                required
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='e.g., Fundamentals, DeFi, Security'
              />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='Brief description of what students will learn...'
            />
          </div>

          {/* Course Settings */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Level *
              </label>
              <select
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='beginner'>Beginner</option>
                <option value='intermediate'>Intermediate</option>
                <option value='advanced'>Advanced</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Duration (minutes) *
              </label>
              <input
                type='number'
                required
                min='1'
                value={formData.estimatedDuration}
                onChange={(e) =>
                  handleInputChange(
                    'estimatedDuration',
                    parseInt(e.target.value)
                  )
                }
                className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Total Lessons
              </label>
              <input
                type='number'
                min='1'
                value={formData.totalLessons}
                onChange={(e) =>
                  handleInputChange('totalLessons', parseInt(e.target.value))
                }
                className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          </div>

          {/* Course Type */}
          <div className='space-y-4'>
            <div className='flex items-center space-x-4'>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  checked={formData.isPreview}
                  onChange={(e) =>
                    handleInputChange('isPreview', e.target.checked)
                  }
                  className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                />
                <span className='ml-2 text-sm font-medium text-gray-700'>
                  Free Preview Course
                </span>
              </label>
            </div>
          </div>

          {/* Media */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Cover Image URL
            </label>
            <input
              type='url'
              value={formData.imageUrl}
              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='https://example.com/image.jpg'
            />
          </div>

          {/* Submit Button */}
          <div className='flex justify-end pt-6 border-t border-gray-200'>
            <button
              type='submit'
              disabled={isLoading}
              className='bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
