'use client';
import { useRouter } from 'next/navigation';

export default function PaymentCancelledPage() {
  const router = useRouter();

  return (
    <div className='min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4'>
      <div className='max-w-2xl mx-auto text-center'>
        <div className='bg-white rounded-2xl shadow-xl p-8 md:p-12'>
          {/* Cancelled Icon */}
          <div className='mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6'>
            <svg
              className='h-10 w-10 text-red-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </div>

          {/* Cancelled Message */}
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>
            Payment Cancelled
          </h1>
          <p className='text-lg text-gray-600 mb-8'>
            Your payment was cancelled. No charges have been made to your
            account.
          </p>

          {/* Information */}
          <div className='bg-gray-50 rounded-lg p-6 mb-8'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4'>
              What happened?
            </h2>
            <div className='text-left text-sm text-gray-600 space-y-2'>
              <p>• You cancelled the payment process</p>
              <p>• Your session timed out</p>
              <p>• There was an issue with the payment method</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button
              onClick={() => router.push('/pricing')}
              className='bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium'
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/courses')}
              className='bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium'
            >
              Browse Free Courses
            </button>
          </div>

          {/* Additional Info */}
          <div className='mt-8 text-sm text-gray-500'>
            <p>
              Need help? Contact our support team if you're experiencing any
              issues with the payment process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
