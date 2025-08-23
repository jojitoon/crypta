'use client';
import { api } from '@repo/backend/convex';
import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';

export default function WalletPage() {
  const wallets = useQuery(api.web3.myWallets);
  const staking = useQuery(api.web3.myStaking);
  const linkWallet = useMutation(api.web3.linkWallet);
  const recordStaking = useMutation(api.web3.recordStaking);
  const [address, setAddress] = useState('');
  const [token, setToken] = useState('');
  const [amount, setAmount] = useState('');

  const handleLink = async () => {
    if (!address) return;
    await linkWallet({ address });
    setAddress('');
  };

  const handleStake = async () => {
    if (!token || !amount) return;
    await recordStaking({
      tokenAddress: token,
      chainId: 8453,
      amount: Number(amount),
    });
    setToken('');
    setAmount('');
  };

  return (
    <div className='max-w-3xl mx-auto p-6 grid gap-8'>
      <section>
        <h2 className='text-xl font-semibold mb-3'>Link Wallet</h2>
        <div className='flex gap-2'>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder='0x...'
            className='flex-1 border rounded px-3 py-2'
          />
          <button
            onClick={handleLink}
            className='bg-blue-600 text-white px-4 py-2 rounded'
          >
            Link
          </button>
        </div>
        <ul className='mt-3 text-sm space-y-1'>
          {(wallets || []).map((w) => (
            <li key={w._id} className='text-gray-700'>
              {w.address}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className='text-xl font-semibold mb-3'>Record Staking</h2>
        <div className='grid gap-2'>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder='Token address'
            className='border rounded px-3 py-2'
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder='Amount'
            className='border rounded px-3 py-2'
          />
          <button
            onClick={handleStake}
            className='bg-gray-900 text-white px-4 py-2 rounded'
          >
            Record
          </button>
        </div>
        <ul className='mt-3 text-sm space-y-1'>
          {(staking || []).map((s) => (
            <li key={s._id} className='text-gray-700'>
              {s.tokenAddress}: {s.amount}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
