'use client';

import { useState } from 'react';
import { useConvexAuth, useQuery } from 'convex/react';
import { api } from '@repo/backend/convex';
import { AdminRegister } from '../components/AdminRegister';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AdminDashboard } from '../components/AdminDashboard';
import { AdminLogin } from '../components/AdminLogin';
import { useAuthActions } from '@convex-dev/auth/react';
import { toast } from 'sonner';

export default function AdminPage() {
  const [showRegister, setShowRegister] = useState(false);
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.auth.loggedInUser);
  const { signOut } = useAuthActions();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch {
      toast.error('Failed to sign out');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return showRegister ? (
      <div>
        <AdminRegister setShowRegister={setShowRegister} />
      </div>
    ) : (
      <div>
        <AdminLogin setShowRegister={setShowRegister} />
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
            <p className='text-gray-600 mb-6'>
              You don&apos;t have admin privileges to access this panel.
            </p>
            <button
              onClick={handleSignOut}
              className='text-sm text-gray-600 hover:text-gray-900 font-bold cursor-pointer'
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}
