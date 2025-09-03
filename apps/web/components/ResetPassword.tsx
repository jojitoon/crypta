'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@repo/backend/convex';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export function ResetPassword() {
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

  // Auto-redirect to login after successful password reset
  useEffect(() => {
    if (isCompleted) {
      router.push('/login');
    }
  }, [isCompleted, router]);

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
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full text-center'>
          <XCircle className='mx-auto h-12 w-12 text-red-500' />
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
            Invalid Reset Link
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            This password reset link is invalid or has expired.
          </p>
          <div className='mt-6'>
            <Link
              href='/forgot-password'
              className='font-medium text-blue-600 hover:text-blue-500'
            >
              Request a new reset link
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
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Verifying reset token...</p>
        </div>
      </div>
    );
  }

  if (!verifyToken.valid) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full text-center'>
          <XCircle className='mx-auto h-12 w-12 text-red-500' />
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
            Invalid Reset Link
          </h2>
          <p className='mt-2 text-sm text-gray-600'>{verifyToken.message}</p>
          <div className='mt-6'>
            <Link
              href='/forgot-password'
              className='font-medium text-blue-600 hover:text-blue-500'
            >
              Request a new reset link
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
          <CheckCircle className='mx-auto h-12 w-12 text-green-500' />
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
            Password Reset Successfully
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            Your password has been reset. You can now log in with your new
            password.
          </p>

          <div className='mt-6'>
            <Link
              href='/login'
              className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors'
            >
              Go to Login Now
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
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Reset Your Password
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Enter your new password below
          </p>
          {verifyToken.userEmail && (
            <p className='mt-2 text-center text-sm text-gray-500'>
              Resetting password for: <strong>{verifyToken.userEmail}</strong>
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
                New Password
              </label>
              <div className='relative'>
                <input
                  id='newPassword'
                  name='newPassword'
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className='appearance-none rounded-lg relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
                  placeholder='Enter new password'
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
                Confirm New Password
              </label>
              <div className='relative'>
                <input
                  id='confirmPassword'
                  name='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className='appearance-none rounded-lg relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
                  placeholder='Confirm new password'
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
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>

          <div className='text-center'>
            <Link
              href='/login'
              className='font-medium text-blue-600 hover:text-blue-500'
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
