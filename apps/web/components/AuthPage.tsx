import { SignInForm } from './SignInForm';

export function AuthPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50'>
      <div className='max-w-md w-full mx-auto p-8'>
        <div className='bg-white rounded-2xl shadow-xl p-8'>
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='flex items-center justify-center space-x-2 text-2xl font-bold text-gray-900 mb-2'>
              <span>🚀</span>
              <span>CryptoLearn</span>
            </div>
            <p className='text-gray-600'>
              Sign in to continue your crypto learning journey
            </p>
          </div>

          {/* Sign In Form */}
          <SignInForm />

          {/* Footer */}
          <div className='mt-8 text-center text-sm text-gray-500'>
            <p>
              By signing in, you agree to our{' '}
              <a href='#' className='text-blue-600 hover:underline'>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href='#' className='text-blue-600 hover:underline'>
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
