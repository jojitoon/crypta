'use client';

import { useQuery } from 'convex/react';
import { api } from '@repo/backend/convex';
import MuxPlayer from '@mux/mux-player-react';

interface VideoPlayerProps {
  lessonId: string;
  className?: string;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
}

export function VideoPlayer({
  lessonId,
  className = '',
  onEnded,
  onTimeUpdate,
}: VideoPlayerProps) {
  const videoData = useQuery(api.mux.getMuxPlaybackUrl, {
    lessonId,
  });

  // Handle loading and error states
  if (!videoData) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
      >
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (videoData.status !== 'ready') {
    return (
      <div
        className={`flex items-center justify-center bg-yellow-50 rounded-lg p-8 ${className}`}
      >
        <div className='text-center'>
          <div className='text-yellow-500 text-4xl mb-2'>⏳</div>
          <p className='text-yellow-700 font-medium'>Video Processing</p>
          <p className='text-yellow-600 text-sm'>
            {videoData.status === 'uploading' && 'Video is being uploaded...'}
            {videoData.status === 'processing' && 'Video is being processed...'}
            {videoData.status === 'failed' && 'Video processing failed'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <MuxPlayer
      playbackId={videoData.playbackId}
      className='min-h-96'
      onEnded={onEnded}
      onTimeUpdate={(event) => onTimeUpdate?.(event.timeStamp)}
    />
  );
}
