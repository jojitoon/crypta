'use client';
import { api } from '@repo/backend/convex';
import { useQuery, useMutation } from 'convex/react';
import { useState } from 'react';

export default function ShortsPage() {
  const apiAny = api as any;
  const shorts = useQuery(apiAny.multimedia.listShorts);
  const createShort = useMutation(apiAny.multimedia.createShort);
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const handleCreate = async () => {
    if (!title || !videoUrl) return;
    await createShort({ title, videoUrl });
    setTitle('');
    setVideoUrl('');
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <h1 className='text-2xl font-semibold mb-4'>Shorts</h1>
      <div className='grid md:grid-cols-2 gap-2 mb-4'>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='Title'
          className='border rounded px-3 py-2'
        />
        <input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder='Video URL'
          className='border rounded px-3 py-2'
        />
      </div>
      <button
        onClick={handleCreate}
        className='bg-blue-600 text-white px-4 py-2 rounded'
      >
        Create
      </button>
      <ul className='mt-6 grid md:grid-cols-2 gap-3'>
        {(shorts || []).map((s) => (
          <li key={(s as any)._id} className='border rounded overflow-hidden'>
            <div className='p-3 text-sm font-medium'>{(s as any).title}</div>
            <video
              src={(s as any).videoUrl}
              controls
              className='w-full h-48 object-cover'
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
