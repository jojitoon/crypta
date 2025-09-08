'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@repo/backend/convex';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isLoading, setIsLoading] = useState(true);

  // Get user's recent purchases to show what they just bought
  const myPurchases = useQuery(api.stripe.getMyPurchases);

  useEffect(() => {
    if (sessionId) {
      // Payment was successful, we can show success message
      setIsLoading(false);
    } else {
      // No session ID, redirect to courses
      router.push('/courses');
    }
  }, [sessionId, router]);

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4'>
      <div className='max-w-2xl mx-auto text-center'>
        <div className='bg-white rounded-2xl shadow-xl p-8 md:p-12'>
          {/* Success Icon */}
          <div className='mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6'>
            <svg
              className='h-10 w-10 text-green-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>
            Payment Successful! 🎉
          </h1>
          <p className='text-lg text-gray-600 mb-8'>
            Thank you for your purchase! You now have access to your course
            content.
          </p>

          {/* Recent Purchase Info */}
          {myPurchases && myPurchases.length > 0 && (
            <div className='bg-gray-50 rounded-lg p-6 mb-8'>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Your Latest Purchase
              </h2>
              <div className='text-left'>
                {myPurchases?.[0]?.course && (
                  <>
                    <h3 className='font-medium text-gray-900'>
                      {myPurchases[0].course.title}
                    </h3>
                    <p className='text-sm text-gray-600 mt-1'>
                      {myPurchases[0].course.description}
                    </p>
                    <div className='mt-3 text-sm text-gray-500'>
                      Amount: ${(myPurchases[0].amount / 100).toFixed(2)}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button
              onClick={() => router.push('/courses')}
              className='bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium'
            >
              View All Courses
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className='bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium'
            >
              Go to Dashboard
            </button>
          </div>

          {/* Additional Info */}
          <div className='mt-8 text-sm text-gray-500'>
            <p>
              You'll receive a confirmation email shortly. If you have any
              questions, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
