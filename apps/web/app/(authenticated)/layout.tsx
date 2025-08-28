'use client';
import { api } from '@repo/backend/convex';
import { useConvexAuth, useQuery } from 'convex/react';
import Link from 'next/link';
import { SignOutButton } from '../../components/SignOutButton';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

function Header() {
  const userStats = useQuery(api.achievements.getUserStats);
  const [open, setOpen] = useState(false);
  return (
    <header className='sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          <div className='flex items-center space-x-8'>
            <Link
              href='/dashboard'
              className='flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors'
            >
              <Image
                src='/logo.png'
                alt='CryptoLearn Logo'
                width={120}
                height={32}
                className='w-36 h-12'
              />
              {/* <span>CryptoLearn</span> */}
            </Link>

            <nav className='hidden md:block relative'>
              <button
                onClick={() => setOpen((v) => !v)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                aria-haspopup='menu'
                aria-expanded={open}
                className='inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm'
              >
                <span>Browse</span>
                <span
                  className={`transition-transform ${open ? 'rotate-180' : ''}`}
                >
                  ▾
                </span>
              </button>
              {open && (
                <div className='absolute mt-2 w-72 rounded-lg border border-gray-200 bg-white shadow-xl overflow-hidden'>
                  <div className='grid grid-cols-1 divide-y divide-gray-100'>
                    <Link
                      href='/dashboard'
                      className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700'
                    >
                      <span>🏠</span>
                      <div>
                        <div className='font-medium'>Dashboard</div>
                        <div className='text-xs text-gray-500'>
                          Your overview and progress
                        </div>
                      </div>
                    </Link>
                    <Link
                      href='/courses'
                      className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700'
                    >
                      <span>📚</span>
                      <div>
                        <div className='font-medium'>Courses</div>
                        <div className='text-xs text-gray-500'>
                          Browse all courses
                        </div>
                      </div>
                    </Link>
                    <Link
                      href='/create-course'
                      className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700'
                    >
                      <span>➕</span>
                      <div>
                        <div className='font-medium'>Create Course</div>
                        <div className='text-xs text-gray-500'>
                          Publish your content
                        </div>
                      </div>
                    </Link>
                    <Link
                      href='/community'
                      className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700'
                    >
                      <span>🌐</span>
                      <div>
                        <div className='font-medium'>Community</div>
                        <div className='text-xs text-gray-500'>
                          Forum discussions
                        </div>
                      </div>
                    </Link>
                    <Link
                      href='/community/ideas'
                      className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700'
                    >
                      <span>💡</span>
                      <div>
                        <div className='font-medium'>Course Ideas</div>
                        <div className='text-xs text-gray-500'>
                          Suggest new courses
                        </div>
                      </div>
                    </Link>
                    <Link
                      href='/ai'
                      className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700'
                    >
                      <span>🤖</span>
                      <div>
                        <div className='font-medium'>AI Tutor</div>
                        <div className='text-xs text-gray-500'>
                          Personalized learning
                        </div>
                      </div>
                    </Link>
                    <Link
                      href='/credentials'
                      className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700'
                    >
                      <span>🎓</span>
                      <div>
                        <div className='font-medium'>Credentials</div>
                        <div className='text-xs text-gray-500'>
                          On-chain certificates
                        </div>
                      </div>
                    </Link>
                    <Link
                      href='/wallet'
                      className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700'
                    >
                      <span>🦊</span>
                      <div>
                        <div className='font-medium'>Wallet</div>
                        <div className='text-xs text-gray-500'>
                          Connect and staking
                        </div>
                      </div>
                    </Link>
                    <Link
                      href='/consulting'
                      className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700'
                    >
                      <span>🗓️</span>
                      <div>
                        <div className='font-medium'>Consulting</div>
                        <div className='text-xs text-gray-500'>
                          1:1 coaching
                        </div>
                      </div>
                    </Link>
                    <Link
                      href='/multimedia/webinars'
                      className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700'
                    >
                      <span>🎥</span>
                      <div>
                        <div className='font-medium'>Webinars</div>
                        <div className='text-xs text-gray-500'>
                          Live sessions
                        </div>
                      </div>
                    </Link>
                    <Link
                      href='/multimedia/shorts'
                      className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700'
                    >
                      <span>📱</span>
                      <div>
                        <div className='font-medium'>Shorts</div>
                        <div className='text-xs text-gray-500'>Quick tips</div>
                      </div>
                    </Link>
                    <Link
                      href='/events'
                      className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700'
                    >
                      <span>🎟️</span>
                      <div>
                        <div className='font-medium'>Events</div>
                        <div className='text-xs text-gray-500'>
                          Virtual & physical
                        </div>
                      </div>
                    </Link>
                    <Link
                      href='/governance'
                      className='flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700'
                    >
                      <span>🗳️</span>
                      <div>
                        <div className='font-medium'>Governance</div>
                        <div className='text-xs text-gray-500'>
                          Vote and propose
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
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
