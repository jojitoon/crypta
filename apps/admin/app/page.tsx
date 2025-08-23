'use client';

import { useState } from 'react';
import { useConvexAuth, useQuery } from 'convex/react';
import { api } from '@repo/backend/convex';
import { AdminRegister } from '../components/AdminRegister';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AdminDashboard } from '../components/AdminDashboard';
import { AdminLogin } from '../components/AdminLogin';

export default function AdminPage() {
  const [showRegister, setShowRegister] = useState(false);
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.auth.loggedInUser);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return showRegister ? (
      <div>
        <AdminRegister />
        <div className='fixed bottom-4 left-4'>
          <button
            onClick={() => setShowRegister(false)}
            className='px-4 py-2 text-sm text-gray-600 hover:text-gray-900'
          >
            ← Back to Login
          </button>
        </div>
      </div>
    ) : (
      <div>
        <AdminLogin />
        <div className='fixed bottom-4 left-4'>
          <button
            onClick={() => setShowRegister(true)}
            className='px-4 py-2 text-sm text-gray-600 hover:text-gray-900'
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='max-w-md w-full bg-white rounded-lg shadow-md p-6'>
          <div className='text-center'>
            <div className='text-6xl mb-4'>🚫</div>
            <h1 className='text-xl font-semibold text-gray-900 mb-2'>
              Access Denied
            </h1>
            <p className='text-gray-600'>
              You don't have admin privileges to access this panel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}
