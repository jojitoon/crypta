'use client';
import { api } from '@repo/backend/convex';
import { Id } from '@repo/backend/dataModel';
import { useQuery, useMutation } from 'convex/react';
import { useState } from 'react';

export default function AIPage() {
  const profile = useQuery(api.ai.getProfile);
  const recs = useQuery(api.ai.listRecommendations);
  const upsertProfile = useMutation(api.ai.upsertProfile);
  const startSession = useMutation(api.ai.startSession);
  const sendMessage = useMutation(api.ai.sendMessage);
  const [message, setMessage] = useState('');
  const [sessionId, setSessionId] = useState<Id<'aiSessions'> | null>(null);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await upsertProfile({
      preferredLevel:
        (form.get('level') as 'beginner' | 'intermediate' | 'advanced') ||
        undefined,
      topics: form.get('topics')
        ? String(form.get('topics'))
            .split(',')
            .map((t) => t.trim())
        : undefined,
      goals: (form.get('goals') as string) || undefined,
    });
  };

  const ensureSession = async (): Promise<Id<'aiSessions'>> => {
    if (sessionId) return sessionId;
    const { sessionId: id } = await startSession({});
    setSessionId(id);
    return id;
  };

  const handleSend = async () => {
    if (!message) return;
    const id = await ensureSession();
    await sendMessage({ sessionId: id, content: message });
    setMessage('');
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <h1 className='text-2xl font-semibold mb-4'>AI Personalization</h1>
      <form onSubmit={handleSave} className='grid gap-3 mb-8'>
        <div>
          <label className='block text-sm text-gray-600 mb-1'>
            Preferred Level
          </label>
          <select
            name='level'
            defaultValue={profile?.preferredLevel || ''}
            className='w-full border rounded px-3 py-2'
          >
            <option value=''>Auto</option>
            <option value='beginner'>Beginner</option>
            <option value='intermediate'>Intermediate</option>
            <option value='advanced'>Advanced</option>
          </select>
        </div>
        <div>
          <label className='block text-sm text-gray-600 mb-1'>
            Topics (comma separated)
          </label>
          <input
            name='topics'
            defaultValue={(profile?.topics || []).join(', ')}
            className='w-full border rounded px-3 py-2'
          />
        </div>
        <div>
          <label className='block text-sm text-gray-600 mb-1'>Goals</label>
          <textarea
            name='goals'
            defaultValue={profile?.goals || ''}
            className='w-full border rounded px-3 py-2'
          />
        </div>
        <button className='bg-blue-600 text-white px-4 py-2 rounded'>
          Save
        </button>
      </form>

      <div className='mb-8'>
        <h2 className='text-xl font-semibold mb-2'>Recommendations</h2>
        <ul className='space-y-2'>
          {(recs || []).map((r) => (
            <li key={r._id} className='border rounded p-3 text-sm'>
              <div className='text-gray-800'>{r.reason}</div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className='text-xl font-semibold mb-2'>Chat</h2>
        <div className='flex gap-2'>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Ask the tutor...'
            className='flex-1 border rounded px-3 py-2'
          />
          <button
            onClick={handleSend}
            className='bg-gray-900 text-white px-4 py-2 rounded'
          >
            Send
          </button>
        </div>
        <p className='text-xs text-gray-500 mt-2'>
          Assistant replies are stubbed server-side; integrate your provider
          later.
        </p>
      </div>
    </div>
  );
}
