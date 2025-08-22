'use client';
import { api } from '@repo/backend/convex';
import { useQuery, useMutation } from 'convex/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function Dashboard() {
  const router = useRouter();
  const courses = useQuery(api.courses.listCourses, {});
  const myCourses = useQuery(api.courses.getMyCourses);
  const userStats = useQuery(api.achievements.getUserStats);
  const achievements = useQuery(api.achievements.getUserAchievements);
  const leaderboard = useQuery(api.achievements.getLeaderboard, { limit: 5 });
  const seedCourses = useMutation(api.seedData.seedCourses);

  const handleSeedData = async () => {
    try {
      await seedCourses({});
      toast.success('Sample courses created! Refresh to see them.');
    } catch (error) {
      toast.error('Failed to create sample courses');
    }
  };

  if (courses === undefined || userStats === undefined) {
    return (
      <div className='flex justify-center items-center min-h-96'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  const inProgressCourses =
    courses?.filter(
      (course) =>
        course.progressPercentage > 0 && course.progressPercentage < 100
    ) || [];

  const completedCourses =
    courses?.filter((course) => course.progressPercentage === 100) || [];

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      {/* Welcome Section */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Welcome back! 👋
        </h1>
        <p className='text-gray-600'>Continue your crypto learning journey</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Current Streak
              </p>
              <p className='text-2xl font-bold text-yellow-600'>
                {userStats?.currentStreak || 0}
              </p>
            </div>
            <div className='text-3xl'>⚡</div>
          </div>
        </div>

        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Total Points</p>
              <p className='text-2xl font-bold text-blue-600'>
                {userStats?.totalPoints || 0}
              </p>
            </div>
            <div className='text-3xl'>🏆</div>
          </div>
        </div>

        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Courses Completed
              </p>
              <p className='text-2xl font-bold text-green-600'>
                {userStats?.coursesCompleted || 0}
              </p>
            </div>
            <div className='text-3xl'>📚</div>
          </div>
        </div>

        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Current Level</p>
              <p className='text-2xl font-bold text-purple-600'>
                {userStats?.level || 1}
              </p>
            </div>
            <div className='text-3xl'>🎯</div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Continue Learning */}
        <div className='lg:col-span-2 space-y-8'>
          {/* My Courses */}
          {myCourses && myCourses.length > 0 && (
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                My Created Courses
              </h2>
              <div className='space-y-3'>
                {myCourses.map((course) => (
                  <div
                    key={course._id}
                    className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer'
                    onClick={() => router.push(`/courses/${course._id}`)}
                  >
                    <div className='flex justify-between items-start mb-2'>
                      <h3 className='font-medium text-gray-900'>
                        {course.title}
                      </h3>
                      <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
                        {course.level}
                      </span>
                    </div>
                    <p className='text-sm text-gray-600 mb-3'>
                      {course.description}
                    </p>
                    <div className='flex items-center justify-between text-sm text-gray-500'>
                      <span>{course.totalLessons} lessons</span>
                      <span>{course.estimatedDuration}min</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Continue Learning */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              Continue Learning
            </h2>

            {courses?.length === 0 ? (
              <div className='text-center py-8'>
                <div className='text-4xl mb-4'>📚</div>
                <p className='text-gray-600 mb-4'>No courses available yet</p>
                <button
                  onClick={handleSeedData}
                  className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
                >
                  Create Sample Courses
                </button>
              </div>
            ) : inProgressCourses.length > 0 ? (
              <div className='space-y-4'>
                {inProgressCourses.map((course) => (
                  <div
                    key={course._id}
                    className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer'
                    onClick={() => router.push(`/courses/${course._id}`)}
                  >
                    <div className='flex justify-between items-start mb-2'>
                      <h3 className='font-medium text-gray-900'>
                        {course.title}
                      </h3>
                      <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
                        {course.level}
                      </span>
                    </div>
                    <p className='text-sm text-gray-600 mb-3'>
                      {course.description}
                    </p>
                    <div className='flex items-center justify-between'>
                      <div className='flex-1 bg-gray-200 rounded-full h-2 mr-4'>
                        <div
                          className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                          style={{ width: `${course.progressPercentage}%` }}
                        ></div>
                      </div>
                      <span className='text-sm text-gray-500'>
                        {Math.round(course.progressPercentage)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8'>
                <div className='text-4xl mb-4'>🎯</div>
                <p className='text-gray-600 mb-4'>Ready to start learning?</p>
                <button
                  onClick={() => router.push('/courses')}
                  className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'
                >
                  Browse Courses
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Recent Achievements */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Recent Achievements
            </h3>
            {achievements && achievements.length > 0 ? (
              <div className='space-y-3'>
                {achievements.slice(0, 3).map((achievement) => (
                  <div
                    key={achievement._id}
                    className='flex items-center space-x-3'
                  >
                    <div className='text-2xl'>{achievement.iconUrl}</div>
                    <div>
                      <p className='font-medium text-gray-900 text-sm'>
                        {achievement.title}
                      </p>
                      <p className='text-xs text-gray-600'>
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-gray-500 text-sm'>
                Complete lessons to earn achievements!
              </p>
            )}
          </div>

          {/* Leaderboard */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Leaderboard
            </h3>
            {leaderboard && leaderboard.length > 0 ? (
              <div className='space-y-3'>
                {leaderboard.map((user, index) => (
                  <div
                    key={user.userId}
                    className='flex items-center justify-between'
                  >
                    <div className='flex items-center space-x-3'>
                      <div className='w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium'>
                        {index + 1}
                      </div>
                      <span className='text-sm font-medium text-gray-900'>
                        {user.name}
                      </span>
                    </div>
                    <div className='text-sm text-gray-600'>
                      {user.totalPoints} pts
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-gray-500 text-sm'>No rankings yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
