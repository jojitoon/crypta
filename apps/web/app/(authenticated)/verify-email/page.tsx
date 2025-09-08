'use client';
import { useQuery, useAction, useMutation } from 'convex/react';
import { useConvexAuth } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '@repo/backend/convex';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const user = useQuery(api.auth.loggedInUser);
  const isEmailVerified = useQuery(api.auth.isEmailVerified);
  const sendEmailVerification = useAction(api.auth.sendEmailVerification);
  const verifyEmail = useMutation(api.auth.verifyEmail);

  // Redirect if not authenticated
  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Redirect if email is already verified
  useEffect(() => {
    if (isEmailVerified === true) {
      router.push('/dashboard');
    }
  }, [isEmailVerified, router]);

  // Automatically send verification email when page loads
  useEffect(() => {
    if (isAuthenticated === true && isEmailVerified === false && user?.email) {
      // Send verification email automatically
      const sendInitialEmail = async () => {
        try {
          await sendEmailVerification();
        } catch (error) {
          console.error('Failed to send initial verification email:', error);
        }
      };
      sendInitialEmail();
    }
  }, [isAuthenticated, isEmailVerified, user?.email, sendEmailVerification]);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyEmail({ code: verificationCode });
      if (result.success) {
        toast.success(result.message);
        router.push('/dashboard');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      const result = await sendEmailVerification();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Failed to resend verification code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (
    isAuthenticated === undefined ||
    user === undefined ||
    isEmailVerified === undefined
  ) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            User not found
          </h1>
          <button
            onClick={() => router.push('/login')}
            className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <div className='mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100'>
            <svg
              className='h-6 w-6 text-blue-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
              />
            </svg>
          </div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Verify Your Email
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            We&apos;ve sent a 6-digit verification code to{' '}
            <span className='font-medium text-gray-900'>{user.email}</span>
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleVerifyEmail}>
          <div>
            <label htmlFor='verification-code' className='sr-only'>
              Verification Code
            </label>
            <input
              id='verification-code'
              name='verification-code'
              type='text'
              required
              maxLength={6}
              value={verificationCode}
              onChange={(e) =>
                setVerificationCode(e.target.value.replace(/\D/g, ''))
              }
              className='appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
              placeholder='000000'
            />
          </div>

          <div>
            <button
              type='submit'
              disabled={isLoading || verificationCode.length !== 6}
              className='group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>

          <div className='text-center'>
            <p className='text-sm text-gray-600'>
              Didn&apos;t receive the code?{' '}
              <button
                type='button'
                onClick={handleResendCode}
                disabled={isResending}
                className='font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed'
              >
                {isResending ? 'Sending...' : 'Resend Code'}
              </button>
            </p>
          </div>
        </form>

        <div className='text-center'>
          <button
            onClick={() => router.push('/dashboard')}
            className='text-sm text-gray-500 hover:text-gray-700'
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
