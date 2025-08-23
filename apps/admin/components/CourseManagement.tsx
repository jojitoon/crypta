'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@repo/backend/convex';
import { toast } from 'sonner';
import { Id } from '@repo/backend/dataModel';

export function CourseManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'published' | 'unpublished'
  >('all');
  const [filterLevel, setFilterLevel] = useState<
    'all' | 'beginner' | 'intermediate' | 'advanced'
  >('all');

  const courses = useQuery(api.admin.getAllCourses);
  const updateCourseStatus = useMutation(api.admin.updateCourseStatus);
  const deleteCourse = useMutation(api.admin.deleteCourse);

  const handleTogglePublish = async (
    courseId: Id<'courses'>,
    currentStatus: boolean
  ) => {
    try {
      await updateCourseStatus({ courseId, isPublished: !currentStatus });
      toast.success(
        `Course ${!currentStatus ? 'published' : 'unpublished'} successfully`
      );
    } catch (error) {
      toast.error('Failed to update course status');
    }
  };

  const handleDeleteCourse = async (
    courseId: Id<'courses'>,
    courseTitle: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete course "${courseTitle}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteCourse({ courseId });
      toast.success('Course deleted successfully');
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  if (!courses) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  // Filter courses based on search and filters
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatusFilter =
      filterStatus === 'all' ||
      (filterStatus === 'published' && course.isPublished) ||
      (filterStatus === 'unpublished' && !course.isPublished);

    const matchesLevelFilter =
      filterLevel === 'all' || course.level === filterLevel;

    return matchesSearch && matchesStatusFilter && matchesLevelFilter;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold text-gray-900'>Course Management</h2>
        <div className='text-sm text-gray-600'>
          Total Courses: {courses.length}
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label
              htmlFor='search'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Search Courses
            </label>
            <input
              type='text'
              id='search'
              placeholder='Search by title, description, or category...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
          <div>
            <label
              htmlFor='status-filter'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Filter by Status
            </label>
            <select
              id='status-filter'
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(
                  e.target.value as 'all' | 'published' | 'unpublished'
                )
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='all'>All Status</option>
              <option value='published'>Published Only</option>
              <option value='unpublished'>Unpublished Only</option>
            </select>
          </div>
          <div>
            <label
              htmlFor='level-filter'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Filter by Level
            </label>
            <select
              id='level-filter'
              value={filterLevel}
              onChange={(e) =>
                setFilterLevel(
                  e.target.value as
                    | 'all'
                    | 'beginner'
                    | 'intermediate'
                    | 'advanced'
                )
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='all'>All Levels</option>
              <option value='beginner'>Beginner</option>
              <option value='intermediate'>Intermediate</option>
              <option value='advanced'>Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredCourses.map((course) => (
          <div
            key={course._id}
            className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'
          >
            {course.imageUrl && (
              <div className='h-48 bg-gray-200 flex items-center justify-center'>
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className='w-full h-full object-cover'
                />
              </div>
            )}
            <div className='p-6'>
              <div className='flex items-start justify-between mb-2'>
                <h3 className='text-lg font-semibold text-gray-900 line-clamp-2'>
                  {course.title}
                </h3>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(course.level)}`}
                >
                  {course.level}
                </span>
              </div>

              <p className='text-sm text-gray-600 mb-4 line-clamp-3'>
                {course.description}
              </p>

              <div className='space-y-2 mb-4'>
                <div className='flex justify-between text-sm text-gray-500'>
                  <span>Category:</span>
                  <span className='font-medium'>{course.category}</span>
                </div>
                <div className='flex justify-between text-sm text-gray-500'>
                  <span>Lessons:</span>
                  <span className='font-medium'>{course.lessonsCount}</span>
                </div>
                <div className='flex justify-between text-sm text-gray-500'>
                  <span>Duration:</span>
                  <span className='font-medium'>
                    {course.estimatedDuration} min
                  </span>
                </div>
                <div className='flex justify-between text-sm text-gray-500'>
                  <span>Enrollments:</span>
                  <span className='font-medium'>{course.totalEnrollments}</span>
                </div>
                <div className='flex justify-between text-sm text-gray-500'>
                  <span>Completed:</span>
                  <span className='font-medium'>
                    {course.completedEnrollments}
                  </span>
                </div>
              </div>

              {course.creator && (
                <div className='text-sm text-gray-500 mb-4'>
                  Created by: {course.creator.name || course.creator.email}
                </div>
              )}

              <div className='flex items-center justify-between'>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    course.isPublished
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {course.isPublished ? 'Published' : 'Draft'}
                </span>

                <div className='flex space-x-2'>
                  <button
                    onClick={() =>
                      handleTogglePublish(course._id, course.isPublished)
                    }
                    className={`px-3 py-1 text-xs rounded-md ${
                      course.isPublished
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {course.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course._id, course.title)}
                    className='px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200'
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className='text-center py-12'>
          <div className='text-4xl mb-4'>📚</div>
          <p className='text-gray-500'>
            No courses found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
}
