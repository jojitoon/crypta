'use client';
import { api } from '@repo/backend/convex';
import { useQuery, useMutation } from 'convex/react';
import { useState } from 'react';

export default function WebinarsPage() {
  const apiAny = api as any;
  const webinars = useQuery(apiAny.multimedia.listWebinars);
  const createWebinar = useMutation(apiAny.multimedia.createWebinar);
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
          <li key={(w as any)._id} className='border rounded p-3 text-sm'>
            {(w as any).title} — {(w as any).scheduledAt}
          </li>
        ))}
      </ul>
    </div>
  );
}
