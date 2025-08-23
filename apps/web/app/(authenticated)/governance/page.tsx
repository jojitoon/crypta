'use client';
import { api } from '@repo/backend/convex';
import { useQuery, useMutation } from 'convex/react';
import { useState } from 'react';

export default function GovernancePage() {
  const proposals = useQuery(api.governance.listProposals, {});
  const createProposal = useMutation(api.governance.createProposal);
  const castVote = useMutation(api.governance.castVote);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    if (!title || !description) return;
    await createProposal({ title, description });
    setTitle('');
    setDescription('');
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <h1 className='text-2xl font-semibold mb-4'>Governance</h1>
      <div className='grid md:grid-cols-2 gap-2 mb-4'>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='Proposal title'
          className='border rounded px-3 py-2'
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='Description'
          className='border rounded px-3 py-2'
        />
      </div>
      <button
        onClick={handleCreate}
        className='bg-blue-600 text-white px-4 py-2 rounded'
      >
        Create Proposal
      </button>
      <ul className='mt-6 space-y-2'>
        {(proposals || []).map((p) => (
          <li
            key={p._id}
            className='border rounded p-3 text-sm flex justify-between'
          >
            <div>
              <div className='font-medium'>{p.title}</div>
              <div className='text-gray-600'>{p.description}</div>
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => castVote({ proposalId: p._id, support: true })}
                className='bg-green-600 text-white px-3 py-1 rounded'
              >
                Yes
              </button>
              <button
                onClick={() => castVote({ proposalId: p._id, support: false })}
                className='bg-red-600 text-white px-3 py-1 rounded'
              >
                No
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
