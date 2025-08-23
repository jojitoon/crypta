'use client';
import { api } from '@repo/backend/convex';
import { useQuery, useMutation } from 'convex/react';
import { useState } from 'react';
import Link from 'next/link';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { Doc, Id } from '@repo/backend/dataModel';

export default function CourseIdeasPage() {
  // const { isAuthenticated } = useConvexAuth();
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const ideas = useQuery(api.community.listIdeas, {});
  const submitIdea = useMutation(api.community.submitIdea);
  const voteIdea = useMutation(api.community.voteIdea);

  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaDesc, setIdeaDesc] = useState('');

  const handleIdea = async () => {
    if (!ideaTitle || !ideaDesc) return;
    await submitIdea({ title: ideaTitle, description: ideaDesc });
    setIdeaTitle('');
    setIdeaDesc('');
  };

  const handleVote = async (
    ideaId: Id<'communityIdeas'>,
    vote: 'up' | 'down'
  ) => {
    await voteIdea({ ideaId: ideaId, vote });
  };

  const getUserVote = (idea: Doc<'communityIdeas'>) => {
    if (!loggedInUser?._id) return null;
    const votes = idea.votes || [];
    const userVote = votes.find((v) => v.userId === loggedInUser._id);
    return userVote?.vote || null;
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold mb-2'>Course Ideas</h1>
        <p className='text-gray-600'>Suggest new courses for the community</p>
      </div>

      <div className='mb-6 flex gap-4'>
        <Link
          href='/community'
          className='inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
        >
          <span>←</span>
          <span>Back to Forum</span>
        </Link>
      </div>

      <section className='mb-8'>
        <h2 className='text-xl font-semibold mb-3'>Submit a Course Idea</h2>
        <div className='border rounded p-4 grid gap-3'>
          <input
            value={ideaTitle}
            onChange={(e) => setIdeaTitle(e.target.value)}
            placeholder='Course title'
            className='border rounded px-3 py-2'
          />
          <textarea
            value={ideaDesc}
            onChange={(e) => setIdeaDesc(e.target.value)}
            placeholder='Describe the course idea in detail...'
            className='border rounded px-3 py-2 h-24 resize-none'
          />
          <button
            onClick={handleIdea}
            className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors'
          >
            Submit Idea
          </button>
        </div>
      </section>

      <section>
        <h2 className='text-xl font-semibold mb-3'>Community Ideas</h2>
        <div className='grid gap-4'>
          {(ideas || []).map((i) => {
            const userVote = getUserVote(i);
            return (
              <div key={i._id} className='border rounded p-4'>
                <div className='flex justify-between items-start mb-2'>
                  <h3 className='font-medium text-lg'>{i.title}</h3>
                  <div className='flex items-center gap-3'>
                    <div className='flex items-center gap-1'>
                      <button
                        onClick={() => handleVote(i._id, 'up')}
                        className={`p-1 rounded transition-colors ${
                          userVote === 'up'
                            ? 'text-green-600 bg-green-100'
                            : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                        }`}
                      >
                        <FaArrowUp size={16} />
                      </button>
                      <span className='text-sm font-medium text-gray-700'>
                        {i.upvotes}
                      </span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <button
                        onClick={() => handleVote(i._id, 'down')}
                        className={`p-1 rounded transition-colors ${
                          userVote === 'down'
                            ? 'text-red-600 bg-red-100'
                            : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <FaArrowDown size={16} />
                      </button>
                      <span className='text-sm font-medium text-gray-700'>
                        {i.downvotes || 0}
                      </span>
                    </div>
                  </div>
                </div>
                <p className='text-gray-700 mb-3'>{i.description}</p>
                <div className='flex items-center gap-4 text-xs text-gray-500'>
                  <span>Status: {i.status}</span>
                  <span>
                    Submitted: {new Date(i.createdAt).toLocaleDateString()}
                  </span>
                  <span className='text-green-600 font-medium'>
                    Score: {i.upvotes - (i.downvotes || 0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
