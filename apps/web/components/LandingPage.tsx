'use client';
import { useQuery } from 'convex/react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '@repo/backend/convex';
import { Id } from '@repo/backend/dataModel';

export function LandingPage() {
  const previewCourses = useQuery(api.courses.getPreviewCourses);
  const [selectedCourse, setSelectedCourse] = useState<Id<'courses'> | null>(
    null
  );

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
      {/* Navigation Header */}
      <header className='sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-2 text-xl font-bold text-gray-900'>
              <span className='text-2xl'>🚀</span>
              <span>CryptoLearn</span>
            </div>
            <button
              onClick={() => (window.location.href = '/login')}
              className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium'
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className='relative overflow-hidden'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16'>
          <div className='text-center'>
            <div className='text-8xl mb-6'>🚀</div>
            <h1 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6'>
              Master the Future of
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'>
                {' '}
                Finance
              </span>
            </h1>
            <p className='text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto'>
              Learn cryptocurrency, blockchain, and DeFi through interactive
              courses designed by industry experts. Start your journey into the
              digital economy today.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <button
                onClick={() => (window.location.href = '/login')}
                className='bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200'
              >
                Start Learning Free
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById('preview-courses')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className='border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200'
              >
                Preview Courses
              </button>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className='absolute top-20 left-10 text-4xl animate-bounce'>
          💰
        </div>
        <div className='absolute top-40 right-20 text-3xl animate-pulse'>
          🔗
        </div>
        <div className='absolute bottom-20 left-20 text-3xl animate-bounce delay-1000'>
          ⚡
        </div>
        <div className='absolute bottom-40 right-10 text-4xl animate-pulse delay-500'>
          🎯
        </div>
      </section>

      {/* Features Section */}
      <section className='py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              Why Choose CryptoLearn?
            </h2>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
              Our platform combines cutting-edge technology with proven learning
              methodologies
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='text-center p-6'>
              <div className='text-5xl mb-4'>🎓</div>
              <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                Expert-Led Courses
              </h3>
              <p className='text-gray-600'>
                Learn from industry professionals and blockchain experts with
                real-world experience
              </p>
            </div>

            <div className='text-center p-6'>
              <div className='text-5xl mb-4'>⚡</div>
              <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                Interactive Learning
              </h3>
              <p className='text-gray-600'>
                Hands-on exercises, quizzes, and real-world projects to
                reinforce your knowledge
              </p>
            </div>

            <div className='text-center p-6'>
              <div className='text-5xl mb-4'>🏆</div>
              <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                Achievement System
              </h3>
              <p className='text-gray-600'>
                Track your progress, earn badges, and build your crypto
                expertise profile
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Courses Section */}
      <section id='preview-courses' className='py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              Free Preview Courses
            </h2>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
              Start learning immediately with our free preview courses. No
              signup required.
            </p>
          </div>

          {previewCourses === undefined ? (
            <div className='flex justify-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
            </div>
          ) : previewCourses.length === 0 ? (
            <div className='text-center py-12'>
              <div className='text-6xl mb-4'>📚</div>
              <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
                No preview courses available
              </h3>
              <p className='text-gray-600'>
                Check back soon for free preview content!
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {previewCourses.map((course: any) => (
                <div
                  key={course._id}
                  className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer'
                  onClick={() => setSelectedCourse(course._id)}
                >
                  {course.imageUrl && (
                    <div className='h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center'>
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className='w-full h-full object-cover'
                      />
                    </div>
                  )}

                  <div className='p-6'>
                    <div className='flex justify-between items-start mb-3'>
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${
                          course.level === 'beginner'
                            ? 'bg-green-100 text-green-800'
                            : course.level === 'intermediate'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {course.level}
                      </span>
                      <span className='text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full'>
                        Free Preview
                      </span>
                    </div>

                    <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                      {course.title}
                    </h3>

                    <p className='text-gray-600 text-sm mb-4 line-clamp-3'>
                      {course.description}
                    </p>

                    <div className='flex items-center justify-between text-sm text-gray-500 mb-4'>
                      <span className='flex items-center'>
                        <span className='mr-1'>📚</span>
                        Single Lesson
                      </span>
                      <span className='flex items-center'>
                        <span className='mr-1'>⏱️</span>
                        {course.estimatedDuration}min
                      </span>
                    </div>

                    <button className='w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-200 font-medium'>
                      Start Learning
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 bg-gradient-to-r from-blue-600 to-purple-600'>
        <div className='max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8'>
          <h2 className='text-4xl font-bold text-white mb-6'>
            Ready to Master Cryptocurrency?
          </h2>
          <p className='text-xl text-blue-100 mb-8'>
            Join thousands of learners who are already building their crypto
            expertise. Get access to our complete course library, progress
            tracking, and achievement system.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button
              onClick={() => (window.location.href = '/login')}
              className='bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200'
            >
              Get Started Free
            </button>
            <button
              onClick={() => (window.location.href = '/login')}
              className='bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-200'
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Course Preview Modal */}
      {selectedCourse && (
        <CoursePreviewModal
          courseId={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  );
}

interface CoursePreviewModalProps {
  courseId: Id<'courses'>;
  onClose: () => void;
}

function CoursePreviewModal({ courseId, onClose }: CoursePreviewModalProps) {
  const course = useQuery(api.courses.getCourse, { courseId });

  if (!course || !course.lessons || course.lessons.length === 0) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='p-6 border-b border-gray-200'>
          <div className='flex justify-between items-start'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                {course.title}
              </h2>
              <p className='text-gray-600'>{course.description}</p>
            </div>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600 text-2xl'
            >
              ×
            </button>
          </div>
        </div>

        <div className='p-6'>
          {course.lessons &&
          course.lessons.length > 0 &&
          course?.lessons[0]?.videoUrl ? (
            <div className='mb-6'>
              <video
                controls
                className='w-full rounded-lg'
                src={course.lessons[0].videoUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          ) : null}

          {course.lessons &&
            course.lessons.length > 0 &&
            course?.lessons[0]?.content && (
              <div className='prose max-w-none text-gray-700 leading-relaxed'>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {course.lessons[0].content}
                </ReactMarkdown>
              </div>
            )}

          <div className='mt-8 pt-6 border-t border-gray-200'>
            <div className='flex justify-between items-center'>
              <div className='flex items-center space-x-4 text-sm text-gray-500'>
                <span className='flex items-center'>
                  <span className='mr-1'>⏱️</span>
                  {course.estimatedDuration} minutes
                </span>
                <span className='flex items-center'>
                  <span className='mr-1'>📊</span>
                  {course.level} level
                </span>
              </div>
              <button
                onClick={onClose}
                className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
