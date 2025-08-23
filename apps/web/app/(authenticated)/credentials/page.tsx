'use client';
import { api } from '@repo/backend/convex';
import { Id } from '@repo/backend/dataModel';
import { useQuery, useMutation } from 'convex/react';
import { useState } from 'react';

export default function CredentialsPage() {
  const list = useQuery(api.credentials.listCredentials);
  const completedCourses = useQuery(api.courses.getCompletedCourses);
  const request = useMutation(api.credentials.requestCredential);
  const [courseId, setCourseId] = useState<Id<'courses'> | null>(null);
  const [type, setType] = useState<'nft' | 'onchain' | 'offchain'>('nft');

  const handleRequest = async () => {
    if (!courseId) return;
    await request({ courseId: courseId, credentialType: type });
    setCourseId(null);
  };

  return (
    <div className='max-w-3xl mx-auto p-6'>
      <h1 className='text-2xl font-semibold mb-4'>Credentials</h1>
      <div className='border rounded p-3 grid gap-2 mb-6'>
        {completedCourses && completedCourses.length === 0 ? (
          <p className='text-gray-600 text-center py-4'>
            No completed courses found. Complete a course to request
            credentials.
          </p>
        ) : (
          <>
            <select
              value={courseId || ''}
              onChange={(e) => setCourseId(e.target.value as Id<'courses'>)}
              className='border rounded px-3 py-2'
            >
              <option value=''>Select a completed course...</option>
              {(completedCourses || []).map((course) => (
                <option key={course.courseId} value={course.courseId}>
                  {course.courseTitle}
                </option>
              ))}
            </select>
            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value as 'nft' | 'onchain' | 'offchain')
              }
              className='border rounded px-3 py-2'
            >
              <option value='nft'>NFT</option>
              <option value='onchain'>On-chain</option>
              <option value='offchain'>Off-chain</option>
            </select>
            <button
              onClick={handleRequest}
              disabled={!courseId}
              className='bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed'
            >
              Request Credential
            </button>
          </>
        )}
      </div>
      <div className='mb-4'>
        <h2 className='text-xl font-semibold mb-3'>Your Credentials</h2>
        {completedCourses && completedCourses.length === 0 ? (
          <p className='text-gray-600'>
            Complete a course to request credentials.
          </p>
        ) : (
          <ul className='space-y-2'>
            {(list || []).map((c) => (
              <li key={c._id} className='border rounded p-3 text-sm'>
                <div className='font-medium'>Course: {c.course?.title}</div>
                <div>Type: {c.credentialType}</div>
                <div>Status: {c.status}</div>
                <div>Issued: {new Date(c.issuedAt).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
