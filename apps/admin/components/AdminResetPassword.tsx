'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@repo/backend/convex';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Eye, EyeOff, Shield } from 'lucide-react';
import Link from 'next/link';

export function AdminResetPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const verifyToken = useQuery(
    api.auth.verifyResetToken,
    token ? { resetToken: token } : 'skip'
  );
  const resetPassword = useMutation(api.auth.resetPassword);

  useEffect(() => {
    if (!token) {
      toast.error('No reset token provided');
      router.push('/forgot-password');
      return;
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('No reset token provided');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await resetPassword({
        resetToken: token,
        newPassword,
      });

      if (result.success) {
        setIsCompleted(true);
        toast.success(result.message);
        router.push('/');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Admin reset password error:', error);
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full text-center'>
          <div className='mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center'>
            <XCircle className='h-8 w-8 text-red-600' />
          </div>
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
            Invalid Admin Reset Link
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            This admin password reset link is invalid or has expired.
          </p>
          <div className='mt-6'>
            <Link
              href='/forgot-password'
              className='font-medium text-red-600 hover:text-red-500'
            >
              Request a new admin reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (verifyToken === undefined) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Verifying admin reset token...</p>
        </div>
      </div>
    );
  }

  if (!verifyToken.valid) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full text-center'>
          <div className='mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center'>
            <XCircle className='h-8 w-8 text-red-600' />
          </div>
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
            Invalid Admin Reset Link
          </h2>
          <p className='mt-2 text-sm text-gray-600'>{verifyToken.message}</p>
          <div className='mt-6'>
            <Link
              href='/forgot-password'
              className='font-medium text-red-600 hover:text-red-500'
            >
              Request a new admin reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full text-center'>
          <div className='mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center'>
            <CheckCircle className='h-8 w-8 text-green-600' />
          </div>
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
            Admin Password Reset Successfully
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            Your admin password has been reset. You can now log in with your new
            password.
          </p>
          <p className='mt-2 text-sm text-gray-500'>
            You will be redirected to the admin login page in a few seconds...
          </p>
          <div className='mt-6'>
            <Link
              href='/'
              className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors'
            >
              Go to Admin Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <div className='mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center'>
            <Shield className='h-8 w-8 text-red-600' />
          </div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Reset Admin Password
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Enter your new admin password below
          </p>
          {verifyToken.userEmail && (
            <p className='mt-2 text-center text-sm text-gray-500'>
              Resetting admin password for:{' '}
              <strong>{verifyToken.userEmail}</strong>
            </p>
          )}
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='newPassword'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                New Admin Password
              </label>
              <div className='relative'>
                <input
                  id='newPassword'
                  name='newPassword'
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className='appearance-none rounded-lg relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm'
                  placeholder='Enter new admin password'
                  minLength={8}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                >
                  {showPassword ? (
                    <EyeOff className='h-4 w-4 text-gray-400' />
                  ) : (
                    <Eye className='h-4 w-4 text-gray-400' />
                  )}
                </button>
              </div>
              <p className='mt-1 text-xs text-gray-500'>
                Password must be at least 8 characters long
              </p>
            </div>

            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Confirm New Admin Password
              </label>
              <div className='relative'>
                <input
                  id='confirmPassword'
                  name='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className='appearance-none rounded-lg relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm'
                  placeholder='Confirm new admin password'
                  minLength={8}
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                >
                  {showConfirmPassword ? (
                    <EyeOff className='h-4 w-4 text-gray-400' />
                  ) : (
                    <Eye className='h-4 w-4 text-gray-400' />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type='submit'
              disabled={isSubmitting}
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {isSubmitting ? 'Resetting...' : 'Reset Admin Password'}
            </button>
          </div>

          <div className='text-center'>
            <Link
              href='/'
              className='font-medium text-red-600 hover:text-red-500'
            >
              Back to Admin Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
