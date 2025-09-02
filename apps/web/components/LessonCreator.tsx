'use client';
import { useMutation } from 'convex/react';
import { useState } from 'react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '@repo/backend/convex';
import { useParams, useRouter } from 'next/navigation';
import { Id } from '@repo/backend/dataModel';
import { VideoUpload } from './VideoUpload';

export function LessonCreator() {
  const { courseId } = useParams<{ courseId: Id<'courses'> }>();
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
  const [createdLessonId, setCreatedLessonId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseId) {
      toast.error('Course ID not found');
      return;
    }

    // Validate form data based on lesson type
    if (formData.type === 'text' && !formData.content.trim()) {
      toast.error('Please provide lesson content for text lessons');
      return;
    }

    if (formData.type === 'video' && !formData.title.trim()) {
      toast.error('Please provide a lesson title for video lessons');
      return;
    }

    setIsLoading(true);

    try {
      const result = await createLesson({
        courseId: courseId,
        ...formData,
      });

      if (formData.type === 'video') {
        // For video lessons, store the lesson ID to show upload component
        setCreatedLessonId(result.lessonId);
        toast.success('Lesson created! Now upload your video.');
      } else {
        toast.success('Lesson created successfully!');
        router.push(`/courses/${courseId}`);
      }
    } catch (error) {
      toast.error('Failed to create lesson. Please try again.');
      console.error('Error creating lesson:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // If changing to video type, clear content requirement
      if (field === 'type' && value === 'video') {
        newData.content = ''; // Clear content for video lessons
      }

      return newData;
    });
  };

  // If we have a created lesson ID and it's a video lesson, show the upload component
  if (createdLessonId && formData.type === 'video') {
    return (
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-8'>
          <div className='mb-8'>
            <div className='flex justify-between items-center mb-4'>
              <h1 className='text-3xl font-bold text-gray-900'>
                Upload Video for Lesson
              </h1>
              <button
                onClick={() => router.push(`/courses/${courseId}`)}
                className='text-blue-600 hover:text-blue-700 font-medium'
              >
                ← Back to Course
              </button>
            </div>
            <p className='text-gray-600'>
              Upload your video content for "{formData.title}"
            </p>
          </div>

          <VideoUpload
            lessonId={createdLessonId!}
            onUploadComplete={() => {
              toast.success('Video uploaded and processed successfully!');
              router.push(`/courses/${courseId}`);
            }}
            onUploadStart={() => {
              toast.info('Video upload started. This may take a few minutes.');
            }}
          />

          <div className='mt-6 text-center'>
            <button
              onClick={() => router.push(`/courses/${courseId}`)}
              className='px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                  required={formData.type === 'text'}
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
                Video Content
              </label>
              <p className='text-sm text-gray-500 mb-4'>
                After creating the lesson, you'll be able to upload your video
                file directly. Supported formats: MP4, MOV, AVI. Max size:
                100MB.
              </p>
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <div className='flex items-center'>
                  <div className='text-blue-600 mr-3'>
                    <svg
                      className='h-5 w-5'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  </div>
                  <div className='text-sm text-blue-800'>
                    <p className='font-medium'>Video Upload</p>
                    <p>
                      You'll upload your video after creating the lesson. This
                      ensures better organization and allows for proper video
                      processing.
                    </p>
                  </div>
                </div>
              </div>
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
