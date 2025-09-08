'use client';
import { useQuery, useAction } from 'convex/react';
import { useConvexAuth } from 'convex/react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { api } from '@repo/backend/convex';
import { Id } from '@repo/backend/dataModel';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function CourseView() {
  const { courseId } = useParams<{ courseId: Id<'courses'> }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useConvexAuth();
  const [isLoading, setIsLoading] = useState(false);

  const course = useQuery(api.courses.getCourse, { courseId: courseId });
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const hasAccess = useQuery(api.stripe.hasAccessToCourse, {
    courseId: courseId,
  });
  const createCheckoutSession = useAction(api.stripe.createCheckoutSession);

  // Handle payment status from URL parameters
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');

    if (paymentStatus === 'success' && sessionId) {
      toast.success('Payment successful! You now have access to this course.');
      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      url.searchParams.delete('session_id');
      window.history.replaceState({}, '', url.toString());
    } else if (paymentStatus === 'cancelled') {
      toast.error('Payment was cancelled. You can try again anytime.');
      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  if (!courseId) {
    return <div>Course ID not found</div>;
  }

  if (course === undefined) {
    return (
      <div className='flex justify-center items-center min-h-96'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (course === null) {
    return (
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Course Not Found
          </h1>
          <button
            onClick={() => {
              void router.push('/courses');
            }}
            className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  if (!courseId) {
    return <div>Course ID not found</div>;
  }

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const result = await createCheckoutSession({ courseId: courseId });
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if course is free or user has access
  const isFree =
    course.isFree || course.isPreview || !course.price || course.price === 0;
  const canAccess = isFree || hasAccess;

  const nextLesson = course.lessons.find((lesson) => !lesson.completed);

  return (
    <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      {/* Header */}
      <div className='mb-8'>
        <button
          onClick={() => {
            void router.push('/courses');
          }}
          className='flex items-center text-blue-600 hover:text-blue-700 mb-4 text-sm'
        >
          <span className='mr-1'>←</span>
          Back to Courses
        </button>

        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-8'>
          <div className='flex justify-between items-start mb-4'>
            <div className='flex gap-2'>
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${
                  course.level === 'beginner'
                    ? 'bg-green-100 text-green-800'
                    : course.level === 'intermediate'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                {course.level}
              </span>
              <span className='text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full'>
                {course.category}
              </span>
              {isFree ? (
                <span className='text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full'>
                  FREE
                </span>
              ) : (
                <span className='text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full'>
                  PREMIUM
                </span>
              )}
            </div>
          </div>

          <h1 className='text-3xl font-bold text-gray-900 mb-4'>
            {course.title}
          </h1>
          <p className='text-gray-600 mb-6'>{course.description}</p>

          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center space-x-6 text-sm text-gray-600'>
              <span className='flex items-center'>
                <span className='mr-1'>📚</span>
                {course.totalLessons} lessons
              </span>
              <span className='flex items-center'>
                <span className='mr-1'>⏱️</span>
                {course.estimatedDuration}min
              </span>
              <span className='flex items-center'>
                <span className='mr-1'>✅</span>
                {course.completedLessons}/{course.totalLessons} completed
              </span>
            </div>
            {!isFree && (
              <div className='text-right'>
                <div className='text-2xl font-bold text-gray-900'>
                  ${(course.price! / 100).toFixed(2)}
                </div>
                <div className='text-sm text-gray-500'>One-time payment</div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className='mb-6'>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-sm font-medium text-gray-700'>
                Course Progress
              </span>
              <span className='text-sm text-gray-600'>
                {Math.round(course.progressPercentage)}%
              </span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-3'>
              <div
                className='bg-blue-600 h-3 rounded-full transition-all duration-300'
                style={{ width: `${course.progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Action Button */}
          {!canAccess ? (
            <div className='space-y-4'>
              <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                <div className='flex items-center'>
                  <span className='text-yellow-600 mr-2'>🔒</span>
                  <span className='text-yellow-800 font-medium'>
                    This is a premium course
                  </span>
                </div>
                <p className='text-yellow-700 text-sm mt-1'>
                  Purchase this course to access all lessons and content.
                </p>
              </div>
              <button
                onClick={handlePurchase}
                disabled={isLoading}
                className='bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed'
              >
                {isLoading
                  ? 'Processing...'
                  : `Purchase for $${(course.price! / 100).toFixed(2)}`}
              </button>
            </div>
          ) : nextLesson ? (
            <button
              onClick={() => {
                void router.push(
                  `/courses/${courseId}/lessons/${nextLesson._id}`
                );
              }}
              className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium'
            >
              {course.progressPercentage > 0
                ? 'Continue Learning'
                : 'Start Course'}
            </button>
          ) : (
            <div className='flex items-center space-x-2 text-green-600'>
              <span className='text-xl'>🎉</span>
              <span className='font-medium'>Course Completed!</span>
            </div>
          )}
        </div>
      </div>

      {/* Lessons List */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-semibold text-gray-900'>
            Course Content
          </h2>
          {isAuthenticated &&
            course &&
            loggedInUser &&
            course.createdBy === loggedInUser._id && (
              <button
                onClick={() => {
                  void router.push(`/courses/${courseId}/create-lesson`);
                }}
                className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'
              >
                + Add Lesson
              </button>
            )}
        </div>

        <div className='space-y-3'>
          {course.lessons.map((lesson, index) => (
            <div
              key={lesson._id}
              className={`border rounded-lg p-4 transition-all ${
                canAccess ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
              } ${
                lesson.completed
                  ? 'border-green-200 bg-green-50'
                  : canAccess
                    ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
              }`}
              onClick={() => {
                if (canAccess) {
                  void router.push(
                    `/courses/${courseId}/lessons/${lesson._id}`
                  );
                } else {
                  toast.error('Please purchase this course to access lessons');
                }
              }}
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      lesson.completed
                        ? 'bg-green-600 text-white'
                        : canAccess
                          ? 'bg-gray-200 text-gray-600'
                          : 'bg-gray-300 text-gray-500'
                    }`}
                  >
                    {lesson.completed ? '✓' : canAccess ? index + 1 : '🔒'}
                  </div>

                  <div>
                    <h3 className='font-medium text-gray-900'>
                      {lesson.title}
                    </h3>
                    <div className='flex items-center space-x-4 text-sm text-gray-600'>
                      <span className='flex items-center'>
                        <span className='mr-1'>
                          {lesson.type === 'video'
                            ? '🎥'
                            : lesson.type === 'quiz'
                              ? '❓'
                              : '📖'}
                        </span>
                        {lesson.type}
                      </span>
                      <span>{lesson.duration}min</span>
                      {lesson.completed && lesson.score && (
                        <span className='text-green-600'>
                          Score: {lesson.score}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className='text-gray-400'>→</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
