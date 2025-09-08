'use client';
import { useQuery, useAction } from 'convex/react';
import { api } from '@repo/backend/convex';
import { Id } from '@repo/backend/dataModel';
import { useState } from 'react';
import { toast } from 'sonner';

export function PricingPage() {
  const [loadingCourseId, setLoadingCourseId] = useState<Id<'courses'> | null>(
    null
  );
  const createCheckoutSession = useAction(api.stripe.createCheckoutSession);

  // Get all courses with pricing information
  const courses = useQuery(api.courses.listCourses, {});

  // Get course IDs for access checking
  const courseIds = courses?.map((course) => course._id) || [];
  const hasAccessToCourses = useQuery(
    api.stripe.hasAccessToCourses,
    courseIds.length > 0 ? { courseIds } : 'skip'
  );

  const handlePurchase = async (courseId: Id<'courses'>) => {
    setLoadingCourseId(courseId);
    try {
      const result = await createCheckoutSession({ courseId });
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoadingCourseId(null);
    }
  };

  if (courses === undefined) {
    return (
      <div className='flex justify-center items-center min-h-96'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  // Filter courses that have pricing (not free)
  const paidCourses = courses.filter(
    (course) => course.price && course.price > 0 && !course.isFree
  );

  const freeCourses = courses.filter(
    (course) =>
      course.isFree || course.isPreview || !course.price || course.price === 0
  );

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='text-center mb-12'>
        <h1 className='text-4xl font-bold text-gray-900 mb-4'>
          Choose Your Learning Path
        </h1>
        <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
          Unlock premium cryptocurrency courses and accelerate your blockchain
          journey. Start with free courses or dive deep with our comprehensive
          paid programs.
        </p>
      </div>

      {/* Free Courses Section */}
      {freeCourses.length > 0 && (
        <div className='mb-16'>
          <h2 className='text-2xl font-bold text-gray-900 mb-8 text-center'>
            Free Courses
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {freeCourses.map((course) => (
              <div
                key={course._id}
                className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow'
              >
                <div className='p-6'>
                  <div className='flex justify-between items-start mb-3'>
                    <span className='text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800'>
                      FREE
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        course.level === 'beginner'
                          ? 'bg-green-100 text-green-800'
                          : course.level === 'intermediate'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {course.level}
                    </span>
                  </div>

                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    {course.title}
                  </h3>

                  <p className='text-gray-600 text-sm mb-4 line-clamp-3'>
                    {course.description}
                  </p>

                  <div className='flex items-center justify-between text-sm text-gray-500 mb-4'>
                    <span className='flex items-center'>
                      <span className='mr-1'>📚</span>
                      {course.totalLessons} lessons
                    </span>
                    <span className='flex items-center'>
                      <span className='mr-1'>⏱️</span>
                      {course.estimatedDuration}min
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      (window.location.href = `/courses/${course._id}`)
                    }
                    className='w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium'
                  >
                    Start Free Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paid Courses Section */}
      {paidCourses.length > 0 && (
        <div>
          <h2 className='text-2xl font-bold text-gray-900 mb-8 text-center'>
            Premium Courses
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {paidCourses.map((course) => {
              const hasAccess = hasAccessToCourses?.[course._id] || false;
              const isLoading = loadingCourseId === course._id;

              return (
                <div
                  key={course._id}
                  className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow'
                >
                  <div className='p-6'>
                    <div className='flex justify-between items-start mb-3'>
                      <span className='text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800'>
                        PREMIUM
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          course.level === 'beginner'
                            ? 'bg-green-100 text-green-800'
                            : course.level === 'intermediate'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {course.level}
                      </span>
                    </div>

                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                      {course.title}
                    </h3>

                    <p className='text-gray-600 text-sm mb-4 line-clamp-3'>
                      {course.description}
                    </p>

                    <div className='flex items-center justify-between text-sm text-gray-500 mb-4'>
                      <span className='flex items-center'>
                        <span className='mr-1'>📚</span>
                        {course.totalLessons} lessons
                      </span>
                      <span className='flex items-center'>
                        <span className='mr-1'>⏱️</span>
                        {course.estimatedDuration}min
                      </span>
                    </div>

                    <div className='mb-4'>
                      <div className='text-2xl font-bold text-gray-900'>
                        ${(course.price! / 100).toFixed(2)}
                      </div>
                      <div className='text-sm text-gray-500'>
                        One-time payment
                      </div>
                    </div>

                    {hasAccess ? (
                      <button
                        onClick={() =>
                          (window.location.href = `/courses/${course._id}`)
                        }
                        className='w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium'
                      >
                        Access Course
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchase(course._id)}
                        disabled={isLoading}
                        className='w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed'
                      >
                        {isLoading ? 'Processing...' : 'Purchase Course'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {paidCourses.length === 0 && freeCourses.length === 0 && (
        <div className='text-center py-12'>
          <div className='text-4xl mb-4'>📚</div>
          <h3 className='text-xl font-semibold text-gray-900 mb-2'>
            No courses available
          </h3>
          <p className='text-gray-600'>Check back later for new courses</p>
        </div>
      )}
    </div>
  );
}
