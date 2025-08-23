'use client';
import { api } from '@repo/backend/convex';
import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';

export default function ConsultingPage() {
  const apiAny = api as any;
  const myBookings = useQuery(apiAny.consulting.myBookings);
  const setAvailability = useMutation(apiAny.consulting.setAvailability);
  const requestBooking = useMutation(apiAny.consulting.requestBooking);
  const [coachId, setCoachId] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');

  const handleBook = async () => {
    if (!coachId || !startAt || !endAt) return;
    await requestBooking({
      coachUserId: coachId as any,
      startAt: Number(startAt),
      endAt: Number(endAt),
    });
    setCoachId('');
    setStartAt('');
    setEndAt('');
  };

  return (
    <div className='max-w-4xl mx-auto p-6 grid gap-8'>
      <section>
        <h2 className='text-xl font-semibold mb-3'>Book a Session</h2>
        <div className='grid md:grid-cols-3 gap-2'>
          <input
            value={coachId}
            onChange={(e) => setCoachId(e.target.value)}
            placeholder='Coach userId'
            className='border rounded px-3 py-2'
          />
          <input
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            placeholder='Start timestamp'
            className='border rounded px-3 py-2'
          />
          <input
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            placeholder='End timestamp'
            className='border rounded px-3 py-2'
          />
        </div>
        <button
          onClick={handleBook}
          className='mt-2 bg-blue-600 text-white px-4 py-2 rounded'
        >
          Request Booking
        </button>
      </section>

      <section>
        <h2 className='text-xl font-semibold mb-3'>My Bookings</h2>
        <ul className='space-y-2'>
          {(myBookings || []).map((b) => (
            <li key={(b as any)._id} className='border rounded p-3 text-sm'>
              {(b as any).startAt} → {(b as any).endAt} — {(b as any).status}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
