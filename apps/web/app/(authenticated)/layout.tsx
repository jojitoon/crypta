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

  // List of menu items for the dropdown
  const menuItems = [
    {
      href: '/dashboard',
      icon: '🏠',
      title: 'Dashboard',
      desc: 'Your overview and progress',
      comingSoon: false,
    },
    {
      href: '/courses',
      icon: '📚',
      title: 'Courses',
      desc: 'Browse all courses',
      comingSoon: false,
    },
    {
      href: '/create-course',
      icon: '➕',
      title: 'Create Course',
      desc: 'Publish your content',
      comingSoon: false,
    },
    {
      href: '/community',
      icon: '🌐',
      title: 'Community',
      desc: 'Forum discussions',
      comingSoon: false,
    },
    {
      href: '/community/ideas',
      icon: '💡',
      title: 'Course Ideas',
      desc: 'Suggest new courses',
      comingSoon: false,
    },
    {
      href: '/ai',
      icon: '🤖',
      title: 'AI Tutor',
      desc: 'Personalized learning',
      comingSoon: true,
    },
    {
      href: '/credentials',
      icon: '🎓',
      title: 'Credentials',
      desc: 'On-chain certificates',
      comingSoon: true,
    },
    {
      href: '/wallet',
      icon: '🦊',
      title: 'Wallet',
      desc: 'Connect and staking',
      comingSoon: true,
    },
    {
      href: '/consulting',
      icon: '🗓️',
      title: 'Consulting',
      desc: '1:1 coaching',
      comingSoon: true,
    },
    {
      href: '/multimedia/webinars',
      icon: '🎥',
      title: 'Webinars',
      desc: 'Live sessions',
      comingSoon: true,
    },
    {
      href: '/events',
      icon: '🎟️',
      title: 'Events',
      desc: 'Virtual & physical',
      comingSoon: true,
    },
  ];

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
                    {menuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 ${
                          item.comingSoon
                            ? 'pointer-events-none opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                        tabIndex={item.comingSoon ? -1 : undefined}
                        aria-disabled={item.comingSoon ? 'true' : undefined}
                      >
                        <span>{item.icon}</span>
                        <div>
                          <div className='font-medium flex items-center gap-2'>
                            {item.title}
                            {item.comingSoon && (
                              <span className='ml-1 px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-[10px] font-semibold'>
                                Coming soon
                              </span>
                            )}
                          </div>
                          <div className='text-xs text-gray-500'>
                            {item.desc}
                          </div>
                        </div>
                      </Link>
                    ))}
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
