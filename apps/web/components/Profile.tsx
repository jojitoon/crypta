'use client';
import { useQuery } from 'convex/react';
import { api } from '@repo/backend/convex';

export function Profile() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userStats = useQuery(api.achievements.getUserStats);
  const achievements = useQuery(api.achievements.getUserAchievements);
  const leaderboard = useQuery(api.achievements.getLeaderboard, { limit: 10 });

  console.log({ loggedInUser });

  if (userStats === undefined || achievements === undefined) {
    return (
      <div className='flex justify-center items-center min-h-96'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  const userRank =
    leaderboard?.findIndex((user) => user.userId === loggedInUser?._id) ?? -1;

  return (
    <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Profile</h1>
        <p className='text-gray-600'>
          Track your learning progress and achievements
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Profile Info */}
        <div className='lg:col-span-1'>
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <div className='text-center mb-6'>
              <div className='w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4'>
                {loggedInUser?.name?.[0] || loggedInUser?.email?.[0] || '?'}
              </div>
              <h2 className='text-xl font-semibold text-gray-900'>
                {loggedInUser?.name || 'Anonymous User'}
              </h2>
              <p className='text-gray-600'>{loggedInUser?.email}</p>
            </div>

            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>Level</span>
                <span className='font-semibold text-purple-600'>
                  {userStats?.level || 1}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>Global Rank</span>
                <span className='font-semibold text-blue-600'>
                  {userRank >= 0 ? `#${userRank + 1}` : 'Unranked'}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>Member Since</span>
                <span className='text-gray-900'>
                  {loggedInUser?._creationTime
                    ? new Date(loggedInUser._creationTime).toLocaleDateString()
                    : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats and Achievements */}
        <div className='lg:col-span-2 space-y-8'>
          {/* Stats Grid */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center'>
              <div className='text-2xl mb-2'>🏆</div>
              <div className='text-2xl font-bold text-blue-600'>
                {userStats?.totalPoints || 0}
              </div>
              <div className='text-sm text-gray-600'>Total Points</div>
            </div>

            <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center'>
              <div className='text-2xl mb-2'>⚡</div>
              <div className='text-2xl font-bold text-yellow-600'>
                {userStats?.currentStreak || 0}
              </div>
              <div className='text-sm text-gray-600'>Current Streak</div>
            </div>

            <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center'>
              <div className='text-2xl mb-2'>📚</div>
              <div className='text-2xl font-bold text-green-600'>
                {userStats?.coursesCompleted || 0}
              </div>
              <div className='text-sm text-gray-600'>Courses</div>
            </div>

            <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center'>
              <div className='text-2xl mb-2'>⏱️</div>
              <div className='text-2xl font-bold text-purple-600'>
                {Math.round((userStats?.totalTimeSpent || 0) / 60)}h
              </div>
              <div className='text-sm text-gray-600'>Time Spent</div>
            </div>
          </div>

          {/* Achievements */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>
              Achievements
            </h3>

            {achievements && achievements.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {achievements.map((achievement) => (
                  <div
                    key={achievement._id}
                    className='flex items-center space-x-4 p-4 bg-gray-50 rounded-lg'
                  >
                    <div className='text-3xl'>{achievement.iconUrl}</div>
                    <div>
                      <h4 className='font-medium text-gray-900'>
                        {achievement.title}
                      </h4>
                      <p className='text-sm text-gray-600'>
                        {achievement.description}
                      </p>
                      <p className='text-xs text-gray-500 mt-1'>
                        {new Date(achievement.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8'>
                <div className='text-4xl mb-4'>🏆</div>
                <p className='text-gray-600 mb-4'>No achievements yet</p>
                <button
                  onClick={() => {
                    window.location.href = '/courses';
                  }}
                  className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
                >
                  Start Learning
                </button>
              </div>
            )}
          </div>

          {/* Progress Overview */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <h3 className='text-xl font-semibold text-gray-900 mb-6'>
              Learning Progress
            </h3>

            <div className='space-y-4'>
              <div>
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-sm font-medium text-gray-700'>
                    Lessons Completed
                  </span>
                  <span className='text-sm text-gray-600'>
                    {userStats?.lessonsCompleted || 0}
                  </span>
                </div>
              </div>

              <div>
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-sm font-medium text-gray-700'>
                    Longest Streak
                  </span>
                  <span className='text-sm text-gray-600'>
                    {userStats?.longestStreak || 0} days
                  </span>
                </div>
              </div>

              <div>
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-sm font-medium text-gray-700'>
                    Next Level Progress
                  </span>
                  <span className='text-sm text-gray-600'>
                    {(userStats?.totalPoints || 0) % 1000} / 1000 XP
                  </span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-purple-600 h-2 rounded-full transition-all duration-300'
                    style={{
                      width: `${((userStats?.totalPoints || 0) % 1000) / 10}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
