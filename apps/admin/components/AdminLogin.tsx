'use client';

import { useState } from 'react';
import { useConvexAuth, useMutation } from 'convex/react';
import { api } from '@repo/backend/convex';
import { toast } from 'sonner';
import { useAuthActions } from '@convex-dev/auth/react';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstUser, setIsFirstUser] = useState(false);

  const { isAuthenticated } = useConvexAuth();
  const { signIn } = useAuthActions();
  const makeFirstUserAdmin = useMutation(api.admin.makeFirstUserAdmin);

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

  const handleMakeFirstUserAdmin = async () => {
    setIsLoading(true);
    try {
      await makeFirstUserAdmin({});
      toast.success('You are now an admin! Please sign in.');
      setIsFirstUser(false);
    } catch (error) {
      toast.error(
        'Failed to make first user admin. You may not be the first user.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <div className='mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100'>
            <span className='text-2xl'>🔐</span>
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

          {/* First User Admin Setup */}
          <div className='mt-4 pt-4 border-t border-gray-200'>
            <p className='text-sm text-gray-600 mb-3'>
              First time setup? Make yourself an admin:
            </p>
            <button
              type='button'
              onClick={handleMakeFirstUserAdmin}
              disabled={isLoading}
              className='w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? (
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600'></div>
              ) : (
                'Make First User Admin'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
