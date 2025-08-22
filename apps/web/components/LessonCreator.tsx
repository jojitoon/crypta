'use client';
import { useMutation } from 'convex/react';
import { useState } from 'react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '@repo/backend/convex';
import { useParams, useRouter } from 'next/navigation';

export function LessonCreator() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const createLesson = useMutation(api.courses.createLesson);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    duration: 15,
    order: 1,
    type: 'text' as 'text' | 'video' | 'quiz',
    videoUrl: '',
    isPublished: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) {
      toast.error('Course ID not found');
      return;
    }

    setIsLoading(true);

    try {
      await createLesson({
        courseId: courseId as any,
        ...formData,
      });

      toast.success('Lesson created successfully!');
      router.push(`/courses/${courseId}`);
    } catch (error) {
      toast.error('Failed to create lesson. Please try again.');
      console.error('Error creating lesson:', error);
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
    <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-8'>
        <div className='mb-8'>
          <div className='flex justify-between items-center mb-4'>
            <h1 className='text-3xl font-bold text-gray-900'>
              Create New Lesson
            </h1>
            <button
              onClick={() => router.push(`/courses/${courseId}`)}
              className='text-blue-600 hover:text-blue-700 font-medium'
            >
              ← Back to Course
            </button>
          </div>
          <p className='text-gray-600'>
            Create engaging lesson content with Markdown support
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
                Lesson Title *
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
                Lesson Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='text'>Text Lesson</option>
                <option value='video'>Video Lesson</option>
                <option value='quiz'>Quiz</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Duration (minutes) *
              </label>
              <input
                type='number'
                min='1'
                required
                value={formData.duration}
                onChange={(e) =>
                  handleInputChange('duration', parseInt(e.target.value))
                }
                className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Order *
              </label>
              <input
                type='number'
                min='1'
                required
                value={formData.order}
                onChange={(e) =>
                  handleInputChange('order', parseInt(e.target.value))
                }
                className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          </div>

          {/* Content */}
          {formData.type === 'text' ? (
            <div>
              <div className='flex justify-between items-center mb-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Lesson Content (Markdown supported) *
                </label>
                <button
                  type='button'
                  onClick={() => setShowPreview(!showPreview)}
                  className='text-sm text-blue-600 hover:text-blue-700 font-medium'
                >
                  {showPreview ? 'Edit' : 'Preview'}
                </button>
              </div>

              {showPreview ? (
                <div className='border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[400px]'>
                  <div className='prose max-w-none'>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {formData.content || '*No content to preview*'}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[400px] font-mono text-sm'
                  placeholder={`# Lesson Title

Write your lesson content here using Markdown...

## Key Points
- Point 1
- Point 2
- Point 3

## Code Example
\`\`\`javascript
console.log("Hello, World!");
\`\`\`

## Summary
This lesson covered...`}
                />
              )}
            </div>
          ) : formData.type === 'video' ? (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Video URL *
              </label>
              <input
                type='url'
                required
                value={formData.videoUrl}
                onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='https://example.com/video.mp4'
              />
              <p className='text-sm text-gray-500 mt-1'>
                Enter the URL of your video content
              </p>
            </div>
          ) : (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Quiz Content
              </label>
              <p className='text-sm text-gray-500 mb-4'>
                Quiz functionality will be implemented in a future update.
              </p>
            </div>
          )}

          {/* Publish Status */}
          <div className='flex items-center space-x-4'>
            <label className='flex items-center'>
              <input
                type='checkbox'
                checked={formData.isPublished}
                onChange={(e) =>
                  handleInputChange('isPublished', e.target.checked)
                }
                className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
              <span className='ml-2 text-sm font-medium text-gray-700'>
                Publish immediately
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className='flex justify-end space-x-4'>
            <button
              type='button'
              onClick={() => router.push(`/courses/${courseId}`)}
              className='px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? 'Creating...' : 'Create Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
