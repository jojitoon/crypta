'use client';
import { api } from '@repo/backend/convex';
import { useQuery, useMutation } from 'convex/react';
import { useState } from 'react';

export default function WebinarsPage() {
  const webinars = useQuery(api.multimedia.listWebinars);
  const createWebinar = useMutation(api.multimedia.createWebinar);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  const handleCreate = async () => {
    if (!title || !description || !scheduledAt) return;
    await createWebinar({
      title,
      description,
      scheduledAt: Number(scheduledAt),
    });
    setTitle('');
    setDescription('');
    setScheduledAt('');
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <h1 className='text-2xl font-semibold mb-4'>Webinars</h1>
      <div className='grid md:grid-cols-3 gap-2 mb-4'>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='Title'
          className='border rounded px-3 py-2'
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='Description'
          className='border rounded px-3 py-2'
        />
        <input
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          placeholder='Timestamp'
          className='border rounded px-3 py-2'
        />
      </div>
      <button
        onClick={handleCreate}
        className='bg-blue-600 text-white px-4 py-2 rounded'
      >
        Create
      </button>
      <ul className='mt-6 space-y-2'>
        {(webinars || []).map((w) => (
          <li key={w._id} className='border rounded p-3 text-sm'>
            {w.title} — {w.scheduledAt}
          </li>
        ))}
      </ul>
    </div>
  );
}
