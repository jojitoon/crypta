'use client';
import { useQuery } from 'convex/react';
import { useState } from 'react';
import { api } from '@repo/backend/convex';
import { useRouter } from 'next/navigation';

export function CourseList() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const courses = useQuery(api.courses.listCourses, {
    level:
      selectedLevel &&
      ['beginner', 'intermediate', 'advanced'].includes(selectedLevel)
        ? (selectedLevel as 'beginner' | 'intermediate' | 'advanced')
        : undefined,
    category: selectedCategory || undefined,
  });

  if (courses === undefined) {
    return (
      <div className='flex justify-center items-center min-h-96'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  const categories = [...new Set(courses.map((course) => course.category))];

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>All Courses</h1>
        <p className='text-gray-600'>
          Explore our comprehensive cryptocurrency and blockchain courses
        </p>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8'>
        <div className='flex flex-wrap gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Level
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value=''>All Levels</option>
              <option value='beginner'>Beginner</option>
              <option value='intermediate'>Intermediate</option>
              <option value='advanced'>Advanced</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value=''>All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {courses.length === 0 ? (
        <div className='text-center py-12'>
          <div className='text-4xl mb-4'>📚</div>
          <h3 className='text-xl font-semibold text-gray-900 mb-2'>
            No courses found
          </h3>
          <p className='text-gray-600'>
            Try adjusting your filters or check back later
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {courses.map((course) => (
            <div
              key={course._id}
              className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer'
              onClick={() => {
                void router.push(`/courses/${course._id}`);
              }}
            >
              <div className='p-6'>
                <div className='flex justify-between items-start mb-3'>
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
                  <span className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full'>
                    {course.category}
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

                {course.progressPercentage > 0 && (
                  <div className='mb-4'>
                    <div className='flex justify-between items-center mb-1'>
                      <span className='text-xs text-gray-600'>Progress</span>
                      <span className='text-xs text-gray-600'>
                        {Math.round(course.progressPercentage)}%
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                        style={{ width: `${course.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <button className='w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'>
                  {course.progressPercentage > 0 ? 'Continue' : 'Start Course'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
