'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@repo/backend/convex';
import { toast } from 'sonner';
import { AdminStats } from './AdminStats';
import { CourseManagement } from './CourseManagement';
import { UserManagement } from './UserManagement';
import { CommunityManagement } from './CommunityManagement';
import { CredentialsManagement } from './CredentialsManagement';
import { ContentManagement } from './ContentManagement';
import { useAuthActions } from '@convex-dev/auth/react';

type TabType =
  | 'overview'
  | 'users'
  | 'courses'
  | 'community'
  | 'credentials'
  | 'content';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { signOut } = useAuthActions();
  const user = useQuery(api.auth.loggedInUser);
  const stats = useQuery(api.admin.getAdminStats);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'courses', label: 'Courses', icon: '📚' },
    { id: 'community', label: 'Community', icon: '🌐' },
    { id: 'credentials', label: 'Credentials', icon: '🏆' },
    { id: 'content', label: 'Content', icon: '📝' },
  ] as const;

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center'>
              <h1 className='text-xl font-semibold text-gray-900'>
                Crypta Admin Panel
              </h1>
            </div>
            <div className='flex items-center space-x-4'>
              <span className='text-sm text-gray-600'>
                Welcome, {user?.name || user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className='text-sm text-gray-600 hover:text-gray-900'
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex space-x-8'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className='mr-2'>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {activeTab === 'overview' && <AdminStats stats={stats} />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'courses' && <CourseManagement />}
        {activeTab === 'community' && <CommunityManagement />}
        {activeTab === 'credentials' && <CredentialsManagement />}
        {activeTab === 'content' && <ContentManagement />}
      </main>
    </div>
  );
}
