'use client';

export function AdminStats({ stats }: { stats: any }) {
  if (!stats) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      color: 'bg-blue-500',
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses,
      icon: '📚',
      color: 'bg-green-500',
    },
    {
      title: 'Published Courses',
      value: stats.publishedCourses,
      icon: '✅',
      color: 'bg-purple-500',
    },
    {
      title: 'Total Lessons',
      value: stats.totalLessons,
      icon: '📖',
      color: 'bg-yellow-500',
    },
    {
      title: 'Total Enrollments',
      value: stats.totalEnrollments,
      icon: '🎓',
      color: 'bg-indigo-500',
    },
    {
      title: 'Completed Courses',
      value: stats.completedCourses,
      icon: '🏆',
      color: 'bg-pink-500',
    },
    {
      title: 'Admin Users',
      value: stats.adminUsers,
      icon: '👑',
      color: 'bg-red-500',
    },
    {
      title: 'Total Achievements',
      value: stats.totalAchievements,
      icon: '🎖️',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-2xl font-bold text-gray-900 mb-4'>
          Platform Overview
        </h2>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {statCards.map((stat) => (
            <div
              key={stat.title}
              className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'
            >
              <div className='flex items-center'>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full ${stat.color} flex items-center justify-center`}
                >
                  <span className='text-white text-sm'>{stat.icon}</span>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>
                    {stat.title}
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Recent Activity (Last 7 Days)
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='flex items-center p-4 bg-blue-50 rounded-lg'>
            <div className='flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center'>
              <span className='text-white text-sm'>📈</span>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Lesson Completions
              </p>
              <p className='text-xl font-bold text-gray-900'>
                {stats.recentActivity.progress}
              </p>
            </div>
          </div>
          <div className='flex items-center p-4 bg-green-50 rounded-lg'>
            <div className='flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center'>
              <span className='text-white text-sm'>🏆</span>
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Achievements Earned
              </p>
              <p className='text-xl font-bold text-gray-900'>
                {stats.recentActivity.achievements}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {/* <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
          Quick Actions
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <button className='flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'>
            <span className='mr-2'>👥</span>
            Manage Users
          </button>
          <button className='flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'>
            <span className='mr-2'>📚</span>
            Manage Courses
          </button>
          <button className='flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50'>
            <span className='mr-2'>📊</span>
            View Analytics
          </button>
        </div>
      </div> */}
    </div>
  );
}
