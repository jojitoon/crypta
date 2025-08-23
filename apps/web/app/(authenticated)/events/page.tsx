'use client';
import { api } from '@repo/backend/convex';
import { useQuery, useMutation } from 'convex/react';
import { useState } from 'react';

export default function EventsPage() {
  const apiAny = api as any;
  const events = useQuery(apiAny.events.listEvents);
  const createEvent = useMutation(apiAny.events.createEvent);
  const register = useMutation(apiAny.events.registerForEvent);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<'virtual' | 'physical'>('virtual');

  const handleCreate = async () => {
    if (!title || !description || !date) return;
    await createEvent({ title, description, date: Number(date), type });
    setTitle('');
    setDescription('');
    setDate('');
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <h1 className='text-2xl font-semibold mb-4'>Events</h1>
      <div className='grid md:grid-cols-4 gap-2 mb-4'>
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
          value={date}
          onChange={(e) => setDate(e.target.value)}
          placeholder='Timestamp'
          className='border rounded px-3 py-2'
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className='border rounded px-3 py-2'
        >
          <option value='virtual'>Virtual</option>
          <option value='physical'>Physical</option>
        </select>
      </div>
      <button
        onClick={handleCreate}
        className='bg-blue-600 text-white px-4 py-2 rounded'
      >
        Create
      </button>
      <ul className='mt-6 space-y-2'>
        {(events || []).map((ev) => (
          <li
            key={(ev as any)._id}
            className='border rounded p-3 text-sm flex justify-between'
          >
            <div>
              <div className='font-medium'>{(ev as any).title}</div>
              <div className='text-gray-600'>{(ev as any).description}</div>
            </div>
            <button
              onClick={() => register({ eventId: (ev as any)._id })}
              className='bg-gray-900 text-white px-3 py-1 rounded'
            >
              Register
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
