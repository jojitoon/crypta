'use client';
import { useAuthActions } from '@convex-dev/auth/react';
import { Button } from '@repo/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<'signIn' | 'signUp'>('signIn');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  return (
    <div className='w-full'>
      <form
        className='flex flex-col gap-form-field'
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitting(true);
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set('flow', flow);
          void signIn('password', formData)
            .catch((error) => {
              let toastTitle = '';
              if (error.message.includes('Invalid password')) {
                toastTitle = 'Invalid password. Please try again.';
              } else {
                toastTitle =
                  flow === 'signIn'
                    ? 'Could not sign in, did you mean to sign up?'
                    : 'Could not sign up, did you mean to sign in?';
              }
              toast.error(toastTitle);
              setSubmitting(false);
            })
            .then(async () => {
              await router.push('/dashboard');
            });
        }}
      >
        <input
          className='w-full px-4 py-3 rounded-container bg-white border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow shadow-sm hover:shadow my-3 rounded-sm'
          type='email'
          name='email'
          placeholder='Email'
          required
        />
        <input
          className='w-full px-4 py-3 rounded-container bg-white border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow shadow-sm hover:shadow my-3 rounded-sm'
          type='password'
          name='password'
          placeholder='Password'
          required
        />
        <Button
          className='w-full px-4 py-3 rounded bg-teal-500 text-white font-semibold hover:bg-teal-600 transition-colors shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed capitalize  my-3'
          type='submit'
          disabled={submitting}
        >
          {flow === 'signIn' ? 'Sign in' : 'Sign up'}
        </Button>
        <div className='text-center text-sm text-secondary'>
          <span>
            {flow === 'signIn'
              ? "Don't have an account? "
              : 'Already have an account? '}
          </span>
          <button
            type='button'
            className='text-primary hover:text-primary-hover hover:underline font-medium cursor-pointer capitalize text-slate-500'
            onClick={() => setFlow(flow === 'signIn' ? 'signUp' : 'signIn')}
          >
            {flow === 'signIn' ? 'Sign up instead' : 'Sign in instead'}
          </button>
        </div>
      </form>
      <div className='flex items-center justify-center my-3'>
        <hr className='my-4 grow border-gray-200' />
        <span className='mx-4 text-secondary'>or</span>
        <hr className='my-4 grow border-gray-200' />
      </div>
      <Button
        className='w-full px-4 py-3 rounded bg-primary text-white font-semibold hover:bg-primary-hover transition-colors shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed capitalize text-slate-500'
        onClick={() =>
          void signIn('anonymous').then(async () => {
            await router.push('/dashboard');
          })
        }
      >
        Sign in anonymously
      </Button>
    </div>
  );
}
