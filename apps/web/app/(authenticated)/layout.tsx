'use client';
import { api } from '@repo/backend/convex';
import { useConvexAuth, useQuery } from 'convex/react';
import Link from 'next/link';
import { SignOutButton } from '../../components/SignOutButton';
import { redirect } from 'next/navigation';

function Header() {
  const userStats = useQuery(api.achievements.getUserStats);
  return (
    <header className='sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          <div className='flex items-center space-x-8'>
            <Link
              href='/dashboard'
              className='flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors'
            >
              <span className='text-2xl'>🚀</span>
              <span>CryptoLearn</span>
            </Link>

            <nav className='hidden md:flex space-x-6'>
              <Link
                href='/dashboard'
                className='px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors'
              >
                Dashboard
              </Link>
              <Link
                href='/courses'
                className='px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors'
              >
                Courses
              </Link>
              <Link
                href='/create-course'
                className='px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors'
              >
                Create Course
              </Link>
            </nav>
          </div>

          <div className='flex items-center space-x-4'>
            {userStats && (
              <div className='hidden sm:flex items-center space-x-4 text-sm'>
                <div className='flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full'>
                  <span>⚡</span>
                  <span>{userStats.currentStreak}</span>
                </div>
                <div className='flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
                  <span>🏆</span>
                  <span>{userStats.totalPoints}</span>
                </div>
                <div className='flex items-center space-x-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full'>
                  <span>📚</span>
                  <span>Lv.{userStats.level}</span>
                </div>
              </div>
            )}

            <Link
              href='/profile'
              className='p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors'
            >
              <span className=''>👤</span>
            </Link>

            <SignOutButton />

            {/*             
            <div className='flex items-center space-x-4'>
              <a
                href='/profile'
                className='p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors'
              >
                <span className='text-xl'>👤</span>
              </a> */}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();

  console.log('isAuthenticated', isAuthenticated);

  if (!isAuthenticated && !isLoading) {
    return redirect('/login');
  }

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className='flex-1'>{children}</main>
    </>
  );
}
