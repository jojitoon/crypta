'use client';
import { api } from '@repo/backend/convex';
import { useQuery, useMutation } from 'convex/react';
import { useState } from 'react';
import Link from 'next/link';

export default function CommunityPage() {
  const apiAny = api as any;
  const threads = useQuery(apiAny.community.listThreads, {});
  const createThread = useMutation(apiAny.community.createThread);
  const [threadTitle, setThreadTitle] = useState('');

  const handleThread = async () => {
    if (!threadTitle) return;
    await createThread({ title: threadTitle });
    setThreadTitle('');
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold mb-2'>Community Forum</h1>
        <p className='text-gray-600'>
          Discuss crypto topics and share knowledge
        </p>
      </div>

      <div className='mb-6 flex gap-4'>
        <Link
          href='/community/ideas'
          className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
        >
          <span>💡</span>
          <span>Course Ideas</span>
        </Link>
      </div>

      <section>
        <h2 className='text-xl font-semibold mb-3'>Start a Discussion</h2>
        <div className='border rounded p-3 mb-4 grid gap-2'>
          <input
            value={threadTitle}
            onChange={(e) => setThreadTitle(e.target.value)}
            placeholder='Thread title'
            className='border rounded px-3 py-2'
          />
          <button
            onClick={handleThread}
            className='bg-gray-900 text-white px-4 py-2 rounded'
          >
            Create Discussion
          </button>
        </div>
        <h2 className='text-xl font-semibold mb-3'>Recent Discussions</h2>
        <ul className='space-y-3'>
          {(threads || []).map((t) => (
            <li
              key={(t as any)._id}
              className='border rounded p-4 hover:bg-gray-50 transition-colors'
            >
              <a href={`/community/threads/${(t as any)._id}`}>
                <div className='font-medium text-lg mb-2 hover:text-blue-600 transition-colors'>
                  {(t as any).title}
                </div>
                {(t as any).lastPost && (
                  <div className='text-sm text-gray-600'>
                    <span className='font-medium'>
                      {(t as any).lastPost.authorName}
                    </span>
                    <span className='mx-2'>•</span>
                    <span>
                      {(t as any).lastPost.content.length > 100
                        ? (t as any).lastPost.content.substring(0, 100) + '...'
                        : (t as any).lastPost.content}
                    </span>
                    <span className='mx-2'>•</span>
                    <span>
                      {new Date(
                        (t as any).lastPost.createdAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
