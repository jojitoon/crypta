'use client';
import { api } from '@repo/backend/convex';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { useState } from 'react';
import Link from 'next/link';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

export default function ThreadPage() {
  const params = useParams() as { threadId: string };
  const apiAny = api as any;
  const posts = useQuery(apiAny.community.listThreadPosts, {
    threadId: params.threadId as any,
  });
  const addPost = useMutation(apiAny.community.addPost);
  const votePost = useMutation(apiAny.community.votePost);
  const loggedInUser = useQuery(apiAny.auth.loggedInUser);
  const [content, setContent] = useState('');

  const handlePost = async () => {
    if (!content) return;
    await addPost({ threadId: params.threadId as any, content });
    setContent('');
  };

  const handleVote = async (postId: string, vote: 'up' | 'down') => {
    await votePost({ postId: postId as any, vote });
  };

  const getUserVote = (post: any) => {
    if (!loggedInUser?._id) return null;
    const votes = post.votes || [];
    const userVote = votes.find((v: any) => v.userId === loggedInUser._id);
    return userVote?.vote || null;
  };

  return (
    <div className='max-w-3xl mx-auto p-6'>
      <div className='mb-6'>
        <Link
          href='/community'
          className='inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors mb-4'
        >
          <span>←</span>
          <span>Back to Forum</span>
        </Link>
        <h1 className='text-2xl font-semibold'>Discussion Thread</h1>
      </div>

      <div className='grid gap-2 mb-6'>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder='Write a reply...'
          className='border rounded px-3 py-2 h-24 resize-none'
        />
        <button
          onClick={handlePost}
          className='bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors'
        >
          Post Reply
        </button>
      </div>

      <div className='space-y-4'>
        {(posts || []).map((p) => (
          <div key={(p as any)._id} className='border rounded p-4'>
            <div className='flex justify-between items-start mb-2'>
              <div className='flex items-center gap-2'>
                <span className='font-medium text-blue-600'>
                  {(p as any).authorName}
                </span>
                <span className='text-xs text-gray-500'>
                  {new Date((p as any).createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className='text-gray-800 mb-3'>{(p as any).content}</div>

            {/* Voting */}
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-1'>
                <button
                  onClick={() => handleVote((p as any)._id, 'up')}
                  className={`p-1 rounded transition-colors ${
                    getUserVote(p) === 'up'
                      ? 'text-green-600 bg-green-100'
                      : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <FaArrowUp size={16} />
                </button>
                <span className='text-sm font-medium text-gray-700'>
                  {(p as any).upvotes || 0}
                </span>
              </div>
              <div className='flex items-center gap-1'>
                <button
                  onClick={() => handleVote((p as any)._id, 'down')}
                  className={`p-1 rounded transition-colors ${
                    getUserVote(p) === 'down'
                      ? 'text-red-600 bg-red-100'
                      : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <FaArrowDown size={16} />
                </button>
                <span className='text-sm font-medium text-gray-700'>
                  {(p as any).downvotes || 0}
                </span>
              </div>
              <span className='text-xs text-gray-500'>
                Score: {((p as any).upvotes || 0) - ((p as any).downvotes || 0)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
