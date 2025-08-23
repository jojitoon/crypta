'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@repo/backend/convex';
import { toast } from 'sonner';
import { Id } from '@repo/backend/dataModel';

export function CommunityManagement() {
  const [activeSection, setActiveSection] = useState<
    'ideas' | 'threads' | 'posts'
  >('ideas');
  const [searchTerm, setSearchTerm] = useState('');

  const ideas = useQuery(api.admin.getAllCommunityIdeas);
  const threads = useQuery(api.admin.getAllForumThreads);
  const posts = useQuery(api.admin.getAllForumPosts);

  const updateIdeaStatus = useMutation(api.admin.updateCommunityIdeaStatus);
  const deleteIdea = useMutation(api.admin.deleteCommunityIdea);
  const deleteThread = useMutation(api.admin.deleteForumThread);
  const deletePost = useMutation(api.admin.deleteForumPost);

  const handleUpdateIdeaStatus = async (
    ideaId: Id<'communityIdeas'>,
    status: string
  ) => {
    try {
      await updateIdeaStatus({ ideaId, status: status as any });
      toast.success('Idea status updated successfully');
    } catch (error) {
      toast.error('Failed to update idea status');
    }
  };

  const handleDeleteIdea = async (
    ideaId: Id<'communityIdeas'>,
    title: string
  ) => {
    if (!confirm(`Are you sure you want to delete idea "${title}"?`)) return;

    try {
      await deleteIdea({ ideaId });
      toast.success('Idea deleted successfully');
    } catch (error) {
      toast.error('Failed to delete idea');
    }
  };

  const handleDeleteThread = async (
    threadId: Id<'forumThreads'>,
    title: string
  ) => {
    if (!confirm(`Are you sure you want to delete thread "${title}"?`)) return;

    try {
      await deleteThread({ threadId });
      toast.success('Thread deleted successfully');
    } catch (error) {
      toast.error('Failed to delete thread');
    }
  };

  const handleDeletePost = async (
    postId: Id<'forumPosts'>,
    content: string
  ) => {
    if (!confirm(`Are you sure you want to delete this post?`)) return;

    try {
      await deletePost({ postId });
      toast.success('Post deleted successfully');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  if (!ideas || !threads || !posts) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  const filteredIdeas = ideas.filter(
    (idea) =>
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredThreads = threads.filter((thread) =>
    thread.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPosts = posts.filter((post) =>
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold text-gray-900'>
          Community Management
        </h2>
        <div className='text-sm text-gray-600'>
          Ideas: {ideas.length} | Threads: {threads.length} | Posts:{' '}
          {posts.length}
        </div>
      </div>

      {/* Section Navigation */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <div className='flex space-x-4'>
          <button
            onClick={() => setActiveSection('ideas')}
            className={`px-4 py-2 rounded-md font-medium ${
              activeSection === 'ideas'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Community Ideas ({ideas.length})
          </button>
          <button
            onClick={() => setActiveSection('threads')}
            className={`px-4 py-2 rounded-md font-medium ${
              activeSection === 'threads'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Forum Threads ({threads.length})
          </button>
          <button
            onClick={() => setActiveSection('posts')}
            className={`px-4 py-2 rounded-md font-medium ${
              activeSection === 'posts'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Forum Posts ({posts.length})
          </button>
        </div>
      </div>

      {/* Search */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <input
          type='text'
          placeholder='Search...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        />
      </div>

      {/* Content */}
      {activeSection === 'ideas' && (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Idea
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Author
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Votes
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredIdeas.map((idea) => (
                  <tr key={idea._id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4'>
                      <div>
                        <div className='text-sm font-medium text-gray-900'>
                          {idea.title}
                        </div>
                        <div className='text-sm text-gray-500 line-clamp-2'>
                          {idea.description}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {idea.authorName}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <select
                        value={idea.status}
                        onChange={(e) =>
                          handleUpdateIdeaStatus(idea._id, e.target.value)
                        }
                        className={`text-sm border rounded px-2 py-1 font-medium ${
                          idea.status === 'approved'
                            ? 'border-green-300 bg-green-50 text-green-800'
                            : idea.status === 'rejected'
                              ? 'border-red-300 bg-red-50 text-red-800'
                              : idea.status === 'under_review'
                                ? 'border-yellow-300 bg-yellow-50 text-yellow-800'
                                : 'border-blue-300 bg-blue-50 text-blue-800'
                        }`}
                      >
                        <option value='submitted'>Submitted</option>
                        <option value='under_review'>Under Review</option>
                        <option value='approved'>Approved</option>
                        <option value='rejected'>Rejected</option>
                      </select>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      👍 {idea.upvotes} 👎 {idea.downvotes}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <button
                        onClick={() => handleDeleteIdea(idea._id, idea.title)}
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
        </div>
      )}

      {activeSection === 'threads' && (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Thread
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Author
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Posts
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Created
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredThreads.map((thread) => (
                  <tr key={thread._id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4'>
                      <div className='text-sm font-medium text-gray-900'>
                        {thread.title}
                      </div>
                      {thread.tags && thread.tags.length > 0 && (
                        <div className='flex gap-1 mt-1'>
                          {thread.tags.map((tag, index) => (
                            <span
                              key={index}
                              className='inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full'
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {thread.authorName}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {thread.postsCount}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {new Date(thread.createdAt).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <button
                        onClick={() =>
                          handleDeleteThread(thread._id, thread.title)
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
        </div>
      )}

      {activeSection === 'posts' && (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Post
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Author
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Thread
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Votes
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredPosts.map((post) => (
                  <tr key={post._id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4'>
                      <div className='text-sm text-gray-900 line-clamp-3'>
                        {post.content}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {post.authorName}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {post.threadTitle}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      👍 {post.upvotes || 0} 👎 {post.downvotes || 0}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <button
                        onClick={() => handleDeletePost(post._id, post.content)}
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
        </div>
      )}

      {((activeSection === 'ideas' && filteredIdeas.length === 0) ||
        (activeSection === 'threads' && filteredThreads.length === 0) ||
        (activeSection === 'posts' && filteredPosts.length === 0)) && (
        <div className='text-center py-12'>
          <div className='text-4xl mb-4'>🌐</div>
          <p className='text-gray-500'>
            No items found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
}
