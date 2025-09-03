'use client';

import { useState } from 'react';
import { useConvexAuth } from 'convex/react';
import { toast } from 'sonner';
import { useAuthActions } from '@convex-dev/auth/react';
import Image from 'next/image';

export function AdminLogin({
  setShowRegister,
}: {
  setShowRegister: (show: boolean) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated } = useConvexAuth();
  const { signIn } = useAuthActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn('password', { email, password, flow: 'signIn' });
      toast.success('Login successful!');
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <div className='mx-auto flex items-center justify-center'>
            <Image
              src='/logo.png'
              alt='CryptoLearn Logo'
              width={100}
              height={32}
              className='w-36 h-12'
            />
          </div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Admin Login
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Sign in to access the admin panel
          </p>
        </div>
        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='rounded-md shadow-sm -space-y-px'>
            <div>
              <label htmlFor='email' className='sr-only'>
                Email address
              </label>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
                placeholder='Email address'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor='password' className='sr-only'>
                Password
              </label>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete='current-password'
                required
                className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type='submit'
              disabled={isLoading}
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? (
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className='text-center space-y-2'>
            <div>
              <a
                href='/forgot-password'
                className='text-sm text-blue-600 hover:text-blue-700 hover:underline'
              >
                Forgot your password?
              </a>
            </div>
            <div>
              <button
                onClick={() => setShowRegister(true)}
                className='px-4 py-2 text-sm text-gray-600 hover:text-gray-900'
              >
                Create an account
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
