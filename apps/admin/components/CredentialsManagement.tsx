'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@repo/backend/convex';
import { toast } from 'sonner';
import { Id } from '@repo/backend/dataModel';

export function CredentialsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pending' | 'issued' | 'failed'
  >('all');
  const [filterType, setFilterType] = useState<
    'all' | 'nft' | 'onchain' | 'offchain'
  >('all');

  const credentials = useQuery(api.admin.getAllCredentials);
  const updateCredentialStatus = useMutation(api.admin.updateCredentialStatus);
  const deleteCredential = useMutation(api.admin.deleteCredential);

  const handleUpdateStatus = async (
    credentialId: Id<'credentials'>,
    status: string
  ) => {
    try {
      await updateCredentialStatus({ credentialId, status: status as any });
      toast.success('Credential status updated successfully');
    } catch (error) {
      toast.error('Failed to update credential status');
    }
  };

  const handleDeleteCredential = async (
    credentialId: Id<'credentials'>,
    courseTitle: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete credential for "${courseTitle}"?`
      )
    )
      return;

    try {
      await deleteCredential({ credentialId });
      toast.success('Credential deleted successfully');
    } catch (error) {
      toast.error('Failed to delete credential');
    }
  };

  if (!credentials) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  const filteredCredentials = credentials.filter((credential) => {
    const matchesSearch =
      credential.courseTitle
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      credential.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      credential.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatusFilter =
      filterStatus === 'all' || credential.status === filterStatus;

    const matchesTypeFilter =
      filterType === 'all' || credential.credentialType === filterType;

    return matchesSearch && matchesStatusFilter && matchesTypeFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'issued':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'nft':
        return 'bg-purple-100 text-purple-800';
      case 'onchain':
        return 'bg-blue-100 text-blue-800';
      case 'offchain':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold text-gray-900'>
          Credentials Management
        </h2>
        <div className='text-sm text-gray-600'>
          Total Credentials: {credentials.length}
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Search
            </label>
            <input
              type='text'
              placeholder='Search by course, user name, or email...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='all'>All Status</option>
              <option value='pending'>Pending</option>
              <option value='issued'>Issued</option>
              <option value='failed'>Failed</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='all'>All Types</option>
              <option value='nft'>NFT</option>
              <option value='onchain'>On-chain</option>
              <option value='offchain'>Off-chain</option>
            </select>
          </div>
        </div>
      </div>

      {/* Credentials Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  User
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Course
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Type
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Issued Date
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredCredentials.map((credential) => (
                <tr key={credential._id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div>
                      <div className='text-sm font-medium text-gray-900'>
                        {credential.userName || 'Unknown'}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {credential.userEmail}
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-900'>
                      {credential.courseTitle || 'Unknown Course'}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(credential.credentialType)}`}
                    >
                      {credential.credentialType.toUpperCase()}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <select
                      value={credential.status}
                      onChange={(e) =>
                        handleUpdateStatus(credential._id, e.target.value)
                      }
                      className={`text-sm border border-gray-300 rounded px-2 py-1 ${getStatusColor(credential.status)}`}
                    >
                      <option value='pending'>Pending</option>
                      <option value='issued'>Issued</option>
                      <option value='failed'>Failed</option>
                    </select>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {credential.issuedAt
                      ? new Date(credential.issuedAt).toLocaleDateString()
                      : 'Not issued'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <button
                      onClick={() =>
                        handleDeleteCredential(
                          credential._id,
                          credential.courseTitle || 'Unknown'
                        )
                      }
                      className='text-red-600 hover:text-red-900'
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCredentials.length === 0 && (
          <div className='text-center py-12'>
            <div className='text-4xl mb-4'>🏆</div>
            <p className='text-gray-500'>
              No credentials found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
