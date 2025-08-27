'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@repo/backend/convex';
import { toast } from 'sonner';
import { Id } from '@repo/backend/dataModel';
import { UserProfileEdit } from './UserProfileEdit';

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAdmin, setFilterAdmin] = useState<'all' | 'admin' | 'user'>(
    'all'
  );
  const [editingUserId, setEditingUserId] = useState<Id<'users'> | null>(null);

  const users = useQuery(api.admin.getAllUsers);
  const updateUserAdminStatus = useMutation(api.admin.updateUserAdminStatus);
  const deleteUser = useMutation(api.admin.deleteUser);

  const handleToggleAdmin = async (
    userId: Id<'users'>,
    currentStatus: boolean
  ) => {
    try {
      await updateUserAdminStatus({ userId, isAdmin: !currentStatus });
      toast.success(
        `User ${!currentStatus ? 'promoted to' : 'removed from'} admin`
      );
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: Id<'users'>, userName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete user "${userName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteUser({ userId });
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleEditUser = (userId: Id<'users'>) => {
    setEditingUserId(userId);
  };

  const handleCloseEdit = () => {
    setEditingUserId(null);
  };

  if (!users) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  // Filter users based on search and admin status
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAdminFilter =
      filterAdmin === 'all' ||
      (filterAdmin === 'admin' && user.isAdmin) ||
      (filterAdmin === 'user' && !user.isAdmin);

    return matchesSearch && matchesAdminFilter;
  });

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold text-gray-900'>User Management</h2>
        <div className='text-sm text-gray-600'>Total Users: {users.length}</div>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label
              htmlFor='search'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Search Users
            </label>
            <input
              type='text'
              id='search'
              placeholder='Search by name or email...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
          <div>
            <label
              htmlFor='filter'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Filter by Role
            </label>
            <select
              id='filter'
              value={filterAdmin}
              onChange={(e) =>
                setFilterAdmin(e.target.value as 'all' | 'admin' | 'user')
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='all'>All Users</option>
              <option value='admin'>Admins Only</option>
              <option value='user'>Regular Users Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  User
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Stats
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Role
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredUsers.map((user) => (
                <tr key={user._id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 h-10 w-10'>
                        <div className='h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center'>
                          <span className='text-sm font-medium text-gray-700'>
                            {user.name?.charAt(0) ||
                              user.email?.charAt(0) ||
                              '?'}
                          </span>
                        </div>
                      </div>
                      <div className='ml-4'>
                        <div className='text-sm font-medium text-gray-900'>
                          {user.name || 'No name'}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-900'>
                      <div>Points: {user.stats?.totalPoints || 0}</div>
                      <div>Courses: {user.coursesCreatedCount}</div>
                      <div>Achievements: {user.achievementsCount}</div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isAdmin
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <div className='flex space-x-2'>
                      <button
                        onClick={() => handleEditUser(user._id)}
                        className='px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200'
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          handleToggleAdmin(user._id, user.isAdmin || false)
                        }
                        className={`px-3 py-1 text-xs rounded-md ${
                          user.isAdmin
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteUser(
                            user._id,
                            user.name || user.email || 'Unknown'
                          )
                        }
                        className='px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200'
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className='text-center py-8'>
            <p className='text-gray-500'>
              No users found matching your criteria.
            </p>
          </div>
        )}
      </div>

      {/* Profile Edit Modal */}
      {editingUserId && (
        <UserProfileEdit userId={editingUserId} onClose={handleCloseEdit} />
      )}
    </div>
  );
}
