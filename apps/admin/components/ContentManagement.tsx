'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@repo/backend/convex';
import { toast } from 'sonner';
import { Id } from '@repo/backend/dataModel';

export function ContentManagement() {
  const [activeSection, setActiveSection] = useState<
    'webinars' | 'shorts' | 'events'
  >('webinars');
  const [searchTerm, setSearchTerm] = useState('');

  const webinars = useQuery(api.admin.getAllWebinars);
  const shorts = useQuery(api.admin.getAllShorts);
  const events = useQuery(api.admin.getAllEvents);

  const deleteWebinar = useMutation(api.admin.deleteWebinar);
  const deleteShort = useMutation(api.admin.deleteShort);
  const deleteEvent = useMutation(api.admin.deleteEvent);

  const handleDeleteWebinar = async (
    webinarId: Id<'webinars'>,
    title: string
  ) => {
    if (!confirm(`Are you sure you want to delete webinar "${title}"?`)) return;

    try {
      await deleteWebinar({ webinarId });
      toast.success('Webinar deleted successfully');
    } catch (error) {
      toast.error('Failed to delete webinar');
    }
  };

  const handleDeleteShort = async (shortId: Id<'shorts'>, title: string) => {
    if (!confirm(`Are you sure you want to delete short "${title}"?`)) return;

    try {
      await deleteShort({ shortId });
      toast.success('Short deleted successfully');
    } catch (error) {
      toast.error('Failed to delete short');
    }
  };

  const handleDeleteEvent = async (eventId: Id<'events'>, title: string) => {
    if (!confirm(`Are you sure you want to delete event "${title}"?`)) return;

    try {
      await deleteEvent({ eventId });
      toast.success('Event deleted successfully');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  if (!webinars || !shorts || !events) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  const filteredWebinars = webinars.filter(
    (webinar) =>
      webinar.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      webinar.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredShorts = shorts.filter(
    (short) =>
      short.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      short.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold text-gray-900'>Content Management</h2>
        <div className='text-sm text-gray-600'>
          Webinars: {webinars.length} | Shorts: {shorts.length} | Events:{' '}
          {events.length}
        </div>
      </div>

      {/* Section Navigation */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <div className='flex space-x-4'>
          <button
            onClick={() => setActiveSection('webinars')}
            className={`px-4 py-2 rounded-md font-medium ${
              activeSection === 'webinars'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Webinars ({webinars.length})
          </button>
          <button
            onClick={() => setActiveSection('shorts')}
            className={`px-4 py-2 rounded-md font-medium ${
              activeSection === 'shorts'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Shorts ({shorts.length})
          </button>
          <button
            onClick={() => setActiveSection('events')}
            className={`px-4 py-2 rounded-md font-medium ${
              activeSection === 'events'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Events ({events.length})
          </button>
        </div>
      </div>

      {/* Search */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <input
          type='text'
          placeholder='Search content...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        />
      </div>

      {/* Content */}
      {activeSection === 'webinars' && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredWebinars.map((webinar) => (
            <div
              key={webinar._id}
              className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'
            >
              <div className='p-6'>
                <div className='flex items-start justify-between mb-2'>
                  <h3 className='text-lg font-semibold text-gray-900 line-clamp-2'>
                    {webinar.title}
                  </h3>
                </div>

                <p className='text-sm text-gray-600 mb-4 line-clamp-3'>
                  {webinar.description}
                </p>

                <div className='space-y-2 mb-4'>
                  <div className='flex justify-between text-sm text-gray-500'>
                    <span>Host:</span>
                    <span className='font-medium'>{webinar.hostName}</span>
                  </div>
                  <div className='flex justify-between text-sm text-gray-500'>
                    <span>Scheduled:</span>
                    <span className='font-medium'>
                      {new Date(webinar.scheduledAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm text-gray-500'>
                    <span>Duration:</span>
                    <span className='font-medium'>{webinar.duration} min</span>
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      webinar.isLive
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {webinar.isLive ? 'Live' : 'Scheduled'}
                  </span>

                  <button
                    onClick={() =>
                      handleDeleteWebinar(webinar._id, webinar.title)
                    }
                    className='px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200'
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'shorts' && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredShorts.map((short) => (
            <div
              key={short._id}
              className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'
            >
              <div className='p-6'>
                <div className='flex items-start justify-between mb-2'>
                  <h3 className='text-lg font-semibold text-gray-900 line-clamp-2'>
                    {short.title}
                  </h3>
                </div>

                <p className='text-sm text-gray-600 mb-4 line-clamp-3'>
                  {short.description}
                </p>

                <div className='space-y-2 mb-4'>
                  <div className='flex justify-between text-sm text-gray-500'>
                    <span>Creator:</span>
                    <span className='font-medium'>{short.creatorName}</span>
                  </div>
                  <div className='flex justify-between text-sm text-gray-500'>
                    <span>Duration:</span>
                    <span className='font-medium'>{short.duration} min</span>
                  </div>
                  <div className='flex justify-between text-sm text-gray-500'>
                    <span>Views:</span>
                    <span className='font-medium'>{short.views || 0}</span>
                  </div>
                </div>

                {short.tags && short.tags.length > 0 && (
                  <div className='flex gap-1 mb-4'>
                    {short.tags.map((tag, index) => (
                      <span
                        key={index}
                        className='inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className='flex items-center justify-between'>
                  <span className='text-xs text-gray-500'>
                    {new Date(short.createdAt).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => handleDeleteShort(short._id, short.title)}
                    className='px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200'
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'events' && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredEvents.map((event) => (
            <div
              key={event._id}
              className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'
            >
              <div className='p-6'>
                <div className='flex items-start justify-between mb-2'>
                  <h3 className='text-lg font-semibold text-gray-900 line-clamp-2'>
                    {event.title}
                  </h3>
                </div>

                <p className='text-sm text-gray-600 mb-4 line-clamp-3'>
                  {event.description}
                </p>

                <div className='space-y-2 mb-4'>
                  <div className='flex justify-between text-sm text-gray-500'>
                    <span>Type:</span>
                    <span className='font-medium'>{event.type}</span>
                  </div>
                  <div className='flex justify-between text-sm text-gray-500'>
                    <span>Date:</span>
                    <span className='font-medium'>
                      {new Date(event.eventDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm text-gray-500'>
                    <span>Location:</span>
                    <span className='font-medium'>{event.location}</span>
                  </div>
                  <div className='flex justify-between text-sm text-gray-500'>
                    <span>Capacity:</span>
                    <span className='font-medium'>{event.capacity} people</span>
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      event.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {event.isActive ? 'Active' : 'Inactive'}
                  </span>

                  <button
                    onClick={() => handleDeleteEvent(event._id, event.title)}
                    className='px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200'
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {((activeSection === 'webinars' && filteredWebinars.length === 0) ||
        (activeSection === 'shorts' && filteredShorts.length === 0) ||
        (activeSection === 'events' && filteredEvents.length === 0)) && (
        <div className='text-center py-12'>
          <div className='text-4xl mb-4'>📝</div>
          <p className='text-gray-500'>
            No content found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
}
