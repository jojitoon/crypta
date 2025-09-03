'use client';

import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@repo/backend/convex';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, Shield } from 'lucide-react';
import Link from 'next/link';

export function AdminForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const forgotPassword = useMutation(api.auth.forgotPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await forgotPassword({
        email: email.trim(),
        isAdmin: true,
      });

      if (result.success) {
        setIsSubmitted(true);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Admin forgot password error:', error);
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          <div className='text-center'>
            <div className='mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center'>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>
            <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
              Check Your Email
            </h2>
            <p className='mt-2 text-sm text-gray-600'>
              We've sent an admin password reset link to{' '}
              <strong>{email}</strong>
            </p>
          </div>

          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <Shield className='h-5 w-5 text-blue-400' />
              </div>
              <div className='ml-3'>
                <p className='text-sm text-blue-700'>
                  This is an admin-only reset link. If you don't see the email,
                  check your spam folder. The link will expire in 1 hour.
                </p>
              </div>
            </div>
          </div>

          <div className='text-center'>
            <Link
              href='/'
              className='font-medium text-blue-600 hover:text-blue-500'
            >
              ← Back to Admin Login
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
            Admin Password Reset
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Enter your admin email address to receive a password reset link
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div>
            <label htmlFor='email' className='sr-only'>
              Admin Email Address
            </label>
            <input
              id='email'
              name='email'
              type='email'
              autoComplete='email'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm'
              placeholder='Admin email address'
            />
          </div>

          <div>
            <button
              type='submit'
              disabled={isSubmitting}
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {isSubmitting ? 'Sending...' : 'Send Admin Reset Link'}
            </button>
          </div>

          <div className='text-center'>
            <Link
              href='/'
              className='font-medium text-red-600 hover:text-red-500 inline-flex items-center'
            >
              <ArrowLeft className='h-4 w-4 mr-1' />
              Back to Admin Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
